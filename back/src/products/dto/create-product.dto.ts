import { IsString, IsNumber, IsOptional, Min, IsUrl } from "class-validator"

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
}
