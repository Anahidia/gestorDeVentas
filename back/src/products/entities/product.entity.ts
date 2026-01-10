import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { SaleItem } from "../../sales/entities/sale-item.entity"
import { Order } from "../../orders/entities/order.entity"

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  nombre: string

  @Column("text", { nullable: true })
  descripcion: string

  @Column("decimal", { precision: 10, scale: 2 })
  precio: number

  @Column("int", { default: 0 })
  stock: number

  @Column("int", { default: 0 })
  stockReservado: number

  @Column({ nullable: true })
  imagenUrl: string

  @Column({ default: true })
  isActive: boolean

  @OneToMany(
    () => SaleItem,
    (saleItem) => saleItem.producto,
  )
  ventasItems: SaleItem[]

  @OneToMany(
    () => Order,
    (order) => order.producto,
  )
  encargos: Order[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  get stockDisponible(): number {
    return this.stock - this.stockReservado
  }
}
