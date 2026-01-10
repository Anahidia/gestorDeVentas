import { Injectable, UnauthorizedException, ConflictException, Inject, forwardRef } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt" // <-- sin "type"
import * as bcrypt from "bcrypt"
import { UsersService } from "../users/users.service"
import type { LoginDto } from "./dto/login.dto"
import type { RegisterDto } from "./dto/register.dto"


@Injectable()
export class AuthService {
  constructor(
 @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email)
    if (existingUser) {
      throw new ConflictException("El email ya está registrado")
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10)
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    })

    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email)
    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas")
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciales inválidas")
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Usuario inactivo")
    }

    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
    }
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId)
  }
}
