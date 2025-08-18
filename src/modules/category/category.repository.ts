import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      include: {
        product: true,
        category: true
      }
    });
  }

  async findByCompositeId(categoryId: number, productId: number): Promise<Category | null> {
    return this.prisma.category.findUnique({ 
      where: { 
        categoryId_productId: { categoryId, productId }
      },
      include: {
        product: true,
        category: true
      }
    });
  }

  async create(data: any): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async update(categoryId: number, productId: number, data: any): Promise<Category> {
    return this.prisma.category.update({ 
      where: { 
        categoryId_productId: { categoryId, productId }
      }, 
      data 
    });
  }

  async delete(categoryId: number, productId: number): Promise<Category> {
    return this.prisma.category.delete({ 
      where: { 
        categoryId_productId: { categoryId, productId }
      }
    });
  }
}
