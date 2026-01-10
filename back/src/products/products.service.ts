import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Product } from "./entities/product.entity"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"
import { OrdersService } from "src/orders/orders.service"
import cloudinary from "../config/cloudinary.config" // 🔹 importa la config de Cloudinary
import fs from "fs"

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  // Crear producto con imagen opcional
  async create(createProductDto: CreateProductDto, file?: Express.Multer.File): Promise<Product> {
    console.log("[v0] Creating product:", createProductDto)

    // 🔹 Subir imagen a Cloudinary si hay archivo
    let imagenUrl: string | undefined
    if (file) {
      try {
        const result = await cloudinary.uploader.upload(file.path)
        imagenUrl = result.secure_url
      } catch (error) {
        console.error("Error subiendo imagen a Cloudinary:", error)
      } finally {
        // 🔹 borrar archivo local
        fs.unlink(file.path, () => {})
      }
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      ...(imagenUrl && { imagenUrl }), // solo si existe
    })

    const saved = await this.productsRepository.save(product)
    console.log("[v0] Product created:", saved)
    return saved
  }

  async findAll(includeInactive = false): Promise<Product[]> {
    const where = includeInactive ? {} : { isActive: true }
    return this.productsRepository.find({
      where,
      order: { nombre: "ASC" },
    })
  }

  async findOne(id: string): Promise<Product> {
    console.log("[v0] Finding product with id:", id)
    const product = await this.productsRepository.findOne({ where: { id } })
    if (!product) {
      throw new NotFoundException("Producto no encontrado")
    }
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File): Promise<Product> {
    const product = await this.findOne(id)

    // 🔹 Subir nueva imagen si hay archivo
    if (file) {
      try {
        const result = await cloudinary.uploader.upload(file.path)
        updateProductDto.imagenUrl = result.secure_url
      } catch (error) {
        console.error("Error subiendo imagen a Cloudinary:", error)
      } finally {
        fs.unlink(file.path, () => {})
      }
    }

    Object.assign(product, updateProductDto)
    return this.productsRepository.save(product)
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id)
    product.isActive = false
    await this.productsRepository.save(product)
  }

  async updateStock(id: string, cantidad: number): Promise<Product> {
    const product = await this.findOne(id)
    product.stock += cantidad
    if (product.stock < 0) {
      throw new BadRequestException("Stock no puede ser negativo")
    }
    return this.productsRepository.save(product)
  }

  async reserveStock(id: string, cantidad: number): Promise<Product> {
    const product = await this.findOne(id)
    if (product.stock - product.stockReservado < cantidad) {
      throw new BadRequestException("Stock insuficiente para reservar")
    }
    product.stockReservado += cantidad
    return this.productsRepository.save(product)
  }

  async releaseStock(id: string, cantidad: number): Promise<Product> {
    const product = await this.findOne(id)
    product.stockReservado -= cantidad
    if (product.stockReservado < 0) {
      product.stockReservado = 0
    }
    return this.productsRepository.save(product)
  }

  async decreaseStock(id: string, cantidad: number): Promise<Product> {
    const product = await this.findOne(id)
    if (product.stock < cantidad) {
      throw new BadRequestException("Stock insuficiente")
    }
    product.stock -= cantidad
    return this.productsRepository.save(product)
  }
}
