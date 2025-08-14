import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({ enum: OrderDirection, default: OrderDirection.DESC })
  @IsEnum(OrderDirection)
  @IsOptional()
  order?: OrderDirection = OrderDirection.DESC;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}

export class PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMetaDto;
}