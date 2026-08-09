import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogItemResponseDto } from './dto/catalog-item-response.dto';
import { CATALOG_ROUTES } from './routes';

@ApiTags('Catalog')
@Controller(CATALOG_ROUTES.base)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all pizza catalog items' })
  @ApiResponse({ status: 200, description: 'List of catalog items returned successfully', type: [CatalogItemResponseDto] })
  async getCatalog(): Promise<CatalogItemResponseDto[]> {
    return this.catalogService.findAll();
  }
}
