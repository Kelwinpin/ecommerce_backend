import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findById(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async create(createDto: CreateProductDto): Promise<Product> {
    return this.productRepository.create(createDto);
  }

  async update(id: number, updateDto: UpdateProductDto): Promise<Product> {
    return this.productRepository.update(id, updateDto);
  }

  async delete(id: number): Promise<Product> {
    return this.productRepository.delete(id);
  }
}
