import { ApiProperty } from '@nestjs/swagger';
import { CatalogItemResponseDto } from '../../catalog/dto/catalog-item-response.dto';

export class OrderIngredientSnapshotDto {
  @ApiProperty({ description: 'Crust catalog item snapshot', type: CatalogItemResponseDto })
  crust!: CatalogItemResponseDto;

  @ApiProperty({ description: 'Sauce catalog item snapshot', type: CatalogItemResponseDto })
  sauce!: CatalogItemResponseDto;

  @ApiProperty({ description: 'Base catalog item snapshot', type: CatalogItemResponseDto })
  base!: CatalogItemResponseDto;

  @ApiProperty({ description: 'Toppings catalog item snapshots', type: [CatalogItemResponseDto] })
  toppings!: CatalogItemResponseDto[];
}
