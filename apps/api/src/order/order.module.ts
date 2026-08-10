import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './models/order.model';
import { User } from '../auth/models/user.model';
import { CustomPizzaModule } from '../custom-pizza/custom-pizza.module';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([Order, User]),
    CustomPizzaModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, RolesGuard],
  exports: [OrderService],
})
export class OrderModule {}
