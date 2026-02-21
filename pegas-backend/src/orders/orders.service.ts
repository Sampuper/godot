import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ProductionService } from '../production/production.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class OrdersService {
  private readonly defaultStages = ['CUT', 'SEWING', 'PAINT', 'ASSEMBLY', 'PACK'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
    private readonly productionService: ProductionService,
  ) {}

  async createFromWebhook(payload: {
    orderNumber: string;
    crmId?: string;
    clientName: string;
    clientPhone: string;
    carModel: string;
    complexity: string;
    isSpecial?: boolean;
  }) {
    return this.prisma.order.create({
      data: {
        orderNumber: payload.orderNumber,
        crmId: payload.crmId,
        clientName: payload.clientName,
        clientPhone: payload.clientPhone,
        carModel: payload.carModel,
        complexity: payload.complexity,
        isSpecial: payload.isSpecial ?? false,
        status: 'NEW',
        stages: {
          create: this.defaultStages.map((stageType) => ({
            stageType,
            status: 'NEW',
          })),
        },
      },
      include: {
        stages: true,
      },
    });
  }

  async sendToProduction(orderId: number) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'DISTRIBUTION' },
    });

    await this.telegramService.notify(`Order #${order.orderNumber} moved to DISTRIBUTION`);

    return order;
  }

  async assignWorkshop(orderId: number, workshopId: number) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        workshopId,
        status: 'IN_PRODUCTION',
      },
    });
  }

  async startStage(orderId: number, stageType: string) {
    await this.productionService.checkStageTransition(orderId, stageType);

    const stage = await this.prisma.orderStage.findFirst({
      where: { orderId, stageType },
    });

    if (!stage) {
      throw new BadRequestException('Stage not found');
    }

    return this.prisma.orderStage.update({
      where: { id: stage.id },
      data: { status: 'IN_PROGRESS' },
    });
  }
}
