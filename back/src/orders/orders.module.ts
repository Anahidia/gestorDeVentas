import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { OrdersService } from "./orders.service"
import { OrdersController } from "./orders.controller"
import { Order } from "./entities/order.entity"
import { ProductsModule } from "../products/products.module"

@Module({
  imports: [TypeOrmModule.forFeature([Order]),
  forwardRef(() => ProductsModule),
   ScheduleModule.forRoot()],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
