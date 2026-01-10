import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from "@nestjs/common"
import type { Repository } from "typeorm"
import { LessThan } from "typeorm"
import { Order } from "./entities/order.entity"
import { OrderStatus } from "./entities/order.entity"
import { ProductsService } from "../products/products.service"
import type { CreateOrderDto } from "./dto/create-order.dto"
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {}



  async create(createOrderDto: CreateOrderDto, vendedorId: string): Promise<Order> {
    const product = await this.productsService.findOne(createOrderDto.productoId)

    // Verificar stock disponible
    const stockDisponible = product.stock - product.stockReservado
    if (stockDisponible < createOrderDto.cantidad) {
      throw new BadRequestException("Stock insuficiente para crear el encargo")
    }

    // Reservar stock
    await this.productsService.reserveStock(createOrderDto.productoId, createOrderDto.cantidad)

    // Crear encargo con fecha de expiración de 7 días
    const fechaExpiracion = new Date()
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7)

    const order = this.ordersRepository.create({
      ...createOrderDto,
      vendedorId,
      fechaExpiracion,
      status: OrderStatus.ACTIVO,
    })

    return this.ordersRepository.save(order)
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ["producto", "vendedor"],
      order: { createdAt: "DESC" },
    })
  }

  async findActive(): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { status: OrderStatus.ACTIVO },
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

    // Liberar stock reservado y decrementar stock real
    await this.productsService.releaseStock(order.productoId, order.cantidad)
    await this.productsService.decreaseStock(order.productoId, order.cantidad)

    order.status = OrderStatus.COMPLETADO
    return this.ordersRepository.save(order)
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.findOne(id)

    if (order.status !== OrderStatus.ACTIVO) {
      throw new BadRequestException("Solo se pueden cancelar encargos activos")
    }

    // Liberar stock reservado
    await this.productsService.releaseStock(order.productoId, order.cantidad)

    order.status = OrderStatus.CANCELADO
    return this.ordersRepository.save(order)
  }

  // Cron job que se ejecuta cada hora para expirar encargos vencidos
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
      // Liberar stock reservado
      await this.productsService.releaseStock(order.productoId, order.cantidad)

      order.status = OrderStatus.EXPIRADO
      await this.ordersRepository.save(order)

      console.log(`Encargo ${order.id} expirado automáticamente`)
    }

    if (expiredOrders.length > 0) {
      console.log(`${expiredOrders.length} encargos expirados`)
    }
  }

  async getStats() {
    const activeOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.ACTIVO },
    })

    const completedOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.COMPLETADO },
    })

    const expiredOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.EXPIRADO },
    })

    return {
      activos: activeOrders,
      completados: completedOrders,
      expirados: expiredOrders,
    }
  }
}
