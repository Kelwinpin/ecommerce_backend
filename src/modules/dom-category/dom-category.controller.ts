import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { DomCategoryService } from "./dom-category.service";
import { CreateDomCategoryDto } from "./dto/create-dom-category.dto";

@Controller('dom-category')
export class DomCategoryController {
    constructor(private readonly domCategoryService: DomCategoryService) { }

    @Post()
    async create(@Body() createDomCategoryDto: CreateDomCategoryDto) {
        return this.domCategoryService.create(createDomCategoryDto);
    }

    @Get()
    async findAll() {
        return this.domCategoryService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.domCategoryService.findOne(id);
    }

    @Put(':id')
    async update(@Body() id: number, @Body() updateDomCategoryDto: CreateDomCategoryDto) {
        return this.domCategoryService.update(id, updateDomCategoryDto);
    }

    @Delete(':id')
    async remove(@Body() id: number) {
        return this.domCategoryService.remove(id);
    }
}