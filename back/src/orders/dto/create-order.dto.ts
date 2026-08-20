import { IsUUID, IsInt, Min, IsString, IsOptional, IsNumber, IsDateString } from "class-validator"

export class CreateOrderDto {
  @IsUUID()
  productoId: string

  @IsInt()
  @Min(1)
  cantidad: number

  @IsString()
  @IsOptional()
  talle?: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  sena?: number

  @IsDateString()
  @IsOptional()
  fechaExpiracion?: string

  @IsString()
  @IsOptional()
  clienteNombre?: string

  @IsString()
  @IsOptional()
  clienteTelefono?: string

  @IsString()
  @IsOptional()
  notas?: string
}