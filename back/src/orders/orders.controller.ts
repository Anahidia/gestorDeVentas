import { Controller, Get, Post, Param, Patch, UseGuards, Body, Req } from "@nestjs/common"
import { OrdersService } from "./orders.service"
import { CreateOrderDto } from "./dto/create-order.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@Controller("orders")
@UseGuards(JwtAuthGuard) // Todos los endpoints requieren JWT
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    // ✅ req.user viene del JwtAuthGuard
    return this.ordersService.create(createOrderDto, req.user.id)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.ordersService.findAll()
  }

  @Get("active")
  findActive() {
    return this.ordersService.findActive()
  }

  @Get("my-orders")
  findMyOrders(@Req() req) {
    return this.ordersService.findByVendedor(req.user.id)
  }

  @Get("stats")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.ordersService.getStats()
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
