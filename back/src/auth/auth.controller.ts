import { Controller, Post, Get, Body, UseGuards, Request } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { RegisterAdminDto } from "./dto/register-admin.dto"
import { RegisterEmployeeDto } from "./dto/register-employee.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Post("register-admin")
  registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
    return this.authService.registerAdmin(registerAdminDto)
  }

  @Post("register-employee")
  registerEmployee(@Body() registerEmployeeDto: RegisterEmployeeDto) {
    return this.authService.registerEmployee(registerEmployeeDto)
  }

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user
  }
}
