import { serializeCustomPizza } from './custom-pizza.serializer';
import { CatalogCategory } from '../../catalog/enums/catalog-category.enum';
import { CustomPizza } from '../models/custom-pizza.model';

describe('custom-pizza.serializer', () => {
  const catalogItem = (id: string, price: number) => ({
    id,
    title: id,
    description: 'desc',
    price,
    category: CatalogCategory.TOPPINGS,
    isVegan: false,
    isHealthy: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as any;

  it('computes total price from ingredients and maps nested items', () => {
    const pizza = {
      id: 'pizza-1',
      name: 'My Pizza',
      userId: 'user-1',
      crust: catalogItem('crust-1', 3),
      sauce: catalogItem('sauce-1', 2),
      base: catalogItem('base-1', 1),
      toppings: [catalogItem('topping-1', 1.5), catalogItem('topping-2', 2.5)],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as CustomPizza;

    const result = serializeCustomPizza(pizza);
    expect(result.totalPrice).toBe(10);
    expect(result.crust?.id).toBe('crust-1');
    expect(result.toppings).toHaveLength(2);
  });

  it('handles missing associations with null', () => {
    const pizza = {
      id: 'pizza-2',
      name: 'Bare Pizza',
      userId: 'user-1',
      crust: undefined,
      sauce: undefined,
      base: undefined,
      toppings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as CustomPizza;

    const result = serializeCustomPizza(pizza);
    expect(result.crust).toBeNull();
    expect(result.sauce).toBeNull();
    expect(result.base).toBeNull();
    expect(result.totalPrice).toBe(0);
  });
});
