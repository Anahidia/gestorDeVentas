import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm/dist/common/typeorm.decorators"

@Injectable()
export class UsersService {
  constructor(
     @InjectRepository(User)
    private usersRepository: Repository<User>,

  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData)
    return this.usersRepository.save(user)
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ["id", "email", "nombre", "role", "isActive", "createdAt"],
    })
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException("Usuario no encontrado")
    }
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } })
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData)
    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException("Usuario no encontrado")
    }
  }
}
