import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SalesService } from "./sales.service"
import { SalesController } from "./sales.controller"
import { Sale } from "./entities/sale.entity"
import { SaleItem } from "./entities/sale-item.entity"
import { ProductsModule } from "../products/products.module"

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem]), 
    forwardRef(() => ProductsModule)
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
