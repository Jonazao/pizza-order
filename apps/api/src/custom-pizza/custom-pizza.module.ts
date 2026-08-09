import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomPizzaService } from './custom-pizza.service';
import { CustomPizzaController } from './custom-pizza.controller';
import { CustomPizza } from './models/custom-pizza.model';
import { CustomPizzaTopping } from './models/custom-pizza-topping.model';
import { CatalogItem } from '../catalog/models/catalog-item.model';

@Module({
  imports: [SequelizeModule.forFeature([CustomPizza, CustomPizzaTopping, CatalogItem])],
  controllers: [CustomPizzaController],
  providers: [CustomPizzaService],
  exports: [CustomPizzaService],
})
export class CustomPizzaModule {}
