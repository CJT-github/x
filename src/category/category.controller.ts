import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('/api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  //获取分类列表
  @Get('getCategoryList')
  async getCategoryList(@Query('type') type: number) {
    return this.categoryService.getCategoryList(type);
  }

  //创建分类
  @Post('createCategory')
  async createCategory(
    @Body(new ValidationPipe()) category: CreateCategoryDto,
  ) {
    return this.categoryService.createCategory(category);
  }

  //更新分类
  @Post('updateCategory')
  async updateCategory(
    @Body(new ValidationPipe()) category: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(category);
  }
}
