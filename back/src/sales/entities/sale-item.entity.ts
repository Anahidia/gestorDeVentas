import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm"
import { Sale } from "../../sales/entities/sale.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("sale_items")
export class SaleItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(
    () => Sale,
    (sale) => sale.items,
  )
  @JoinColumn({ name: "ventaId" })
  venta: Sale

  @Column()
  ventaId: string

  @ManyToOne(
    () => Product,
    (product) => product.ventasItems,
  )
  @JoinColumn({ name: "productoId" })
  producto: Product

  @Column()
  productoId: string

  @Column("int")
  cantidad: number

  @Column("decimal", { precision: 10, scale: 2 })
  precioUnitario: number

  @Column("decimal", { precision: 10, scale: 2 })
  subtotal: number
}
