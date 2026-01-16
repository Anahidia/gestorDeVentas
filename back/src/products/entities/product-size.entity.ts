import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm"
import { Product } from "./product.entity"

@Entity("product_sizes")
export class ProductSize {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  talle: string

  @Column("int", { default: 0 })
  stock: number

  @Column("int", { default: 0 })
  stockReservado: number

  @Column()
  productoId: string

  @ManyToOne(
    () => Product,
    (product) => product.talles,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "productoId" })
  producto: Product

  get stockDisponible(): number {
    return this.stock - this.stockReservado
  }
}
