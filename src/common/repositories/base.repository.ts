import { PrismaClient } from '@prisma/client';
import { 
  BaseEntity, 
  PaginatedResult, 
  PaginationParams, 
  QueryOptions,
  SoftDeleteOptions 
} from '../interfaces/base.interface';

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract model: any;
  
  constructor(protected readonly prisma: PrismaClient) {}

  async findAll(params?: PaginationParams): Promise<PaginatedResult<T>> {
    const { 
      page = 1, 
      limit = 20, 
      orderBy = 'createdAt', 
      order = 'desc',
      search,
      filters = {}
    } = params || {};

    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(search, filters);

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      this.model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findById(id: number, include?: Record<string, any>): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
      include,
    });
  }

  async findOne(where: Record<string, any>, include?: Record<string, any>): Promise<T | null> {
    return await this.model.findFirst({
      where,
      include,
    });
  }

  async findMany(options?: QueryOptions): Promise<T[]> {
    return await this.model.findMany(options);
  }

  async create(data: Partial<T>, include?: Record<string, any>): Promise<T> {
    return await this.model.create({
      data,
      include,
    });
  }

  async createMany(data: Partial<T>[]): Promise<{ count: number }> {
    return await this.model.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async update(id: number, data: Partial<T>, include?: Record<string, any>): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
      include,
    });
  }

  async updateMany(where: Record<string, any>, data: Partial<T>): Promise<{ count: number }> {
    return await this.model.updateMany({
      where,
      data,
    });
  }

  async delete(id: number, options?: SoftDeleteOptions): Promise<T> {
    if (options?.softDelete) {
      return await this.model.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }
    return await this.model.delete({
      where: { id },
    });
  }

  async deleteMany(where: Record<string, any>, options?: SoftDeleteOptions): Promise<{ count: number }> {
    if (options?.softDelete) {
      return await this.model.updateMany({
        where,
        data: { deletedAt: new Date() },
      });
    }
    return await this.model.deleteMany({
      where,
    });
  }

  async exists(where: Record<string, any>): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async count(where?: Record<string, any>): Promise<number> {
    return await this.model.count({ where });
  }

  async transaction<R>(fn: (tx: PrismaClient) => Promise<R>): Promise<R> {
    return await this.prisma.$transaction(fn);
  }

  protected buildWhereClause(search?: string, filters?: Record<string, any>): Record<string, any> {
    const where: Record<string, any> = {
      ...filters,
      deletedAt: null,
    };

    if (search) {
      where.OR = this.getSearchFields().map(field => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    return where;
  }

  protected getSearchFields(): string[] {
    return ['name', 'description'];
  }
}