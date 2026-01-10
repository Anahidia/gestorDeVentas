import { Controller, Get, Post, Param, Patch, UseGuards, Request, Body } from "@nestjs/common"
import { SalesService } from "./sales.service"
import { CreateSaleDto } from "./dto/create-sale.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@Controller("sales")
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ✅ Usar @Body() para que NestJS reciba el body correctamente
  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.salesService.create(createSaleDto, req.user.id)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.salesService.findAll()
  }

  @Get("my-sales")
  findMySales(@Request() req) {
    return this.salesService.findByVendedor(req.user.id)
  }

  @Get("stats")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.salesService.getStats()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.salesService.findOne(id)
  }

  @Patch(":id/cancel")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  cancel(@Param("id") id: string) {
    return this.salesService.cancel(id)
  }
}
