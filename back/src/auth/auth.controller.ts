import { Controller, Post, Get, Body, UseGuards, Request, UseInterceptors, UploadedFile } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { memoryStorage } from "multer"
import { AuthService } from "./auth.service"
import { CloudinaryService } from "../config/cloudinary.service"
import { LoginDto } from "./dto/login.dto"
import { RegisterDto } from "./dto/register.dto"
import { RegisterAdminDto } from "./dto/register-admin.dto"
import { RegisterEmployeeDto } from "./dto/register-employee.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Post("register-admin")
  @UseInterceptors(FileInterceptor("logo", { storage: memoryStorage() }))
  async registerAdmin(
    @Body() registerAdminDto: RegisterAdminDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    if (logo) {
      try {
        const uploadRes = await this.cloudinaryService.uploadImage(logo)
        registerAdminDto.logoUrl = uploadRes.secure_url
      } catch (err: any) {
        console.warn("Cloudinary logo error (403/credentials), falling back to base64 data URL:", err.message || err)
        const mime = logo.mimetype || "image/jpeg"
        const base64 = logo.buffer.toString("base64")
        registerAdminDto.logoUrl = `data:${mime};base64,${base64}`
      }
    }
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
