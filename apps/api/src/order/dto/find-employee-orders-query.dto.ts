import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FindOrdersQueryDto } from './find-orders-query.dto';

export class FindEmployeeOrdersQueryDto extends FindOrdersQueryDto {
  @ApiPropertyOptional({ example: 'John', description: 'Search by order id or customer name/email' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
