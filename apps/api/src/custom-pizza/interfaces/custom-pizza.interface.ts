import { CustomPizzaResponseDto } from '../dto/custom-pizza-response.dto';

export interface CustomPizzaAttributes {
  id?: string;
  name: string;
  userId: string;
  crustId: string;
  sauceId: string;
  baseId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedCustomPizzasResponse {
  items: CustomPizzaResponseDto[];
  total: number;
  page: number;
  limit: number;
}
