import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany();
  }

  async findById(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async create(data: any): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async update(id: number, data: any): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Product> {
    return this.prisma.product.delete({ where: { id } });
  }
}
