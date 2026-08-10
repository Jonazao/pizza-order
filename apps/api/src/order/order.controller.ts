import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserEntity } from '../common';
import { UserRole } from '../common/enums/user-role.enum';
import { OrderService } from './order.service';
import { ORDER_ROUTES } from './routes';
import { CreateOrderDto, FindEmployeeOrdersQueryDto, FindOrdersQueryDto, OrderResponseDto, UpdateOrderStatusDto } from './dto';
import { PaginatedOrdersResponse } from './interfaces';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(ORDER_ROUTES.base)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a new order from the customer\'s saved custom pizzas' })
  @ApiResponse({ status: 201, description: 'Order created successfully and set to Pending', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid payload or unknown custom pizza' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: requires Customer role' })
  async create(@CurrentUser() user: CurrentUserEntity, @Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.orderService.create(user.id, dto);
  }

  @Get()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Retrieve the authenticated customer\'s order history' })
  @ApiResponse({ status: 200, description: 'Order history retrieved successfully', type: OrderResponseDto, isArray: false })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: requires Customer role' })
  async findHistory(@CurrentUser() user: CurrentUserEntity, @Query() query: FindOrdersQueryDto): Promise<PaginatedOrdersResponse> {
    return this.orderService.findHistory(user.id, query);
  }

  @Get(ORDER_ROUTES.employee)
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Retrieve the employee order queue (excludes Delivered by default)' })
  @ApiResponse({ status: 200, description: 'Order queue retrieved successfully', type: OrderResponseDto, isArray: false })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: requires Employee role' })
  async findEmployeeQueue(@CurrentUser() user: CurrentUserEntity, @Query() query: FindEmployeeOrdersQueryDto): Promise<PaginatedOrdersResponse> {
    return this.orderService.findEmployeeQueue(user.id, user.role, query);
  }

  @Patch(`:id/${ORDER_ROUTES.status}`)
  @Roles(UserRole.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transition an order to the next state' })
  @ApiParam({ name: 'id', description: 'Order id' })
  @ApiResponse({ status: 200, description: 'Order status updated', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Invalid or concurrent transition' })
  async updateStatus(
    @CurrentUser() user: CurrentUserEntity,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.updateStatus(user.id, user.role, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Cancel a pending order (own orders only)' })
  @ApiParam({ name: 'id', description: 'Order id' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Order is not in Pending state' })
  async cancel(@CurrentUser() user: CurrentUserEntity, @Param('id') id: string): Promise<{ message: string }> {
    return this.orderService.cancel(user.id, id);
  }
}
