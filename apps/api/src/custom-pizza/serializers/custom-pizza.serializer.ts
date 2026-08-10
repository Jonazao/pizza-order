import { CustomPizza } from '../models/custom-pizza.model';
import { CustomPizzaResponseDto } from '../dto/custom-pizza-response.dto';
import { serializeCatalogItem } from '../../catalog/serializers/catalog-item.serializer';
import { round2 } from '../../common/helpers/money.helper';

export function serializeCustomPizza(pizza: CustomPizza): CustomPizzaResponseDto {
  const crustPrice = pizza.crust.price;
  const saucePrice = pizza.sauce.price;
  const basePrice = pizza.base.price;
  const toppingsPrice = pizza.toppings.reduce((sum, topping) => sum + topping.price, 0);

  const totalPrice = round2(crustPrice + saucePrice + basePrice + toppingsPrice);

  return {
    id: pizza.id,
    name: pizza.name,
    userId: pizza.userId,
    crust: serializeCatalogItem(pizza.crust),
    sauce: serializeCatalogItem(pizza.sauce),
    base: serializeCatalogItem(pizza.base),
    toppings: pizza.toppings.map(serializeCatalogItem),
    totalPrice,
    createdAt: pizza.createdAt,
    updatedAt: pizza.updatedAt,
  };
}
