import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { BaseRepository } from '../repositories/base.repository';
import { 
  BaseEntity, 
  PaginatedResult, 
  PaginationParams,
  SoftDeleteOptions 
} from '../interfaces/base.interface';

export abstract class BaseService<T extends BaseEntity> {
  protected abstract entityName: string;
  
  constructor(protected readonly repository: BaseRepository<T>) {}

  async findAll(params?: PaginationParams): Promise<PaginatedResult<T>> {
    try {
      return await this.repository.findAll(params);
    } catch (error) {
      throw new BadRequestException(`Failed to fetch ${this.entityName} list: ${error.message}`);
    }
  }

  async findById(id: number, include?: Record<string, any>): Promise<T> {
    const entity = await this.repository.findById(id, include);
    
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    
    return entity;
  }

  async findOne(where: Record<string, any>, include?: Record<string, any>): Promise<T | null> {
    try {
      return await this.repository.findOne(where, include);
    } catch (error) {
      throw new BadRequestException(`Failed to find ${this.entityName}: ${error.message}`);
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      await this.validateCreate(data);
      return await this.repository.create(data);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`${this.entityName} already exists with these unique values`);
      }
      throw new BadRequestException(`Failed to create ${this.entityName}: ${error.message}`);
    }
  }

  async createMany(data: Partial<T>[]): Promise<{ count: number }> {
    try {
      for (const item of data) {
        await this.validateCreate(item);
      }
      return await this.repository.createMany(data);
    } catch (error) {
      throw new BadRequestException(`Failed to create multiple ${this.entityName}: ${error.message}`);
    }
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    try {
      await this.findById(id);
      await this.validateUpdate(id, data);
      
      return await this.repository.update(id, data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(`${this.entityName} already exists with these unique values`);
      }
      throw new BadRequestException(`Failed to update ${this.entityName}: ${error.message}`);
    }
  }

  async updateMany(where: Record<string, any>, data: Partial<T>): Promise<{ count: number }> {
    try {
      return await this.repository.updateMany(where, data);
    } catch (error) {
      throw new BadRequestException(`Failed to update multiple ${this.entityName}: ${error.message}`);
    }
  }

  async delete(id: number, options?: SoftDeleteOptions): Promise<T> {
    try {
      await this.findById(id);
      await this.validateDelete(id);
      
      return await this.repository.delete(id, options);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete ${this.entityName}: ${error.message}`);
    }
  }

  async deleteMany(where: Record<string, any>, options?: SoftDeleteOptions): Promise<{ count: number }> {
    try {
      return await this.repository.deleteMany(where, options);
    } catch (error) {
      throw new BadRequestException(`Failed to delete multiple ${this.entityName}: ${error.message}`);
    }
  }

  async exists(where: Record<string, any>): Promise<boolean> {
    try {
      return await this.repository.exists(where);
    } catch (error) {
      throw new BadRequestException(`Failed to check ${this.entityName} existence: ${error.message}`);
    }
  }

  async count(where?: Record<string, any>): Promise<number> {
    try {
      return await this.repository.count(where);
    } catch (error) {
      throw new BadRequestException(`Failed to count ${this.entityName}: ${error.message}`);
    }
  }

  protected async validateCreate(data: Partial<T>): Promise<void> {
    // Override in child classes for custom validation
  }

  protected async validateUpdate(id: number, data: Partial<T>): Promise<void> {
    // Override in child classes for custom validation
  }

  protected async validateDelete(id: number): Promise<void> {
    // Override in child classes for custom validation
  }

  async transaction<R>(fn: (tx: any) => Promise<R>): Promise<R> {
    return await this.repository.transaction(fn);
  }
}