import { IsOptional, IsString } from 'class-validator';

export class CreateDomCategoryDto {
  @IsOptional()
  @IsString()
  description?: string;
}