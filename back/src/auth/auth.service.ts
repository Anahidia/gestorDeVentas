import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Inject, forwardRef } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { UsersService } from "../users/users.service"
import { UserRole } from "../users/entities/user.entity"
import type { LoginDto } from "./dto/login.dto"
import type { RegisterDto } from "./dto/register.dto"
import type { RegisterAdminDto } from "./dto/register-admin.dto"
import type { RegisterEmployeeDto } from "./dto/register-employee.dto"

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private generateInviteCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = "L7D-"
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const existingUser = await this.usersService.findByEmail(dto.email)
    if (existingUser) {
      throw new ConflictException("El email ya está registrado")
    }

    let inviteCode = this.generateInviteCode()
    let existingBusiness = await this.usersService.findBusinessByInviteCode(inviteCode)
    while (existingBusiness) {
      inviteCode = this.generateInviteCode()
      existingBusiness = await this.usersService.findBusinessByInviteCode(inviteCode)
    }

    const business = await this.usersService.createBusiness({
      nombre: dto.nombreNegocio,
      direccion: dto.direccionNegocio,
      telefono: dto.telefonoNegocio,
      logoUrl: dto.logoUrl,
      inviteCode,
    })

    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      nombre: dto.nombre,
      telefono: dto.telefono,
      role: UserRole.ADMIN,
      businessId: business.id,
    })

    const payload = { sub: user.id, email: user.email, role: user.role, businessId: business.id }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        telefono: user.telefono,
        role: user.role,
      },
      business: {
        id: business.id,
        nombre: business.nombre,
        inviteCode: business.inviteCode,
        logoUrl: business.logoUrl,
      },
    }
  }

  async registerEmployee(dto: RegisterEmployeeDto) {
    const existingUser = await this.usersService.findByEmail(dto.email)
    if (existingUser) {
      throw new ConflictException("El email ya está registrado")
    }

    const business = await this.usersService.findBusinessByInviteCode(dto.inviteCode)
    if (!business) {
      throw new BadRequestException("El código de negocio es inválido o no existe")
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      nombre: dto.nombre,
      telefono: dto.telefono,
      role: UserRole.VENDEDOR,
      businessId: business.id,
    })

    const payload = { sub: user.id, email: user.email, role: user.role, businessId: business.id }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        telefono: user.telefono,
        role: user.role,
      },
      business: {
        id: business.id,
        nombre: business.nombre,
        logoUrl: business.logoUrl,
      },
    }
  }

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

    const payload = { sub: user.id, email: user.email, role: user.role, businessId: user.businessId }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        telefono: user.telefono,
        role: user.role,
      },
      business: user.business
        ? {
            id: user.business.id,
            nombre: user.business.nombre,
            direccion: user.business.direccion,
            telefono: user.business.telefono,
            logoUrl: user.business.logoUrl,
            inviteCode: user.business.inviteCode,
          }
        : null,
    }
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId)
  }
}
