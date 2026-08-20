import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, OnModuleInit } from "@nestjs/common"
import { Repository, LessThan } from "typeorm"
import { Order, OrderStatus } from "./entities/order.entity"
import { Sale, SaleStatus } from "../sales/entities/sale.entity"
import { SaleItem } from "../sales/entities/sale-item.entity"
import { ProductsService } from "../products/products.service"
import { CreateOrderDto } from "./dto/create-order.dto"
import { User, UserRole } from "../users/entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,

    @InjectRepository(SaleItem)
    private readonly saleItemsRepository: Repository<SaleItem>,

    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}

  async onModuleInit() {
    try {
      const admin = await this.ordersRepository.manager.findOne(User, {
        where: { role: UserRole.ADMIN },
        relations: ["business"],
      })
      if (admin && admin.businessId) {
        await this.ordersRepository
          .createQueryBuilder()
          .update(Order)
          .set({ businessId: admin.businessId })
          .where("businessId IS NULL")
          .execute()
      }
    } catch (e) {
      console.warn("Could not backfill businessId for orders:", e)
    }
  }

  async create(createOrderDto: CreateOrderDto, vendedorId: string, businessId?: string): Promise<Order> {
    const product = await this.productsService.findOne(createOrderDto.productoId)

    if (createOrderDto.talle) {
      const size = product.talles?.find((t) => t.talle === createOrderDto.talle)
      if (!size) {
        throw new BadRequestException(`El talle ${createOrderDto.talle} no existe para este producto`)
      }
      const sizeStockDisponible = size.stock - size.stockReservado
      if (sizeStockDisponible < createOrderDto.cantidad) {
        throw new BadRequestException(`Stock insuficiente para talle ${createOrderDto.talle}`)
      }
      await this.productsService.reserveSizeStock(createOrderDto.productoId, createOrderDto.talle, createOrderDto.cantidad)
    } else {
      const stockDisponible = product.stock - product.stockReservado
      if (stockDisponible < createOrderDto.cantidad) {
        throw new BadRequestException("Stock insuficiente para crear el encargo")
      }
      await this.productsService.reserveStock(createOrderDto.productoId, createOrderDto.cantidad)
    }

    const precioTotal = Number(product.precio || 0) * Number(createOrderDto.cantidad || 1)
    const sena = Number(createOrderDto.sena || 0)
    const montoRestante = Math.max(0, precioTotal - sena)

    let fechaExpiracion = new Date()
    if (createOrderDto.fechaExpiracion) {
      fechaExpiracion = new Date(createOrderDto.fechaExpiracion)
    } else {
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 7)
    }

    const order = this.ordersRepository.create({
      ...createOrderDto,
      precioTotal,
      sena,
      montoRestante,
      vendedorId,
      businessId,
      fechaExpiracion,
      status: OrderStatus.ACTIVO,
    })

    const savedOrder = await this.ordersRepository.save(order)

    // Si se dejó seña, registrar una VENTA de seña (SENA_ENCARGO)
    if (sena > 0) {
      try {
        const saleItem = this.saleItemsRepository.create({
          productoId: product.id,
          cantidad: createOrderDto.cantidad,
          precioUnitario: sena / createOrderDto.cantidad,
          subtotal: sena,
          talle: createOrderDto.talle,
        })

        const senaSale = this.salesRepository.create({
          total: sena,
          status: SaleStatus.SENA_ENCARGO,
          vendedorId,
          businessId,
          encargoId: savedOrder.id,
          items: [saleItem],
          notas: `Seña por encargo: ${product.nombre}${createOrderDto.clienteNombre ? ` (Cliente: ${createOrderDto.clienteNombre})` : ""}`,
        })

        await this.salesRepository.save(senaSale)
      } catch (err) {
        console.warn("Could not record sena sale:", err)
      }
    }

    return savedOrder
  }

  async findAll(businessId?: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: businessId ? { businessId } : {},
      relations: ["producto", "vendedor"],
      order: { createdAt: "DESC" },
    })
  }

  async findActive(businessId?: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: businessId ? { status: OrderStatus.ACTIVO, businessId } : { status: OrderStatus.ACTIVO },
      relations: ["producto", "vendedor"],
      order: { createdAt: "DESC" },
    })
  }

  async findByVendedor(vendedorId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { vendedorId },
      relations: ["producto"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ["producto", "vendedor"],
    })

    if (!order) {
      throw new NotFoundException("Encargo no encontrado")
    }

    return order
  }

  async complete(id: string): Promise<Order> {
    const order = await this.findOne(id)

    if (order.status !== OrderStatus.ACTIVO) {
      throw new BadRequestException("Solo se pueden completar encargos activos")
    }

    if (order.talle) {
      await this.productsService.releaseSizeStock(order.productoId, order.talle, order.cantidad)
      await this.productsService.decreaseSizeStock(order.productoId, order.talle, order.cantidad)
      await this.productsService.decreaseStock(order.productoId, order.cantidad)
    } else {
      await this.productsService.releaseStock(order.productoId, order.cantidad)
      await this.productsService.decreaseStock(order.productoId, order.cantidad)
    }

    const montoRestante = Number(order.montoRestante ?? (order.precioTotal - order.sena)) || 0

    // Si había un monto restante por cobrar, registrar como VENTA final
    if (montoRestante > 0) {
      try {
        const saleItem = this.saleItemsRepository.create({
          productoId: order.productoId,
          cantidad: order.cantidad,
          precioUnitario: montoRestante / order.cantidad,
          subtotal: montoRestante,
          talle: order.talle,
        })

        const finalSale = this.salesRepository.create({
          total: montoRestante,
          status: SaleStatus.COMPLETADA,
          vendedorId: order.vendedorId,
          businessId: order.businessId,
          encargoId: order.id,
          items: [saleItem],
          notas: `Pago final / Entrega encargo: ${order.producto?.nombre || "Producto"}${order.clienteNombre ? ` (Cliente: ${order.clienteNombre})` : ""}`,
        })

        await this.salesRepository.save(finalSale)
      } catch (err) {
        console.warn("Could not record final payment sale:", err)
      }
    }

    order.status = OrderStatus.COMPLETADO
    return this.ordersRepository.save(order)
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.findOne(id)

    if (order.status !== OrderStatus.ACTIVO) {
      throw new BadRequestException("Solo se pueden cancelar encargos activos")
    }

    if (order.talle) {
      await this.productsService.releaseSizeStock(order.productoId, order.talle, order.cantidad)
    } else {
      await this.productsService.releaseStock(order.productoId, order.cantidad)
    }

    order.status = OrderStatus.CANCELADO
    return this.ordersRepository.save(order)
  }

  async expireOrders() {
    const now = new Date()
    const expiredOrders = await this.ordersRepository.find({
      where: {
        status: OrderStatus.ACTIVO,
        fechaExpiracion: LessThan(now),
      },
      relations: ["producto"],
    })

    for (const order of expiredOrders) {
      if (order.talle) {
        await this.productsService.releaseSizeStock(order.productoId, order.talle, order.cantidad)
      } else {
        await this.productsService.releaseStock(order.productoId, order.cantidad)
      }

      order.status = OrderStatus.EXPIRADO
      await this.ordersRepository.save(order)

      console.log(`Encargo ${order.id} expirado automáticamente`)
    }

    if (expiredOrders.length > 0) {
      console.log(`${expiredOrders.length} encargos expirados`)
    }
  }

  async getStats(businessId?: string) {
    const whereActive: any = { status: OrderStatus.ACTIVO }
    const whereCompleted: any = { status: OrderStatus.COMPLETADO }
    const whereExpired: any = { status: OrderStatus.EXPIRADO }

    if (businessId) {
      whereActive.businessId = businessId
      whereCompleted.businessId = businessId
      whereExpired.businessId = businessId
    }

    const activeOrders = await this.ordersRepository.count({ where: whereActive })
    const completedOrders = await this.ordersRepository.count({ where: whereCompleted })
    const expiredOrders = await this.ordersRepository.count({ where: whereExpired })

    return {
      activos: activeOrders,
      completados: completedOrders,
      expirados: expiredOrders,
    }
  }
}
