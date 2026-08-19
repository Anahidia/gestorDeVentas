import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { User } from "./user.entity"

@Entity("businesses")
export class Business {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  nombre: string

  @Column({ nullable: true })
  direccion: string

  @Column({ nullable: true })
  telefono: string

  @Column({ nullable: true })
  logoUrl: string

  @Column({ unique: true })
  inviteCode: string

  @OneToMany(() => User, (user) => user.business)
  usuarios: User[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
