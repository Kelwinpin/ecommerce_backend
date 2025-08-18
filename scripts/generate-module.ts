#!/usr/bin/env ts-node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PrismaField {
  name: string;
  type: string;
  isOptional: boolean;
  isId: boolean;
  isUnique: boolean;
  hasDefault: boolean;
  isRelation: boolean;
  relationName?: string;
  isArray: boolean;
}

interface PrismaModel {
  name: string;
  fields: PrismaField[];
  hasTimestamps: boolean;
  hasSoftDelete: boolean;
  hasCompositeId: boolean;
  compositeIdFields: string[];
}

class ModuleGenerator {
  private schemaPath = join(process.cwd(), 'src/database/prisma/schema.prisma');
  private modulesPath = join(process.cwd(), 'src/modules');

  private parseSchema(): PrismaModel[] {
    const schemaContent = readFileSync(this.schemaPath, 'utf-8');
    const models: PrismaModel[] = [];
    
    const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
    let match;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelBody = match[2];
      
      const fields = this.parseFields(modelBody);
      const hasTimestamps = fields.some(f => ['createdAt', 'updatedAt'].includes(f.name));
      const hasSoftDelete = fields.some(f => f.name === 'deletedAt');
      
      // Check for composite ID
      const compositeIdMatch = modelBody.match(/@@id\(\[([^\]]+)\]/);
      const hasCompositeId = !!compositeIdMatch;
      const compositeIdFields = hasCompositeId 
        ? compositeIdMatch[1].split(',').map(f => f.trim()) 
        : [];
      
      models.push({
        name: modelName,
        fields,
        hasTimestamps,
        hasSoftDelete,
        hasCompositeId,
        compositeIdFields
      });
    }

    return models;
  }

  private parseFields(modelBody: string): PrismaField[] {
    const lines = modelBody.split('\n').map(line => line.trim()).filter(Boolean);
    const fields: PrismaField[] = [];

    for (const line of lines) {
      if (line.startsWith('@@') || line.startsWith('//')) continue;

      const fieldMatch = line.match(/^(\w+)\s+([^\s@]+)(\?)?(.*)$/);
      if (!fieldMatch) continue;

      const [, name, type, optional, rest] = fieldMatch;
      const isOptional = !!optional;
      const isId = rest.includes('@id');
      const isUnique = rest.includes('@unique');
      const hasDefault = rest.includes('@default');
      const isRelation = /[A-Z]/.test(type[0]) && !['String', 'Int', 'Boolean', 'DateTime', 'Decimal', 'BigInt', 'Json'].includes(type.replace('[]', ''));
      const isArray = type.includes('[]');
      const relationMatch = rest.match(/@relation\([^)]*\)/);
      
      fields.push({
        name,
        type: type.replace('[]', ''),
        isOptional,
        isId,
        isUnique,
        hasDefault,
        isRelation,
        relationName: isRelation ? type.replace('[]', '') : undefined,
        isArray
      });
    }

    return fields;
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  private getTypeScriptType(prismaType: string): string {
    const typeMap: Record<string, string> = {
      String: 'string',
      Int: 'number',
      BigInt: 'bigint',
      Boolean: 'boolean',
      DateTime: 'Date',
      Decimal: 'Decimal',
      Json: 'any'
    };
    
    return typeMap[prismaType] || 'any';
  }

  private generateCreateDTO(model: PrismaModel): string {
    const className = `Create${model.name}Dto`;
    const imports = ['IsOptional', 'IsNotEmpty'];
    
    // Add specific validators based on field types
    const fieldValidators = model.fields.filter(f => !f.isRelation && !f.isId && !['createdAt', 'updatedAt', 'deletedAt'].includes(f.name));
    
    if (fieldValidators.some(f => f.type === 'String')) imports.push('IsString');
    if (fieldValidators.some(f => f.type === 'Int')) imports.push('IsNumber');
    if (fieldValidators.some(f => f.type === 'Boolean')) imports.push('IsBoolean');
    if (fieldValidators.some(f => f.type === 'DateTime')) imports.push('IsDateString');
    if (fieldValidators.some(f => f.type === 'Decimal')) imports.push('IsNumber');

    const uniqueImports = [...new Set(imports)];
    const hasDecimal = fieldValidators.some(f => f.type === 'Decimal');

    let content = `import { ${uniqueImports.join(', ')} } from 'class-validator';\n`;
    content += `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n`;
    if (hasDecimal) {
      content += `import { Decimal } from '@prisma/client/runtime/library';\n`;
    }
    content += '\n';
    
    content += `export class ${className} {\n`;
    
    for (const field of fieldValidators) {
      const tsType = this.getTypeScriptType(field.type);
      const isOptionalField = field.isOptional || field.hasDefault || ['sku', 'description', 'shortDescription', 'compareAtPrice', 'brandId', 'isActive', 'isFeatured', 'stockQuantity', 'lowStockThreshold', 'metaTitle', 'metaDescription'].includes(field.name);
      const decorator = isOptionalField ? '@ApiPropertyOptional()' : '@ApiProperty()';
      const validator = isOptionalField ? '@IsOptional()' : '@IsNotEmpty()';
      
      let typeValidator = '';
      if (field.type === 'String') typeValidator = '  @IsString()\n';
      else if (field.type === 'Int' || field.type === 'Decimal') typeValidator = '  @IsNumber()\n';
      else if (field.type === 'Boolean') typeValidator = '  @IsBoolean()\n';
      else if (field.type === 'DateTime') typeValidator = '  @IsDateString()\n';

      content += `  ${decorator}\n`;
      content += `  ${validator}\n`;
      if (typeValidator) content += typeValidator;
      content += `  ${field.name}${isOptionalField ? '?' : ''}: ${tsType};\n\n`;
    }
    
    content += '}\n';
    return content;
  }

  private generateUpdateDTO(model: PrismaModel): string {
    const className = `Update${model.name}Dto`;
    const createDtoName = `Create${model.name}Dto`;
    
    let content = `import { PartialType } from '@nestjs/swagger';\n`;
    content += `import { ${createDtoName} } from './create-${this.toKebabCase(model.name)}.dto';\n\n`;
    content += `export class ${className} extends PartialType(${createDtoName}) {}\n`;
    
    return content;
  }

  private generateRepository(model: PrismaModel): string {
    const className = `${model.name}Repository`;
    const modelName = this.toCamelCase(model.name);
    
    let content = `import { Injectable } from '@nestjs/common';\n`;
    
    if (model.hasTimestamps && model.hasSoftDelete) {
      content += `import { BaseRepository } from '../../common/repositories/base.repository';\n`;
    }
    
    content += `import { ${model.name} } from '@prisma/client';\n`;
    content += `import { DatabaseService } from '../../database/database.service';\n\n`;
    
    content += `@Injectable()\n`;
    content += `export class ${className}`;
    
    if (model.hasTimestamps && model.hasSoftDelete) {
      content += ` extends BaseRepository<${model.name}>`;
    }
    
    content += ` {\n`;
    
    if (model.hasTimestamps && model.hasSoftDelete) {
      content += `  protected model = this.prisma.${modelName};\n\n`;
      content += `  constructor(protected readonly prisma: DatabaseService) {\n`;
      content += `    super(prisma);\n`;
      content += `  }\n\n`;
      content += `  protected getSearchFields(): string[] {\n`;
      
      const searchableFields = model.fields
        .filter(f => f.type === 'String' && !f.isRelation && !['createdAt', 'updatedAt', 'deletedAt'].includes(f.name))
        .map(f => `'${f.name}'`);
      
      content += `    return [${searchableFields.join(', ')}];\n`;
      content += `  }\n`;
    } else {
      content += `  constructor(private readonly prisma: DatabaseService) {}\n\n`;
      content += `  async findAll(): Promise<${model.name}[]> {\n`;
      content += `    return this.prisma.${modelName}.findMany();\n`;
      content += `  }\n\n`;
      if (model.hasCompositeId) {
        const whereType = `{ ${model.compositeIdFields.map(f => `${f}: number`).join(', ')} }`;
        const whereParam = `{ ${model.compositeIdFields.map(f => `${f}_${model.compositeIdFields.filter(x => x !== f).join('_')}`).join('_')}: { ${model.compositeIdFields.map(f => `${f}`).join(', ')} } }`;
        
        content += `  async findByCompositeId(${model.compositeIdFields.map(f => `${f}: number`).join(', ')}): Promise<${model.name} | null> {\n`;
        content += `    return this.prisma.${modelName}.findUnique({ \n`;
        content += `      where: { \n`;
        content += `        ${model.compositeIdFields.join('_')}: { ${model.compositeIdFields.map(f => `${f}`).join(', ')} }\n`;
        content += `      }\n`;
        content += `    });\n`;
        content += `  }\n\n`;
        
        content += `  async create(data: any): Promise<${model.name}> {\n`;
        content += `    return this.prisma.${modelName}.create({ data });\n`;
        content += `  }\n\n`;
        
        content += `  async update(${model.compositeIdFields.map(f => `${f}: number`).join(', ')}, data: any): Promise<${model.name}> {\n`;
        content += `    return this.prisma.${modelName}.update({ \n`;
        content += `      where: { \n`;
        content += `        ${model.compositeIdFields.join('_')}: { ${model.compositeIdFields.map(f => `${f}`).join(', ')} }\n`;
        content += `      }, \n`;
        content += `      data \n`;
        content += `    });\n`;
        content += `  }\n\n`;
        
        content += `  async delete(${model.compositeIdFields.map(f => `${f}: number`).join(', ')}): Promise<${model.name}> {\n`;
        content += `    return this.prisma.${modelName}.delete({ \n`;
        content += `      where: { \n`;
        content += `        ${model.compositeIdFields.join('_')}: { ${model.compositeIdFields.map(f => `${f}`).join(', ')} }\n`;
        content += `      }\n`;
        content += `    });\n`;
        content += `  }\n`;
      } else {
        content += `  async findById(id: number): Promise<${model.name} | null> {\n`;
        content += `    return this.prisma.${modelName}.findUnique({ where: { id } });\n`;
        content += `  }\n\n`;
        content += `  async create(data: any): Promise<${model.name}> {\n`;
        content += `    return this.prisma.${modelName}.create({ data });\n`;
        content += `  }\n\n`;
        content += `  async update(id: number, data: any): Promise<${model.name}> {\n`;
        content += `    return this.prisma.${modelName}.update({ where: { id }, data });\n`;
        content += `  }\n\n`;
        content += `  async delete(id: number): Promise<${model.name}> {\n`;
        content += `    return this.prisma.${modelName}.delete({ where: { id } });\n`;
        content += `  }\n`;
      }
    }
    
    content += `}\n`;
    return content;
  }

  private generateService(model: PrismaModel): string {
    const className = `${model.name}Service`;
    const repositoryName = `${model.name}Repository`;
    const repositoryVar = `${this.toCamelCase(model.name)}Repository`;
    
    let content = `import { Injectable } from '@nestjs/common';\n`;
    
    if (model.hasTimestamps && model.hasSoftDelete) {
      content += `import { BaseService } from '../../common/services/base.service';\n`;
    }
    
    content += `import { ${model.name} } from '@prisma/client';\n`;
    content += `import { ${repositoryName} } from './${this.toKebabCase(model.name)}.repository';\n`;
    content += `import { Create${model.name}Dto } from './dto/create-${this.toKebabCase(model.name)}.dto';\n`;
    content += `import { Update${model.name}Dto } from './dto/update-${this.toKebabCase(model.name)}.dto';\n\n`;
    
    content += `@Injectable()\n`;
    content += `export class ${className}`;
    
    if (model.hasTimestamps && model.hasSoftDelete) {
      content += ` extends BaseService<${model.name}>`;
    }
    
    content += ` {\n`;
    
    if (model.hasTimestamps && model.hasSoftDelete) {
      content += `  protected entityName = '${model.name}';\n\n`;
      content += `  constructor(protected readonly repository: ${repositoryName}) {\n`;
      content += `    super(repository);\n`;
      content += `  }\n\n`;
      content += `  // Add custom validation methods here\n`;
      content += `  // protected async validateCreate(data: Partial<${model.name}>): Promise<void> {\n`;
      content += `  //   // Custom create validation logic\n`;
      content += `  // }\n\n`;
      content += `  // protected async validateUpdate(id: number, data: Partial<${model.name}>): Promise<void> {\n`;
      content += `  //   // Custom update validation logic\n`;
      content += `  // }\n`;
    } else {
      content += `  constructor(private readonly ${repositoryVar}: ${repositoryName}) {}\n\n`;
      content += `  async findAll(): Promise<${model.name}[]> {\n`;
      content += `    return this.${repositoryVar}.findAll();\n`;
      content += `  }\n\n`;
      
      if (model.hasCompositeId) {
        content += `  async findByCompositeId(${model.compositeIdFields.map(f => `${f}: number`).join(', ')}): Promise<${model.name} | null> {\n`;
        content += `    return this.${repositoryVar}.findByCompositeId(${model.compositeIdFields.join(', ')});\n`;
        content += `  }\n\n`;
        content += `  async create(createDto: Create${model.name}Dto): Promise<${model.name}> {\n`;
        content += `    return this.${repositoryVar}.create(createDto);\n`;
        content += `  }\n\n`;
        content += `  async update(${model.compositeIdFields.map(f => `${f}: number`).join(', ')}, updateDto: Update${model.name}Dto): Promise<${model.name}> {\n`;
        content += `    return this.${repositoryVar}.update(${model.compositeIdFields.join(', ')}, updateDto);\n`;
        content += `  }\n\n`;
        content += `  async delete(${model.compositeIdFields.map(f => `${f}: number`).join(', ')}): Promise<${model.name}> {\n`;
        content += `    return this.${repositoryVar}.delete(${model.compositeIdFields.join(', ')});\n`;
        content += `  }\n`;
      } else {
        content += `  async findById(id: number): Promise<${model.name} | null> {\n`;
        content += `    return this.${repositoryVar}.findById(id);\n`;
        content += `  }\n\n`;
        content += `  async create(createDto: Create${model.name}Dto): Promise<${model.name}> {\n`;
        content += `    return this.${repositoryVar}.create(createDto);\n`;
        content += `  }\n\n`;
        content += `  async update(id: number, updateDto: Update${model.name}Dto): Promise<${model.name}> {\n`;
        content += `    return this.${repositoryVar}.update(id, updateDto);\n`;
        content += `  }\n\n`;
        content += `  async delete(id: number): Promise<${model.name}> {\n`;
        content += `    return this.${repositoryVar}.delete(id);\n`;
        content += `  }\n`;
      }
    }
    
    content += `}\n`;
    return content;
  }

  private generateController(model: PrismaModel): string {
    const className = `${model.name}Controller`;
    const serviceName = `${model.name}Service`;
    const serviceVar = `${this.toCamelCase(model.name)}Service`;
    const kebabName = this.toKebabCase(model.name);
    
    let content = `import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';\n`;
    content += `import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';\n`;
    
    if (model.hasTimestamps && model.hasSoftDelete) {
      content += `import { BaseController } from '../../common/controllers/base.controller';\n`;
    }
    
    content += `import { ${model.name} } from '@prisma/client';\n`;
    content += `import { ${serviceName} } from './${kebabName}.service';\n`;
    content += `import { Create${model.name}Dto } from './dto/create-${kebabName}.dto';\n`;
    content += `import { Update${model.name}Dto } from './dto/update-${kebabName}.dto';\n\n`;
    
    content += `@ApiTags('${kebabName}')\n`;
    content += `@Controller('${kebabName}')\n`;
    content += `export class ${className}`;
    
    if (model.hasTimestamps && model.hasSoftDelete) {
      content += ` extends BaseController<${model.name}>`;
    }
    
    content += ` {\n`;
    
    if (model.hasTimestamps && model.hasSoftDelete) {
      content += `  protected resourceName = '${model.name}';\n\n`;
      content += `  constructor(protected readonly service: ${serviceName}) {\n`;
      content += `    super(service);\n`;
      content += `  }\n\n`;
      content += `  // Add custom endpoints here\n`;
    } else {
      content += `  constructor(private readonly ${serviceVar}: ${serviceName}) {}\n\n`;
      
      content += `  @Post()\n`;
      content += `  @ApiOperation({ summary: 'Create ${model.name.toLowerCase()}' })\n`;
      content += `  @ApiResponse({ status: 201, description: 'The ${model.name.toLowerCase()} has been successfully created.' })\n`;
      content += `  create(@Body() createDto: Create${model.name}Dto): Promise<${model.name}> {\n`;
      content += `    return this.${serviceVar}.create(createDto);\n`;
      content += `  }\n\n`;
      
      content += `  @Get()\n`;
      content += `  @ApiOperation({ summary: 'Get all ${model.name.toLowerCase()}s' })\n`;
      content += `  @ApiResponse({ status: 200, description: 'Return all ${model.name.toLowerCase()}s.' })\n`;
      content += `  findAll(): Promise<${model.name}[]> {\n`;
      content += `    return this.${serviceVar}.findAll();\n`;
      content += `  }\n\n`;
      
      if (model.hasCompositeId) {
        const paramDecorators = model.compositeIdFields.map(f => `@Param('${f}', ParseIntPipe) ${f}: number`).join(', ');
        const paramPath = model.compositeIdFields.map(f => `:${f}`).join('/');
        const paramCall = model.compositeIdFields.join(', ');
        
        content += `  @Get('${paramPath}')\n`;
        content += `  @ApiOperation({ summary: 'Get ${model.name.toLowerCase()} by composite id' })\n`;
        content += `  @ApiResponse({ status: 200, description: 'Return the ${model.name.toLowerCase()}.' })\n`;
        content += `  findOne(${paramDecorators}): Promise<${model.name} | null> {\n`;
        content += `    return this.${serviceVar}.findByCompositeId(${paramCall});\n`;
        content += `  }\n\n`;
        
        content += `  @Patch('${paramPath}')\n`;
        content += `  @ApiOperation({ summary: 'Update ${model.name.toLowerCase()}' })\n`;
        content += `  @ApiResponse({ status: 200, description: 'The ${model.name.toLowerCase()} has been successfully updated.' })\n`;
        content += `  update(${paramDecorators}, @Body() updateDto: Update${model.name}Dto): Promise<${model.name}> {\n`;
        content += `    return this.${serviceVar}.update(${paramCall}, updateDto);\n`;
        content += `  }\n\n`;
        
        content += `  @Delete('${paramPath}')\n`;
        content += `  @ApiOperation({ summary: 'Delete ${model.name.toLowerCase()}' })\n`;
        content += `  @ApiResponse({ status: 200, description: 'The ${model.name.toLowerCase()} has been successfully deleted.' })\n`;
        content += `  remove(${paramDecorators}): Promise<${model.name}> {\n`;
        content += `    return this.${serviceVar}.delete(${paramCall});\n`;
        content += `  }\n`;
      } else {
        content += `  @Get(':id')\n`;
        content += `  @ApiOperation({ summary: 'Get ${model.name.toLowerCase()} by id' })\n`;
        content += `  @ApiResponse({ status: 200, description: 'Return the ${model.name.toLowerCase()}.' })\n`;
        content += `  findOne(@Param('id', ParseIntPipe) id: number): Promise<${model.name} | null> {\n`;
        content += `    return this.${serviceVar}.findById(id);\n`;
        content += `  }\n\n`;
        
        content += `  @Patch(':id')\n`;
        content += `  @ApiOperation({ summary: 'Update ${model.name.toLowerCase()}' })\n`;
        content += `  @ApiResponse({ status: 200, description: 'The ${model.name.toLowerCase()} has been successfully updated.' })\n`;
        content += `  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: Update${model.name}Dto): Promise<${model.name}> {\n`;
        content += `    return this.${serviceVar}.update(id, updateDto);\n`;
        content += `  }\n\n`;
        
        content += `  @Delete(':id')\n`;
        content += `  @ApiOperation({ summary: 'Delete ${model.name.toLowerCase()}' })\n`;
        content += `  @ApiResponse({ status: 200, description: 'The ${model.name.toLowerCase()} has been successfully deleted.' })\n`;
        content += `  remove(@Param('id', ParseIntPipe) id: number): Promise<${model.name}> {\n`;
        content += `    return this.${serviceVar}.delete(id);\n`;
        content += `  }\n`;
      }
    }
    
    content += `}\n`;
    return content;
  }

  private generateModuleFile(model: PrismaModel): string {
    const className = `${model.name}Module`;
    const controllerName = `${model.name}Controller`;
    const serviceName = `${model.name}Service`;
    const repositoryName = `${model.name}Repository`;
    const kebabName = this.toKebabCase(model.name);
    
    let content = `import { Module } from '@nestjs/common';\n`;
    content += `import { ${controllerName} } from './${kebabName}.controller';\n`;
    content += `import { ${serviceName} } from './${kebabName}.service';\n`;
    content += `import { ${repositoryName} } from './${kebabName}.repository';\n\n`;
    
    content += `@Module({\n`;
    content += `  controllers: [${controllerName}],\n`;
    content += `  providers: [${serviceName}, ${repositoryName}],\n`;
    content += `  exports: [${serviceName}],\n`;
    content += `})\n`;
    content += `export class ${className} {}\n`;
    
    return content;
  }

  public generateModuleForModel(modelName: string): void {
    const models = this.parseSchema();
    const model = models.find(m => m.name.toLowerCase() === modelName.toLowerCase());
    
    if (!model) {
      console.error(`Model "${modelName}" not found in schema`);
      process.exit(1);
    }

    const kebabName = this.toKebabCase(model.name);
    const modulePath = join(this.modulesPath, kebabName);
    const dtoPath = join(modulePath, 'dto');

    // Create directories
    if (!existsSync(modulePath)) {
      mkdirSync(modulePath, { recursive: true });
    }
    if (!existsSync(dtoPath)) {
      mkdirSync(dtoPath, { recursive: true });
    }

    // Generate files
    const files = [
      { path: join(dtoPath, `create-${kebabName}.dto.ts`), content: this.generateCreateDTO(model) },
      { path: join(dtoPath, `update-${kebabName}.dto.ts`), content: this.generateUpdateDTO(model) },
      { path: join(modulePath, `${kebabName}.repository.ts`), content: this.generateRepository(model) },
      { path: join(modulePath, `${kebabName}.service.ts`), content: this.generateService(model) },
      { path: join(modulePath, `${kebabName}.controller.ts`), content: this.generateController(model) },
      { path: join(modulePath, `${kebabName}.module.ts`), content: this.generateModuleFile(model) },
    ];

    for (const file of files) {
      writeFileSync(file.path, file.content);
      console.log(`✅ Generated: ${file.path}`);
    }

    console.log(`\n🎉 Module "${model.name}" generated successfully!`);
    console.log(`\n📁 Files created in: src/modules/${kebabName}/`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Add ${model.name}Module to your app.module.ts`);
    console.log(`   2. Review and customize the generated files`);
    console.log(`   3. Add any custom business logic to the service`);
    console.log(`   4. Add authentication guards if needed`);
  }

  public listModels(): void {
    const models = this.parseSchema();
    console.log('\n📋 Available models in schema.prisma:\n');
    
    for (const model of models) {
      const status = model.hasTimestamps && model.hasSoftDelete ? '🟢 (with base classes)' : '🟡 (basic CRUD)';
      console.log(`   ${model.name} ${status}`);
    }
    
    console.log('\n💡 Usage: npm run generate:module <ModelName>');
  }
}

// CLI interface
const args = process.argv.slice(2);
const generator = new ModuleGenerator();

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log('\n🚀 NestJS Module Generator\n');
  console.log('Usage:');
  console.log('  npm run generate:module <ModelName>  Generate module for specific model');
  console.log('  npm run generate:module --list       List all available models');
  console.log('  npm run generate:module --help       Show this help\n');
  console.log('Examples:');
  console.log('  npm run generate:module Product');
  console.log('  npm run generate:module User');
  console.log('  npm run generate:module --list\n');
} else if (args[0] === '--list' || args[0] === '-l') {
  generator.listModels();
} else {
  const modelName = args[0];
  generator.generateModuleForModel(modelName);
}