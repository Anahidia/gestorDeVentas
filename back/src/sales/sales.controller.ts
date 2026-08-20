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

  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.salesService.create(createSaleDto, req.user.id, req.user.businessId)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDEDOR)
  findAll(@Request() req) {
    return this.salesService.findAll(req.user.businessId)
  }

  @Get("my-sales")
  findMySales(@Request() req) {
    return this.salesService.findByVendedor(req.user.id)
  }

  @Get("stats")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDEDOR)
  getStats(@Request() req) {
    return this.salesService.getStats(req.user.businessId)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.salesService.findOne(id)
  }

  @Patch(":id/cancel")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDEDOR)
  cancel(@Param("id") id: string) {
    return this.salesService.cancel(id)
  }

  @Patch(":id/refund")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDEDOR)
  refund(@Param("id") id: string) {
    return this.salesService.refund(id)
  }
}
