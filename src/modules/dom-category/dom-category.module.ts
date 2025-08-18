import { Module } from '@nestjs/common';
import { DomCategoryController } from './dom-category.controller';
import { DomCategoryService } from './dom-category.service';

@Module({
    controllers: [DomCategoryController],
    providers: [DomCategoryService],
})

export class DomCategoryModule {}
