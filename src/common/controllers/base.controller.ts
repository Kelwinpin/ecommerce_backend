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

  constructor(protected readonly service: BaseService<T>) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
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
  async findById(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return await this.service.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() createDto: any): Promise<T> {
    return await this.service.create(createDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  async createMany(@Body() createDtos: any[]): Promise<{ count: number }> {
    return await this.service.createMany(createDtos);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: any,
  ): Promise<T> {
    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return await this.service.delete(id, { softDelete: true });
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async deletePermanent(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return await this.service.delete(id, { softDelete: false });
  }

  @Get('count')
  @HttpCode(HttpStatus.OK)
  async count(@Query() filters?: any): Promise<{ count: number }> {
    const count = await this.service.count(filters);
    return { count };
  }

  @Get('exists')
  @HttpCode(HttpStatus.OK)
  async exists(@Query() filters: any): Promise<{ exists: boolean }> {
    const exists = await this.service.exists(filters);
    return { exists };
  }
}