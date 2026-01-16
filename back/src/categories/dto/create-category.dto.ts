import { IsString, IsNotEmpty } from "class-validator"

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  nombre: string
}
