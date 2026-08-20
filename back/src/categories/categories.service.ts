import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Category } from "./entities/category.entity"
import { CreateCategoryDto } from "./dto/create-category.dto"
import { UpdateCategoryDto } from "./dto/update-category.dto"
import { User, UserRole } from "../users/entities/user.entity"

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    try {
      const admin = await this.categoriesRepository.manager.findOne(User, {
        where: { role: UserRole.ADMIN },
        relations: ["business"],
      })
      if (admin && admin.businessId) {
        await this.categoriesRepository
          .createQueryBuilder()
          .update(Category)
          .set({ businessId: admin.businessId })
          .where("businessId IS NULL")
          .execute()
      }
    } catch (e) {
      console.warn("Could not backfill businessId for categories:", e)
    }
  }

  async create(createCategoryDto: CreateCategoryDto & { businessId?: string }): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto)
    return this.categoriesRepository.save(category)
  }

  async findAll(includeInactive = false, businessId?: string): Promise<Category[]> {
    const where: any = includeInactive ? {} : { isActive: true }
    if (businessId) {
      where.businessId = businessId
    }
    return this.categoriesRepository.find({
      where,
      order: { nombre: "ASC" },
    })
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } })
    if (!category) {
      throw new NotFoundException("Categoría no encontrada")
    }
    return category
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id)
    Object.assign(category, updateCategoryDto)
    return this.categoriesRepository.save(category)
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id)
    category.isActive = false
    await this.categoriesRepository.save(category)
  }
}
