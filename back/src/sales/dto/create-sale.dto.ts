import { IsArray, IsString, IsOptional, ValidateNested, IsUUID, IsInt, Min } from "class-validator"
import { Type } from "class-transformer"

class SaleItemDto {
  @IsUUID()
  productoId: string

  @IsInt()
  @Min(1)
  cantidad: number
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[]

  @IsString()
  @IsOptional()
  notas?: string
}
