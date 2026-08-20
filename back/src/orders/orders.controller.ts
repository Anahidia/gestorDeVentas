import { Controller, Get, Post, Param, Patch, UseGuards, Body, Req } from "@nestjs/common"
import { OrdersService } from "./orders.service"
import { CreateOrderDto } from "./dto/create-order.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.ordersService.create(createOrderDto, req.user.id, req.user.businessId)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Req() req) {
    return this.ordersService.findAll(req.user.businessId)
  }

  @Get("active")
  findActive(@Req() req) {
    return this.ordersService.findActive(req.user.businessId)
  }

  @Get("my-orders")
  findMyOrders(@Req() req) {
    return this.ordersService.findByVendedor(req.user.id)
  }

  @Get("stats")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats(@Req() req) {
    return this.ordersService.getStats(req.user.businessId)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(id)
  }

  @Patch(":id/complete")
  complete(@Param("id") id: string) {
    return this.ordersService.complete(id)
  }

  @Patch(":id/cancel")
  cancel(@Param("id") id: string) {
    return this.ordersService.cancel(id)
  }
}
