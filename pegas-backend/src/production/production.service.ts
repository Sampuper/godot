import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

  async checkStageTransition(orderId: number, stageType: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { stages: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status === 'CHANGED') {
      throw new BadRequestException('Stage transition is blocked while order has unconfirmed changes');
    }

    if (stageType === 'SEWING') {
      const cutStage = order.stages.find((stage: { stageType: string; status: string }) => stage.stageType === 'CUT');
      if (!cutStage || cutStage.status !== 'DONE') {
        throw new BadRequestException('SEWING cannot start while CUT stage is not DONE');
      }
    }

    return true;
  }

  async blockAllStages(orderId: number) {
    await this.prisma.orderStage.updateMany({
      where: { orderId },
      data: { status: 'BLOCKED' },
    });
  }

  async unlockStages(orderId: number) {
    await this.prisma.orderStage.updateMany({
      where: { orderId, status: 'BLOCKED' },
      data: { status: 'NEW' },
    });
  }
}
