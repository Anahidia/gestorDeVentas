import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Product } from "../../products/entities/product.entity"
import { User } from "../../users/entities/user.entity"
import { Business } from "../../users/entities/business.entity"

export enum OrderStatus {
  ACTIVO = "activo",
  COMPLETADO = "completado",
  CANCELADO = "cancelado",
  EXPIRADO = "expirado",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(
    () => Product,
    (product) => product.encargos,
  )
  @JoinColumn({ name: "productoId" })
  producto: Product

  @Column()
  productoId: string

  @Column({ nullable: true })
  talle?: string

  @Column("int")
  cantidad: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  sena: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  precioTotal: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  montoRestante: number

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.ACTIVO,
  })
  status: OrderStatus

  @ManyToOne(() => User)
  @JoinColumn({ name: "vendedorId" })
  vendedor: User

  @Column()
  vendedorId: string

  @Column({ nullable: true })
  businessId: string

  @ManyToOne(() => Business, { nullable: true })
  @JoinColumn({ name: "businessId" })
  business: Business

  @Column({ nullable: true })
  clienteNombre: string

  @Column({ nullable: true })
  clienteTelefono: string

  @Column("text", { nullable: true })
  notas: string

  @Column({ type: "timestamp" })
  fechaExpiracion: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
