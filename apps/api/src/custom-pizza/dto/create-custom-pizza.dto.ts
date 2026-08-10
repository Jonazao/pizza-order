import { IsString, IsNotEmpty, IsUUID, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomPizzaDto {
  @ApiProperty({ example: 'My Special Pepperoni Pizza', description: 'Name of the custom pizza' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '33333333-3333-4333-8333-333333333301', description: 'Crust catalog item id' })
  @IsUUID()
  @IsNotEmpty()
  crustId!: string;

  @ApiProperty({ example: '33333333-3333-4333-8333-333333333305', description: 'Sauce catalog item id' })
  @IsUUID()
  @IsNotEmpty()
  sauceId!: string;

  @ApiProperty({ example: '33333333-3333-4333-8333-333333333308', description: 'Base catalog item id' })
  @IsUUID()
  @IsNotEmpty()
  baseId!: string;

  @ApiProperty({
    example: ['33333333-3333-4333-8333-333333333302'],
    description: 'Toppings catalog item ids',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  toppings?: string[];
}
