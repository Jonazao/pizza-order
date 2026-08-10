import { ApiProperty } from '@nestjs/swagger';
import { CustomPizzaResponseDto } from './custom-pizza-response.dto';

export class PaginatedCustomPizzasResponseDto {
  @ApiProperty({ type: [CustomPizzaResponseDto] })
  items!: CustomPizzaResponseDto[];

  @ApiProperty({ example: 1 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;
}
