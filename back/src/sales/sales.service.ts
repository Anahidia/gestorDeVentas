import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import  { Repository } from "typeorm"
import  { Sale } from "./entities/sale.entity"
import  { SaleItem } from "./entities/sale-item.entity"
import  { ProductsService } from "../products/products.service"
import  { CreateSaleDto } from "./dto/create-sale.dto"
import { SaleStatus } from "./entities/sale.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemsRepository: Repository<SaleItem>,
    private productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto, vendedorId: string): Promise<Sale> {
    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productoId)

      if (item.talle) {
        // Verificar stock del talle específico
        const size = product.talles?.find((t) => t.talle === item.talle)
        if (!size || size.stock < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${product.nombre} talle ${item.talle}`)
        }
      } else {
        // Verificar stock general
        if (product.stock < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${product.nombre}`)
        }
      }
    }

    // Calcular total y crear items
    let total = 0
    const saleItems: SaleItem[] = []

    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productoId)
      const subtotal = product.precio * item.cantidad

      const saleItem = this.saleItemsRepository.create({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: product.precio,
        subtotal,
        talle: item.talle,
      })

      saleItems.push(saleItem)
      total += subtotal

      if (item.talle) {
        await this.productsService.decreaseSizeStock(item.productoId, item.talle, item.cantidad)
      } else {
        await this.productsService.decreaseStock(item.productoId, item.cantidad)
      }
    }

    // Crear venta
    const sale = this.salesRepository.create({
      total,
      vendedorId,
      items: saleItems,
      notas: createSaleDto.notas,
      status: SaleStatus.COMPLETADA,
    })

    return this.salesRepository.save(sale)
  }

  async findAll(): Promise<Sale[]> {
    return this.salesRepository.find({
      relations: ["vendedor", "items", "items.producto"],
      order: { createdAt: "DESC" },
    })
  }

  async findByVendedor(vendedorId: string): Promise<Sale[]> {
    return this.salesRepository.find({
      where: { vendedorId },
      relations: ["items", "items.producto"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ["vendedor", "items", "items.producto"],
    })

    if (!sale) {
      throw new NotFoundException("Venta no encontrada")
    }

    return sale
  }

  async cancel(id: string): Promise<Sale> {
    const sale = await this.findOne(id)

    if (sale.status === SaleStatus.CANCELADA) {
      throw new BadRequestException("La venta ya está cancelada")
    }

    for (const item of sale.items) {
      if (item.talle) {
        await this.productsService.updateSizeStock(item.productoId, item.talle, item.cantidad)
      } else {
        await this.productsService.updateStock(item.productoId, item.cantidad)
      }
    }

    sale.status = SaleStatus.CANCELADA
    return this.salesRepository.save(sale)
  }

  async getStats() {
    const sales = await this.salesRepository.find({
      where: { status: SaleStatus.COMPLETADA },
      relations: ["items"],
    })

    const totalVentas = sales.length
    const totalIngresos = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0

    return {
      totalVentas,
      totalIngresos,
      promedioVenta,
    }
  }
}
