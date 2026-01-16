import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Product } from "./entities/product.entity"
import { ProductSize } from "./entities/product-size.entity"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(ProductSize)
    private readonly productSizesRepository: Repository<ProductSize>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    console.log("[v0] Creating product:", createProductDto)

    const { talles, ...productData } = createProductDto
    const product = this.productsRepository.create(productData)

    if (talles && talles.length > 0) {
      product.talles = talles.map((t) => this.productSizesRepository.create(t))
    }

    const saved = await this.productsRepository.save(product)
    console.log("[v0] Product created:", saved)
    return saved
  }

  async findAll(includeInactive = false, categoryId?: string, search?: string, talle?: string): Promise<Product[]> {
    const query = this.productsRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.talles", "talles")

    if (!includeInactive) {
      query.where("product.isActive = :isActive", { isActive: true })
    }

    if (categoryId) {
      query.andWhere("product.categoryId = :categoryId", { categoryId })
    }

    if (search) {
      query.andWhere("(product.nombre ILIKE :search OR product.descripcion ILIKE :search)", { search: `%${search}%` })
    }

    if (talle) {
      query.andWhere("talles.talle = :talle", { talle })
    }

    return query.orderBy("product.nombre", "ASC").getMany()
  }

  async findOne(id: string): Promise<Product> {
    console.log("[v0] Finding product with id:", id)
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ["category", "talles"],
    })
    if (!product) {
      throw new NotFoundException("Producto no encontrado")
    }
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id)

    const { talles, ...productData } = updateProductDto as any
    Object.assign(product, productData)

    if (talles) {
      // Eliminar talles existentes
      await this.productSizesRepository.delete({ productoId: id })
      // Crear nuevos talles
      product.talles = talles.map((t: any) => this.productSizesRepository.create(t))
    }

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

  async updateSizeStock(productoId: string, talle: string, cantidad: number): Promise<ProductSize> {
    const size = await this.productSizesRepository.findOne({
      where: { productoId, talle },
    })

    if (!size) {
      throw new NotFoundException(`Talle ${talle} no encontrado`)
    }

    size.stock += cantidad
    if (size.stock < 0) {
      throw new BadRequestException("Stock no puede ser negativo")
    }

    return this.productSizesRepository.save(size)
  }

  async reserveSizeStock(productoId: string, talle: string, cantidad: number): Promise<ProductSize> {
    const size = await this.productSizesRepository.findOne({
      where: { productoId, talle },
    })

    if (!size) {
      throw new NotFoundException(`Talle ${talle} no encontrado`)
    }

    if (size.stock - size.stockReservado < cantidad) {
      throw new BadRequestException(`Stock insuficiente para talle ${talle}`)
    }

    size.stockReservado += cantidad
    return this.productSizesRepository.save(size)
  }

  async releaseSizeStock(productoId: string, talle: string, cantidad: number): Promise<ProductSize> {
    const size = await this.productSizesRepository.findOne({
      where: { productoId, talle },
    })

    if (!size) {
      throw new NotFoundException(`Talle ${talle} no encontrado`)
    }

    size.stockReservado -= cantidad
    if (size.stockReservado < 0) {
      size.stockReservado = 0
    }

    return this.productSizesRepository.save(size)
  }

  async decreaseSizeStock(productoId: string, talle: string, cantidad: number): Promise<ProductSize> {
    const size = await this.productSizesRepository.findOne({
      where: { productoId, talle },
    })

    if (!size) {
      throw new NotFoundException(`Talle ${talle} no encontrado`)
    }

    if (size.stock < cantidad) {
      throw new BadRequestException(`Stock insuficiente para talle ${talle}`)
    }

    size.stock -= cantidad
    return this.productSizesRepository.save(size)
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
