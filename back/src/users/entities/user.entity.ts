import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Exclude } from "class-transformer"
import { Sale } from "../../sales/entities/sale.entity"

export enum UserRole {
  ADMIN = "admin",
  VENDEDOR = "vendedor",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  @Exclude()
  password: string

  @Column()
  nombre: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.VENDEDOR,
  })
  role: UserRole

  @Column({ default: true })
  isActive: boolean

  @OneToMany(
    () => Sale,
    (sale) => sale.vendedor,
  )
  ventas: Sale[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
