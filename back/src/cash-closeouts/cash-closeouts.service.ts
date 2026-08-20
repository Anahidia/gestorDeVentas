import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CashCloseout } from "./entities/cash-closeout.entity"
import { CreateCashCloseoutDto } from "./dto/create-cash-closeout.dto"
import { Sale, SaleStatus } from "../sales/entities/sale.entity"

@Injectable()
export class CashCloseoutsService {
  constructor(
    @InjectRepository(CashCloseout)
    private readonly closeoutsRepository: Repository<CashCloseout>,

    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

  async getCurrentSummary(businessId?: string, usuarioId?: string) {
    const lastCloseout = await this.closeoutsRepository.findOne({
      where: businessId ? { businessId } : {},
      order: { createdAt: "DESC" },
    })

    const sinceDate = lastCloseout ? lastCloseout.createdAt : new Date(0)

    const salesQuery = this.salesRepository
      .createQueryBuilder("sale")
      .leftJoinAndSelect("sale.items", "items")
      .leftJoinAndSelect("sale.vendedor", "vendedor")
      .where("sale.createdAt > :sinceDate", { sinceDate })

    if (businessId) {
      salesQuery.andWhere("sale.businessId = :businessId", { businessId })
    }

    const sales = await salesQuery.getMany()

    const activeSales = sales.filter(
      (s) => s.status === SaleStatus.COMPLETADA || s.status === SaleStatus.SENA_ENCARGO
    )
    const refundedSales = sales.filter((s) => s.status === SaleStatus.DEVUELTA)

    const totalVentasEfectivo = activeSales.reduce((sum, s) => sum + Number(s.total), 0)
    const totalVentasDigital = 0
    const totalDevoluciones = refundedSales.reduce((sum, s) => sum + Number(s.total), 0)

    const totalArticulosVendidos = activeSales.reduce((sum, s) => {
      const itemsCount = s.items?.reduce((itemSum, item) => itemSum + (item.cantidad || 1), 0) || 0
      return sum + itemsCount
    }, 0)

    return {
      desde: sinceDate,
      totalVentas: activeSales.length,
      totalDevolucionesCant: refundedSales.length,
      totalVentasEfectivo,
      totalVentasDigital,
      totalDevoluciones,
      totalArticulosVendidos,
      ultimoCierre: lastCloseout ? lastCloseout.createdAt : null,
    }
  }

  async create(dto: CreateCashCloseoutDto, usuarioId: string, businessId?: string): Promise<CashCloseout> {
    const summary = await this.getCurrentSummary(businessId, usuarioId)

    const fondoInicial = Number(dto.fondoInicial) || 0
    const efectivoReal = Number(dto.efectivoReal) || 0
    const totalVentasEfectivo = summary.totalVentasEfectivo
    const totalVentasDigital = summary.totalVentasDigital
    const totalDevoluciones = summary.totalDevoluciones
    const totalArticulosVendidos = summary.totalArticulosVendidos

    const efectivoEsperado = fondoInicial + totalVentasEfectivo - totalDevoluciones
    const diferencia = efectivoReal - efectivoEsperado

    const closeout = this.closeoutsRepository.create({
      businessId,
      usuarioId,
      fondoInicial,
      totalVentasEfectivo,
      totalVentasDigital,
      totalDevoluciones,
      efectivoEsperado,
      efectivoReal,
      diferencia,
      totalArticulosVendidos,
      notas: dto.notas || "",
    })

    return this.closeoutsRepository.save(closeout)
  }

  async findAll(businessId?: string): Promise<CashCloseout[]> {
    return this.closeoutsRepository.find({
      where: businessId ? { businessId } : {},
      relations: ["usuario", "business"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<CashCloseout> {
    const record = await this.closeoutsRepository.findOne({
      where: { id },
      relations: ["usuario", "business"],
    })
    if (!record) {
      throw new NotFoundException("Registro de cierre de caja no encontrado")
    }
    return record
  }
}
