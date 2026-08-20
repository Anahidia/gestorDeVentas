import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { OrdersService } from "./orders.service"
import { OrdersController } from "./orders.controller"
import { Order } from "./entities/order.entity"
import { Sale, SaleStatus } from "../sales/entities/sale.entity"
import { SaleItem } from "../sales/entities/sale-item.entity"
import { ProductsModule } from "../products/products.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Sale, SaleItem]),
    forwardRef(() => ProductsModule),
    ScheduleModule.forRoot(),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
