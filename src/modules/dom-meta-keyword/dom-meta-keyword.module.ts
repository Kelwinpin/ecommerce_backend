import { Module } from '@nestjs/common';
import { DomMetaKeywordService } from './dom-meta-keyword.service';
import { DomMetaKeywordController } from './dom-meta-keyword.controller';

@Module({
  controllers: [DomMetaKeywordController],
  providers: [DomMetaKeywordService],
})
export class DomMetaKeywordModule {}
