import {
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BaseService } from '../services/base.service';
import { BaseEntity, PaginatedResult } from '../interfaces/base.interface';
import { PaginationDto } from '../dto/pagination.dto';

export abstract class BaseController<T extends BaseEntity> {
  protected abstract resourceName: string;
  
  constructor(protected readonly service: BaseService<T>) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: `Get all ${this.resourceName}` })
  @ApiResponse({ status: 200, description: `Return all ${this.resourceName}` })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<T>> {
    return await this.service.findAll({
      page: paginationDto.page,
      limit: paginationDto.limit,
      orderBy: paginationDto.orderBy,
      order: paginationDto.order,
      search: paginationDto.search,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: `Get ${this.resourceName} by id` })
  @ApiResponse({ status: 200, description: `Return ${this.resourceName} by id` })
  @ApiResponse({ status: 404, description: `${this.resourceName} not found` })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return await this.service.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: `Create new ${this.resourceName}` })
  @ApiResponse({ status: 201, description: `${this.resourceName} created successfully` })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Conflict - duplicate entry' })
  async create(@Body() createDto: any): Promise<T> {
    return await this.service.create(createDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: `Create multiple ${this.resourceName}` })
  @ApiResponse({ status: 201, description: `Multiple ${this.resourceName} created successfully` })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createMany(@Body() createDtos: any[]): Promise<{ count: number }> {
    return await this.service.createMany(createDtos);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: `Update ${this.resourceName}` })
  @ApiResponse({ status: 200, description: `${this.resourceName} updated successfully` })
  @ApiResponse({ status: 404, description: `${this.resourceName} not found` })
  @ApiResponse({ status: 409, description: 'Conflict - duplicate entry' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: any,
  ): Promise<T> {
    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: `Delete ${this.resourceName}` })
  @ApiResponse({ status: 200, description: `${this.resourceName} deleted successfully` })
  @ApiResponse({ status: 404, description: `${this.resourceName} not found` })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return await this.service.delete(id, { softDelete: true });
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: `Permanently delete ${this.resourceName}` })
  @ApiResponse({ status: 200, description: `${this.resourceName} permanently deleted` })
  @ApiResponse({ status: 404, description: `${this.resourceName} not found` })
  async deletePermanent(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return await this.service.delete(id, { softDelete: false });
  }

  @Get('count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: `Count ${this.resourceName}` })
  @ApiResponse({ status: 200, description: `Return count of ${this.resourceName}` })
  async count(@Query() filters?: any): Promise<{ count: number }> {
    const count = await this.service.count(filters);
    return { count };
  }

  @Get('exists')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: `Check if ${this.resourceName} exists` })
  @ApiResponse({ status: 200, description: `Return existence of ${this.resourceName}` })
  async exists(@Query() filters: any): Promise<{ exists: boolean }> {
    const exists = await this.service.exists(filters);
    return { exists };
  }
}