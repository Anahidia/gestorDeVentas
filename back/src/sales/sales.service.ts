import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from "@nestjs/common"
import { Repository } from "typeorm"
import { Sale } from "./entities/sale.entity"
import { SaleItem } from "./entities/sale-item.entity"
import { ProductsService } from "../products/products.service"
import { CreateSaleDto } from "./dto/create-sale.dto"
import { SaleStatus } from "./entities/sale.entity"
import { User, UserRole } from "../users/entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class SalesService implements OnModuleInit {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemsRepository: Repository<SaleItem>,
    private productsService: ProductsService,
  ) {}

  async onModuleInit() {
    try {
      const admin = await this.salesRepository.manager.findOne(User, {
        where: { role: UserRole.ADMIN },
        relations: ["business"],
      })
      if (admin && admin.businessId) {
        await this.salesRepository
          .createQueryBuilder()
          .update(Sale)
          .set({ businessId: admin.businessId })
          .where("businessId IS NULL")
          .execute()
      }
    } catch (e) {
      console.warn("Could not backfill businessId for sales:", e)
    }
  }

  async create(createSaleDto: CreateSaleDto, vendedorId: string, businessId?: string): Promise<Sale> {
    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productoId)

      if (item.talle) {
        const size = product.talles?.find((t) => t.talle === item.talle)
        if (!size || size.stock < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${product.nombre} talle ${item.talle}`)
        }
      } else {
        if (product.stock < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${product.nombre}`)
        }
      }
    }

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
        await this.productsService.decreaseStock(item.productoId, item.cantidad)
      } else {
        await this.productsService.decreaseStock(item.productoId, item.cantidad)
      }
    }

    const sale = this.salesRepository.create({
      total,
      vendedorId,
      businessId,
      items: saleItems,
      notas: createSaleDto.notas,
      status: SaleStatus.COMPLETADA,
    })

    return this.salesRepository.save(sale)
  }

  async findAll(businessId?: string): Promise<Sale[]> {
    return this.salesRepository.find({
      where: businessId ? { businessId } : {},
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
        await this.productsService.updateStock(item.productoId, item.cantidad)
      } else {
        await this.productsService.updateStock(item.productoId, item.cantidad)
      }
    }

    sale.status = SaleStatus.CANCELADA
    return this.salesRepository.save(sale)
  }

  async refund(id: string): Promise<Sale> {
    const sale = await this.findOne(id)

    if (sale.status === SaleStatus.DEVUELTA) {
      throw new BadRequestException("La venta ya fue devuelta previamente")
    }

    if (sale.status === SaleStatus.CANCELADA) {
      throw new BadRequestException("No se puede devolver una venta cancelada")
    }

    for (const item of sale.items) {
      if (item.talle) {
        await this.productsService.updateSizeStock(item.productoId, item.talle, item.cantidad)
        await this.productsService.updateStock(item.productoId, item.cantidad)
      } else {
        await this.productsService.updateStock(item.productoId, item.cantidad)
      }
    }

    sale.status = SaleStatus.DEVUELTA
    return this.salesRepository.save(sale)
  }

  async getStats(businessId?: string) {
    const allSales = await this.salesRepository.find({
      where: businessId ? { businessId } : {},
      relations: ["items"],
    })

    const completedSales = allSales.filter((s) => s.status === SaleStatus.COMPLETADA)
    const refundedSales = allSales.filter((s) => s.status === SaleStatus.DEVUELTA)
    const cancelledSales = allSales.filter((s) => s.status === SaleStatus.CANCELADA)

    const totalVentas = completedSales.length
    const totalDevoluciones = refundedSales.length
    const totalIngresosBrutos = completedSales.reduce((sum, s) => sum + Number(s.total), 0)
    const totalDevuelto = refundedSales.reduce((sum, s) => sum + Number(s.total), 0)
    const totalIngresosNetos = totalIngresosBrutos - totalDevuelto
    const promedioVenta = totalVentas > 0 ? totalIngresosNetos / totalVentas : 0

    return {
      totalVentas,
      totalDevoluciones,
      totalCanceladas: cancelledSales.length,
      totalIngresosBrutos,
      totalDevuelto,
      totalIngresos: totalIngresosNetos,
      totalIngresosNetos,
      promedioVenta,
    }
  }
}
