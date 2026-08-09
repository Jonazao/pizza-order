import { CustomPizza } from '../models/custom-pizza.model';
import { CustomPizzaResponseDto } from '../dto/custom-pizza-response.dto';
import { serializeCatalogItem } from '../../catalog/serializers/catalog-item.serializer';

export function serializeCustomPizza(pizza: CustomPizza): CustomPizzaResponseDto {
  const crustPrice = pizza.crust ? pizza.crust.price : 0;
  const saucePrice = pizza.sauce ? pizza.sauce.price : 0;
  const basePrice = pizza.base ? pizza.base.price : 0;
  const toppingsPrice = pizza.toppings
    ? pizza.toppings.reduce((sum, topping) => sum + topping.price, 0)
    : 0;

  const totalPrice = parseFloat((crustPrice + saucePrice + basePrice + toppingsPrice).toFixed(2));

  const serializeOptionalItem = (item: CustomPizza['crust']) =>
    item ? serializeCatalogItem(item) : null;

  return {
    id: pizza.id,
    name: pizza.name,
    userId: pizza.userId,
    crust: serializeOptionalItem(pizza.crust),
    sauce: serializeOptionalItem(pizza.sauce),
    base: serializeOptionalItem(pizza.base),
    toppings: (pizza.toppings || []).map(serializeCatalogItem),
    totalPrice,
    createdAt: pizza.createdAt,
    updatedAt: pizza.updatedAt,
  };
}
