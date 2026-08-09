import { IsString, IsNotEmpty, IsUUID, IsArray, IsOptional } from 'class-validator';

export class CreateCustomPizzaDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  crustId!: string;

  @IsUUID()
  @IsNotEmpty()
  sauceId!: string;

  @IsUUID()
  @IsNotEmpty()
  baseId!: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  toppings?: string[];
}
