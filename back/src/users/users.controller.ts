import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from "@nestjs/common"
import { UsersService } from "./users.service"   // <-- CORRECTO
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "./entities/user.entity"


@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll()
  }

  @Get("business/:businessId")
  @Roles(UserRole.ADMIN)
  findByBusiness(@Param("businessId") businessId: string) {
    return this.usersService.findByBusiness(businessId)
  }

  @Get(":id")
  @Roles(UserRole.ADMIN)
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id)
  }

  @Patch(":id/shift")
  toggleShift(@Param("id") id: string) {
    return this.usersService.toggleShift(id)
  }

  @Patch(":id/department")
  @Roles(UserRole.ADMIN)
  updateDepartment(@Param("id") id: string, @Body() body: { departamento: string }) {
    return this.usersService.updateDepartment(id, body.departamento)
  }

  @Patch(":id/code")
  @Roles(UserRole.ADMIN)
  updateEmployeeCode(@Param("id") id: string, @Body() body: { codigoEmpleado: string }) {
    return this.usersService.updateEmployeeCode(id, body.codigoEmpleado)
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  update(@Param("id") id: string, @Body() updateData: Partial<any>) {
    return this.usersService.update(id, updateData)
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  remove(@Param("id") id: string) {
    return this.usersService.remove(id)
  }
}
