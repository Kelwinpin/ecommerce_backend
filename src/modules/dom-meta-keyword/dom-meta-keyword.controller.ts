import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DomMetaKeywordService } from './dom-meta-keyword.service';
import { CreateDomMetaKeywordDto } from './dto/create-dom-meta-keyword.dto';
import { UpdateDomMetaKeywordDto } from './dto/update-dom-meta-keyword.dto';

@ApiTags('dom-meta-keywords')
@Controller('dom-meta-keyword')
export class DomMetaKeywordController {
  constructor(private readonly domMetaKeywordService: DomMetaKeywordService) { }

  @Post()
  create(@Body() createDomMetaKeywordDto: CreateDomMetaKeywordDto) {
    return this.domMetaKeywordService.create(createDomMetaKeywordDto);
  }

  @Get()
  findAll() {
    return this.domMetaKeywordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.domMetaKeywordService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDomMetaKeywordDto: UpdateDomMetaKeywordDto) {
    return this.domMetaKeywordService.update(id, updateDomMetaKeywordDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.domMetaKeywordService.remove(id);
  }
}
