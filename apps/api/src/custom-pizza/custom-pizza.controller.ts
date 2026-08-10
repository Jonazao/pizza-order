import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserEntity } from '../common/decorators/current-user.decorator';
import { CustomPizzaService } from './custom-pizza.service';
import { CreateCustomPizzaDto } from './dto/create-custom-pizza.dto';
import { CustomPizzaResponseDto } from './dto/custom-pizza-response.dto';
import { FindCustomPizzasQueryDto } from './dto/find-custom-pizzas-query.dto';
import { CUSTOM_PIZZA_ROUTES } from './routes';

@ApiTags('Custom Pizza')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(CUSTOM_PIZZA_ROUTES.base)
export class CustomPizzaController {
  constructor(private readonly customPizzaService: CustomPizzaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new persisted custom pizza build' })
  @ApiResponse({
    status: 201,
    description: 'Custom pizza created and persisted successfully',
    type: CustomPizzaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input parameters or categories' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: CurrentUserEntity,
    @Body() createCustomPizzaDto: CreateCustomPizzaDto,
  ) {
    return this.customPizzaService.create(user.id, createCustomPizzaDto);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve current authenticated user's custom pizzas (paginated, searchable, sortable)" })
  @ApiResponse({
    status: 200,
    description: 'User custom pizzas retrieved successfully',
    type: [CustomPizzaResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @CurrentUser() user: CurrentUserEntity,
    @Query() query: FindCustomPizzasQueryDto,
  ) {
    return this.customPizzaService.findAll(user.id, query);
  }
}
