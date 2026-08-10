import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemInputDto {
  @ApiProperty({
    example: '44444444-4444-4444-4444-444444444444',
    description: 'Custom pizza id to include in the order',
  })
  @IsUUID()
  @IsNotEmpty()
  customPizzaId!: string;

  @ApiProperty({ example: 2, description: 'Quantity of this pizza to order', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
