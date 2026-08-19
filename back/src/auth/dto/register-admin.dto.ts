import { IsEmail, IsString, MinLength, IsOptional } from "class-validator"

export class RegisterAdminDto {
  // Personal Info
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @MinLength(2)
  nombre: string

  @IsString()
  @IsOptional()
  telefono?: string

  // Business Info
  @IsString()
  @MinLength(2)
  nombreNegocio: string

  @IsString()
  @IsOptional()
  direccionNegocio?: string

  @IsString()
  @IsOptional()
  telefonoNegocio?: string

  @IsString()
  @IsOptional()
  logoUrl?: string
}
