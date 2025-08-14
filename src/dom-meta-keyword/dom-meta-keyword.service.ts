import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDomMetaKeywordDto } from './dto/create-dom-meta-keyword.dto';
import { UpdateDomMetaKeywordDto } from './dto/update-dom-meta-keyword.dto';
import type { DomMetaKeyword } from '@prisma/client';

@Injectable()
export class DomMetaKeywordService {
  constructor(private readonly prisma: DatabaseService) { }

  async create(createDomMetaKeywordDto: CreateDomMetaKeywordDto): Promise<DomMetaKeyword> {
    return this.prisma.domMetaKeyword.create({
      data: createDomMetaKeywordDto,
    });
  }

  async findAll(): Promise<DomMetaKeyword[]> {
    return this.prisma.domMetaKeyword.findMany();
  }

  async findOne(id: number): Promise<DomMetaKeyword> {
    const keyword = await this.prisma.domMetaKeyword.findUnique({
      where: { id },
    });

    if (!keyword) {
      throw new NotFoundException(`DomMetaKeyword with ID ${id} not found`);
    }

    return keyword;
  }

  async update(id: number, updateDomMetaKeywordDto: UpdateDomMetaKeywordDto): Promise<DomMetaKeyword> {
    await this.findOne(id);

    return this.prisma.domMetaKeyword.update({
      where: { id },
      data: updateDomMetaKeywordDto,
    });
  }

  async remove(id: number): Promise<DomMetaKeyword> {
    await this.findOne(id);

    return this.prisma.domMetaKeyword.delete({
      where: { id },
    });
  }
}
