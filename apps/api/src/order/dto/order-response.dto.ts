import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderLineItemSnapshotDto } from './order-line-item-snapshot.dto';

export class OrderResponseDto {
  @ApiProperty({
    example: '55555555-5555-4555-8555-555555555555',
    description: 'Unique identifier of the order',
  })
  id!: string;

  @ApiProperty({
    example: '11111111-1111-4111-8111-111111111111',
    description: 'User ID of the customer who placed the order',
  })
  userId!: string;

  @ApiProperty({ example: OrderStatus.PENDING, description: 'Current order state', enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty({ description: 'Ordered pizzas (server-computed snapshots)', type: [OrderLineItemSnapshotDto] })
  items!: OrderLineItemSnapshotDto[];

  @ApiProperty({ example: 25, description: 'Total price of the order' })
  totalPrice!: number;

  @ApiProperty({ example: '2026-08-09T07:42:44.161Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-09T07:42:44.161Z', description: 'Last update timestamp' })
  updatedAt!: Date;

  @ApiProperty({ example: 'John Doe', description: 'Customer display name (employee queue only)' })
  customerName?: string;
}
