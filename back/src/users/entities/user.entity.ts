import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Exclude } from "class-transformer"
import { Sale } from "../../sales/entities/sale.entity"
import { Business } from "./business.entity"

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

  @Column({ nullable: true })
  telefono: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.VENDEDOR,
  })
  role: UserRole

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  departamento: string

  @Column({ default: false })
  inShift: boolean

  @Column({ type: "timestamp", nullable: true })
  lastCheckIn: Date

  @Column({ nullable: true })
  codigoEmpleado: string

  @Column({ nullable: true })
  businessId: string

  @ManyToOne(() => Business, (business) => business.usuarios, { onDelete: "SET NULL" })
  @JoinColumn({ name: "businessId" })
  business: Business

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
