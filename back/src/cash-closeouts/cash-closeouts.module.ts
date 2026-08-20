import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CashCloseout } from "./entities/cash-closeout.entity"
import { Sale } from "../sales/entities/sale.entity"
import { Order } from "../orders/entities/order.entity"
import { CashCloseoutsService } from "./cash-closeouts.service"
import { CashCloseoutsController } from "./cash-closeouts.controller"

@Module({
  imports: [TypeOrmModule.forFeature([CashCloseout, Sale, Order])],
  controllers: [CashCloseoutsController],
  providers: [CashCloseoutsService],
  exports: [CashCloseoutsService],
})
export class CashCloseoutsModule {}
