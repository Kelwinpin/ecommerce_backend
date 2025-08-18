import { IsOptional, IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: Decimal;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  compareAtPrice?: Decimal;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;
}
