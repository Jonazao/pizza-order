import { ApiProperty } from '@nestjs/swagger';
import { CatalogCategory } from '../enums/catalog-category.enum';

export class CatalogItemResponseDto {
  @ApiProperty({
    example: '33333333-3333-3333-3333-333333333301',
    description: 'Unique identifier of the catalog item (UUID)',
  })
  id!: string;

  @ApiProperty({
    example: 'Classic Hand-Tossed Crust',
    description: 'Title of the catalog item',
  })
  title!: string;

  @ApiProperty({
    example: 'Traditional hand-tossed wheat crust, crispy on the outside.',
    description: 'Detailed description of the catalog item',
  })
  description!: string;

  @ApiProperty({
    example: 3.00,
    description: 'Price markup of the catalog item',
    type: Number,
  })
  price!: number;

  @ApiProperty({
    example: CatalogCategory.CRUST,
    description: 'Category section of the catalog item',
    enum: CatalogCategory,
  })
  category!: CatalogCategory;

  @ApiProperty({
    example: true,
    description: 'Whether the item is vegan-friendly',
  })
  isVegan!: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the item is a healthy dietary choice',
  })
  isHealthy!: boolean;

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
