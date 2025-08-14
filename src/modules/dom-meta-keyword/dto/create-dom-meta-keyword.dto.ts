import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateDomMetaKeywordDto {
  @ApiProperty({
    example: 'electronics',
    description: 'The keyword for meta tags',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}