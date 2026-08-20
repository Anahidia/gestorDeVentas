import { Controller, Get, Post, Patch, Param, Delete, Body, UseGuards, Request } from "@nestjs/common"
import { CategoriesService } from "./categories.service"
import { CreateCategoryDto } from "./dto/create-category.dto"
import { UpdateCategoryDto } from "./dto/update-category.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"

@Controller("categories")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    const businessId = req?.user?.businessId
    return this.categoriesService.create({ ...createCategoryDto, businessId })
  }

  @Get()
  findAll(@Request() req: any) {
    const businessId = req?.user?.businessId
    return this.categoriesService.findAll(false, businessId)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.categoriesService.findOne(id)
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.categoriesService.remove(id)
  }
}
