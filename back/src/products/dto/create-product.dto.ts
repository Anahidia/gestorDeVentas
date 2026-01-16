import { IsString, IsNumber, IsOptional, Min, IsUrl, IsArray, ValidateNested, IsUUID } from "class-validator"
import { Type } from "class-transformer"

class CreateProductSizeDto {
  @IsString()
  talle: string

  @IsNumber()
  @Min(0)
  stock: number
}

export class CreateProductDto {
  @IsString()
  nombre: string

  @IsString()
  @IsOptional()
  descripcion?: string

  @IsNumber()
  @Min(0)
  precio: number

  @IsNumber()
  @Min(0)
  stock: number

  @IsUrl()
  @IsOptional()
  imagenUrl?: string

  @IsUUID()
  @IsOptional()
  categoryId?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSizeDto)
  @IsOptional()
  talles?: CreateProductSizeDto[]
}
