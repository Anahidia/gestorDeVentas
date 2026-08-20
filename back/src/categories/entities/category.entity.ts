import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Product } from "../../products/entities/product.entity"
import { Business } from "../../users/entities/business.entity"

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  nombre: string

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  businessId: string

  @ManyToOne(() => Business, { nullable: true })
  @JoinColumn({ name: "businessId" })
  business: Business

  @OneToMany(
    () => Product,
    (product) => product.category,
  )
  productos: Product[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
