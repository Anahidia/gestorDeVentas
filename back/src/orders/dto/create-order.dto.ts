import { IsUUID, IsInt, Min, IsString, IsOptional } from "class-validator"

export class CreateOrderDto {
  @IsUUID()
  productoId: string

  @IsInt()
  @Min(1)
  cantidad: number

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
    