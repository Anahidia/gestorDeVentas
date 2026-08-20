import { Controller, Get, Post, Body, UseGuards, Request, Param } from "@nestjs/common"
import { CashCloseoutsService } from "./cash-closeouts.service"
import { CreateCashCloseoutDto } from "./dto/create-cash-closeout.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"

@Controller("cash-closeouts")
@UseGuards(JwtAuthGuard)
export class CashCloseoutsController {
  constructor(private readonly closeoutsService: CashCloseoutsService) {}

  @Get("current-summary")
  getCurrentSummary(@Request() req: any) {
    return this.closeoutsService.getCurrentSummary(req.user.businessId, req.user.id)
  }

  @Post()
  create(@Body() dto: CreateCashCloseoutDto, @Request() req: any) {
    return this.closeoutsService.create(dto, req.user.id, req.user.businessId)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDEDOR)
  findAll(@Request() req: any) {
    return this.closeoutsService.findAll(req.user.businessId)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.closeoutsService.findOne(id)
  }
}
