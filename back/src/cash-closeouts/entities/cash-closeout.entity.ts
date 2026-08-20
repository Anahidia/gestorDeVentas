import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Business } from "../../users/entities/business.entity"

@Entity("cash_closeouts")
export class CashCloseout {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: true })
  businessId: string

  @ManyToOne(() => Business, { nullable: true })
  @JoinColumn({ name: "businessId" })
  business: Business

  @Column()
  usuarioId: string

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "usuarioId" })
  usuario: User

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  fondoInicial: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalVentasEfectivo: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalVentasDigital: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalDevoluciones: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  efectivoEsperado: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  efectivoReal: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  diferencia: number

  @Column("int", { default: 0 })
  totalArticulosVendidos: number

  @Column("text", { nullable: true })
  notas: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
