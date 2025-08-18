import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'The category has been successfully created.' })
  create(@Body() createDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categorys' })
  @ApiResponse({ status: 200, description: 'Return all categorys.' })
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':categoryId/:productId')
  @ApiOperation({ summary: 'Get category by composite id' })
  @ApiResponse({ status: 200, description: 'Return the category.' })
  findOne(@Param('categoryId', ParseIntPipe) categoryId: number, @Param('productId', ParseIntPipe) productId: number): Promise<Category | null> {
    return this.categoryService.findByCompositeId(categoryId, productId);
  }

  @Patch(':categoryId/:productId')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'The category has been successfully updated.' })
  update(@Param('categoryId', ParseIntPipe) categoryId: number, @Param('productId', ParseIntPipe) productId: number, @Body() updateDto: UpdateCategoryDto): Promise<Category> {
    return this.categoryService.update(categoryId, productId, updateDto);
  }

  @Delete(':categoryId/:productId')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'The category has been successfully deleted.' })
  remove(@Param('categoryId', ParseIntPipe) categoryId: number, @Param('productId', ParseIntPipe) productId: number): Promise<Category> {
    return this.categoryService.delete(categoryId, productId);
  }
}
