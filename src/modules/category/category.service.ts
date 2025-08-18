import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async findByCompositeId(categoryId: number, productId: number): Promise<Category | null> {
    return this.categoryRepository.findByCompositeId(categoryId, productId);
  }

  async create(createDto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create(createDto);
  }

  async update(categoryId: number, productId: number, updateDto: UpdateCategoryDto): Promise<Category> {
    return this.categoryRepository.update(categoryId, productId, updateDto);
  }

  async delete(categoryId: number, productId: number): Promise<Category> {
    return this.categoryRepository.delete(categoryId, productId);
  }
}
