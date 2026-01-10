import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from "class-validator"
import { UserRole } from "../../users/entities/user.entity"

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @MinLength(2)
  nombre: string

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole
}
