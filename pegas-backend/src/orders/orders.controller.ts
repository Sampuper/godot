import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('webhook')
  createFromCrm(
    @Body()
    body: {
      orderNumber: string;
      crmId?: string;
      clientName: string;
      clientPhone: string;
      carModel: string;
      complexity: string;
      isSpecial?: boolean;
    },
  ) {
    return this.ordersService.createFromWebhook(body);
  }

  @Post(':id/send-to-production')
  @Roles('MANAGER')
  sendToProduction(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.sendToProduction(id);
  }

  @Patch(':id/assign-workshop')
  @Roles('MANAGER')
  assignWorkshop(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { workshopId: number },
  ) {
    return this.ordersService.assignWorkshop(id, body.workshopId);
  }

  @Post(':id/stages/:stageType/start')
  @Roles('CUTTER')
  startStage(
    @Param('id', ParseIntPipe) id: number,
    @Param('stageType') stageType: string,
  ) {
    return this.ordersService.startStage(id, stageType.toUpperCase());
  }
}
