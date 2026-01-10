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
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { ProductsService } from "./products.service"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { UserRole } from "../users/entities/user.entity"
import * as dotenv from "dotenv"
import * as stream from "stream"
dotenv.config()

// Configuración Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

@Controller("products")
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // =======================
  // 📸 SUBIR IMAGEN
  // =======================
  @Post("upload")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No se envió ningún archivo")
    }

    try {
      const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products", resource_type: "image" },
          (error, result) => {
            if (error) return reject(error)
            if (!result) return reject(new Error("No se subió la imagen"))
            resolve(result)
          }
        )

        const bufferStream = new stream.PassThrough()
        bufferStream.end(file.buffer)
        bufferStream.pipe(uploadStream)
      })

      return { url: uploadResult.secure_url }
    } catch (error) {
      console.error("Error subiendo a Cloudinary:", error)
      throw new BadRequestException("Error subiendo imagen a Cloudinary")
    }
  }

  // =======================
  // CRUD PRODUCTOS
  // =======================
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto)
  }

  @Get()
  findAll(@Query("includeInactive") includeInactive?: string) {
    return this.productsService.findAll(includeInactive === "true")
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
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
  updateStock(@Param("id") id: string, @Body("cantidad") cantidad: number) {
    return this.productsService.updateStock(id, cantidad)
  }
}
