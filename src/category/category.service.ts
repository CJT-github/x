import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoryService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;
  //获取笔记列表
  async getCategoryList(type: number) {
    if (type) {
      return await this.categoryRepository.findBy({ type });
    }
    const noteData = await this.categoryRepository.findBy({ type: 1 });
    const templateData = await this.categoryRepository.findBy({ type: 2 });

    return { noteData, templateData };
  }

  //创建分类
  async createCategory(category: CreateCategoryDto) {
    const categoryData = await this.categoryRepository.findOneBy({
      value: category.value,
    });
    if (categoryData) throw new BadRequestException('该值已存在，添加失败');

    const _category = new Category();
    _category.name = category.name;
    _category.value = category.value;
    _category.type = category.type;

    return this.categoryRepository.save(_category);
  }

  //修改分类
  async updateCategory(category: UpdateCategoryDto) {
    const _category = await this.categoryRepository.findOneBy({
      id: category.id,
    });

    if (!_category) throw new BadRequestException('未能找到相应数据');

    const categoryData = await this.categoryRepository.findOneBy({
      value: category.value,
    });
    if (categoryData) throw new BadRequestException('该值已存在，请勿重复添加');

    _category.name = category.name;
    _category.value = category.value;

    return await this.categoryRepository.save(_category);
  }
}
