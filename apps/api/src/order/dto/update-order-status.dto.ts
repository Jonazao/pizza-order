import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Target status for the order. Must be the exact next state in the transition chain.',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
