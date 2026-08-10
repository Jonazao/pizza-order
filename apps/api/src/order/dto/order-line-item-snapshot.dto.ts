import { ApiProperty } from '@nestjs/swagger';
import { OrderIngredientSnapshotDto } from './order-ingredient-snapshot.dto';

export class OrderLineItemSnapshotDto {
  @ApiProperty({
    example: '44444444-4444-4444-4444-444444444444',
    description: 'Reference to the custom pizza that generated this line (snapshot only, no FK)',
  })
  customPizzaId!: string;

  @ApiProperty({ example: 'My Special Pepperoni Pizza', description: 'Custom pizza name snapshot' })
  name!: string;

  @ApiProperty({ example: 2, description: 'Quantity of this pizza in the order' })
  quantity!: number;

  @ApiProperty({ example: 12.5, description: 'Unit price of the custom pizza snapshot' })
  unitPrice!: number;

  @ApiProperty({ example: 25, description: 'Line total (unitPrice * quantity)' })
  lineTotal!: number;

  @ApiProperty({ description: 'Ingredient snapshots at order time', type: OrderIngredientSnapshotDto })
  ingredients!: OrderIngredientSnapshotDto;
}
