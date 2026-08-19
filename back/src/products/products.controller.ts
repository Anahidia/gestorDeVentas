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
  BadRequestException,
  Request,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { memoryStorage } from "multer"
import { ProductsService } from "./products.service"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import { Express } from "express"
import { CloudinaryService } from "../config/cloudinary.service"

@Controller("products")
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDEDOR)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() dto: any,
    @Request() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (req?.user?.id) {
      dto.creadoPorId = req.user.id
    }

    if (file) {
      try {
        const result = await this.cloudinaryService.uploadImage(file)
        dto.imagenUrl = result.secure_url
      } catch (err: any) {
        console.warn("Cloudinary error (403/credentials), falling back to base64 data URL:", err.message || err)
        const mime = file.mimetype || "image/jpeg"
        const base64 = file.buffer.toString("base64")
        dto.imagenUrl = `data:${mime};base64,${base64}`
      }
    }

    dto.precio = Number(dto.precio)
    dto.stock = Number(dto.stock)

    if (dto.talles && typeof dto.talles === "string") {
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
  @Roles(UserRole.ADMIN, UserRole.VENDEDOR)
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
    }),
  )
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto | any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      try {
        const result = await this.cloudinaryService.uploadImage(file)
        updateProductDto.imagenUrl = result.secure_url
      } catch (err: any) {
        console.warn("Cloudinary error (403/credentials), falling back to base64 data URL:", err.message || err)
        const mime = file.mimetype || "image/jpeg"
        const base64 = file.buffer.toString("base64")
        updateProductDto.imagenUrl = `data:${mime};base64,${base64}`
      }
    }

    if (updateProductDto.precio) updateProductDto.precio = Number(updateProductDto.precio)
    if (updateProductDto.stock) updateProductDto.stock = Number(updateProductDto.stock)
    if (updateProductDto.talles && typeof updateProductDto.talles === "string") {
      updateProductDto.talles = JSON.parse(updateProductDto.talles)
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
