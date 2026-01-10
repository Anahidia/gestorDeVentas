import { IsString, IsNumber, IsOptional, Min, IsUrl, IsBoolean } from "class-validator"

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  nombre?: string

  @IsString()
  @IsOptional()
  descripcion?: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  precio?: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number

  @IsUrl()
  @IsOptional()
  imagenUrl?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
