import { Injectable, NotFoundException } from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { Business } from "./entities/business.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData)
    return this.usersRepository.save(user)
  }

  async createBusiness(businessData: Partial<Business>): Promise<Business> {
    const business = this.businessRepository.create(businessData)
    return this.businessRepository.save(business)
  }

  async findBusinessByInviteCode(inviteCode: string): Promise<Business | null> {
    return this.businessRepository.findOne({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
    })
  }

  async findBusinessById(id: string): Promise<Business | null> {
    return this.businessRepository.findOne({ where: { id } })
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ["id", "email", "nombre", "telefono", "role", "isActive", "createdAt"],
      relations: ["business"],
    })
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["business"],
    })
    if (!user) {
      throw new NotFoundException("Usuario no encontrado")
    }
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ["business"],
    })
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
