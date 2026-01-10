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
    (product) => product.isActive,
  )
  @JoinColumn({ name: "productoId" })
  producto: Product
º
  @Column()
  productoId: string

  @Column("int")
  cantidad: number

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
