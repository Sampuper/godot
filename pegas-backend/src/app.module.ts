import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { ProductionModule } from './production/production.module';
import { RolesModule } from './roles/roles.module';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';
import { WorkshopsModule } from './workshops/workshops.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    OrdersModule,
    ProductionModule,
    TelegramModule,
    UsersModule,
    RolesModule,
    WorkshopsModule,
  ],
})
export class AppModule {}
