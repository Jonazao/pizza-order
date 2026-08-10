import { ApiProperty } from '@nestjs/swagger';
import { CatalogItemResponseDto } from '../../catalog/dto/catalog-item-response.dto';

export class CustomPizzaResponseDto {
  @ApiProperty({
    example: '44444444-4444-4444-4444-444444444444',
    description: 'Unique identifier of the custom pizza',
  })
  id!: string;

  @ApiProperty({
    example: 'My Special Pepperoni Pizza',
    description: 'Name of the custom pizza',
  })
  name!: string;

  @ApiProperty({
    example: '11111111-1111-4111-8111-111111111111',
    description: 'User ID of the customer who created the pizza',
  })
  userId!: string;

  @ApiProperty({
    description: 'Selected crust catalog item',
    type: CatalogItemResponseDto,
  })
  crust!: CatalogItemResponseDto;

  @ApiProperty({
    description: 'Selected sauce catalog item',
    type: CatalogItemResponseDto,
  })
  sauce!: CatalogItemResponseDto;

  @ApiProperty({
    description: 'Selected base catalog item',
    type: CatalogItemResponseDto,
  })
  base!: CatalogItemResponseDto;

  @ApiProperty({
    description: 'Selected toppings catalog items',
    type: [CatalogItemResponseDto],
  })
  toppings!: CatalogItemResponseDto[];

  @ApiProperty({
    example: 12.50,
    description: 'Total dynamic cost of the custom pizza',
  })
  totalPrice!: number;

  @ApiProperty({
    example: '2026-08-09T07:42:44.161Z',
    description: 'Creation timestamp',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-09T07:42:44.161Z',
    description: 'Last update timestamp',
  })
  updatedAt!: Date;
}
