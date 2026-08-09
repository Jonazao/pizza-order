import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CatalogItem } from './models/catalog-item.model';
import { CatalogItemResponseDto } from './dto/catalog-item-response.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(CatalogItem)
    private catalogItemModel: typeof CatalogItem,
  ) {}

  async findAll(): Promise<CatalogItemResponseDto[]> {
    const items = await this.catalogItemModel.findAll({
      order: [
        ['category', 'ASC'],
        ['title', 'ASC'],
      ],
    });
    return items.map(item => item.get({ plain: true }) as CatalogItemResponseDto);
  }
}
