import { IsNumber, IsOptional, IsString, Min } from "class-validator"

export class CreateCashCloseoutDto {
  @IsNumber()
  @Min(0)
  fondoInicial: number

  @IsNumber()
  @Min(0)
  efectivoReal: number

  @IsString()
  @IsOptional()
  notas?: string
}
