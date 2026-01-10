import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { SaleItem } from "./sale-item.entity"

export enum SaleStatus {
  COMPLETADA = "completada",
  CANCELADA = "cancelada",
}

@Entity("sales")
export class Sale {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("decimal", { precision: 10, scale: 2 })
  total: number

  @Column({
    type: "enum",
    enum: SaleStatus,
    default: SaleStatus.COMPLETADA,
  })
  status: SaleStatus

  @ManyToOne(
    () => User,
    (user) => user.ventas,
  )
  @JoinColumn({ name: "vendedorId" })
  vendedor: User

  @Column()
  vendedorId: string

  @OneToMany(
    () => SaleItem,
    (saleItem) => saleItem.venta,
    { cascade: true },
  )
  items: SaleItem[]

  @Column("text", { nullable: true })
  notas: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
