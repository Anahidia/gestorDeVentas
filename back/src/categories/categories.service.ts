import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Category } from "./entities/category.entity"
import { CreateCategoryDto } from "./dto/create-category.dto"
import { UpdateCategoryDto } from "./dto/update-category.dto"

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto)
    return this.categoriesRepository.save(category)
  }

  async findAll(includeInactive = false): Promise<Category[]> {
    const where = includeInactive ? {} : { isActive: true }
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
