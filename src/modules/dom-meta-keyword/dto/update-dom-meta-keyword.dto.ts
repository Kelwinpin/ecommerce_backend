import { PartialType } from '@nestjs/swagger';
import { CreateDomMetaKeywordDto } from './create-dom-meta-keyword.dto';

export class UpdateDomMetaKeywordDto extends PartialType(CreateDomMetaKeywordDto) {}