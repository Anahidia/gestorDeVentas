import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProductsService } from "./products.service"
import { ProductsController } from "./products.controller"
import { Product } from "./entities/product.entity"
import { ProductSize } from "./entities/product-size.entity"
import { CategoriesModule } from "src/categories/categories.module"

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductSize]),
            CategoriesModule
],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
