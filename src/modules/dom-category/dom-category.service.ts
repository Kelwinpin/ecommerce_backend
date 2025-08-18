import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { CreateDomCategoryDto } from "./dto/create-dom-category.dto";
import { DomCategory } from "@prisma/client";

@Injectable()
export class DomCategoryService {
    constructor(private readonly prisma: DatabaseService) { }

    async create(createDomCategoryDto: CreateDomCategoryDto): Promise<DomCategory> {
        return this.prisma.domCategory.create({
            data: createDomCategoryDto,
        });
    }

    async findAll(): Promise<DomCategory[]> {
        return this.prisma.domCategory.findMany();
    }

    async findOne(id: number): Promise<DomCategory> {
        console.log(id);
        
        const category = await this.prisma.domCategory.findUnique({
            where: { id },
        });

        if (!category) {
            throw new Error(`DomCategory with ID ${id} not found`);
        }

        return category;
    }

    async update(id: number, updateDomCategoryDto: CreateDomCategoryDto): Promise<DomCategory> {
        await this.findOne(id);

        return this.prisma.domCategory.update({
            where: { id },
            data: updateDomCategoryDto,
        });
    }

    async remove(id: number): Promise<DomCategory> {
        await this.findOne(id);

        return this.prisma.domCategory.delete({
            where: { id },
        });
    }
}