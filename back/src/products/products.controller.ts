import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { extname } from "path"
import  { ProductsService } from "./products.service"
import  { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import  { Express } from "express"

@Controller("products")
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("")
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
    }),
  )
  create(@Body() dto: any, @UploadedFile() file?: Express.Multer.File) {
  if (file) {
    dto.imagenUrl = `http://localhost:3001/uploads/${file.filename}`
  }

  dto.precio = Number(dto.precio)
  dto.stock = Number(dto.stock)

  if (dto.talles) {
    dto.talles = JSON.parse(dto.talles)
  }

  return this.productsService.create(dto)
}


  @Get()
  findAll(
    @Query("includeInactive") includeInactive?: string,
    @Query("categoryId") categoryId?: string,
    @Query("search") search?: string,
    @Query("talle") talle?: string,
  ) {
    return this.productsService.findAll(includeInactive === "true", categoryId, search, talle)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("")
          cb(null, `${randomName}${extname(file.originalname)}`)
        },
      }),
    }),
  )
  update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateProductDto.imagenUrl = `http://localhost:3001/uploads/${file.filename}`
    }
    return this.productsService.update(id, updateProductDto)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param("id") id: string) {
    return this.productsService.remove(id)
  }

  @Patch(":id/stock")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStock(@Param("id") id: string, @Body() body: { cantidad: number }) {
    return this.productsService.updateStock(id, body.cantidad)
  }
}
