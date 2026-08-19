import { IsEmail, IsString, MinLength, IsOptional } from "class-validator"

export class RegisterEmployeeDto {
  @IsString()
  inviteCode: string

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
}
