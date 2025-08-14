# 📚 Arquitetura de Classes Genéricas - Common Module

Este documento explica a arquitetura de classes genéricas implementada no módulo `common` para promover reusabilidade e padronização no projeto NestJS com Prisma.

## 📁 Estrutura de Arquivos

```
src/common/
├── controllers/
│   └── base.controller.ts       # Controller genérico com operações CRUD
├── services/
│   └── base.service.ts          # Service genérico com lógica de negócios
├── repositories/
│   └── base.repository.ts       # Repository genérico para acesso ao banco
├── interfaces/
│   └── base.interface.ts        # Interfaces e tipos compartilhados
├── dto/
│   ├── pagination.dto.ts        # DTO para paginação
│   └── response.dto.ts          # DTOs de resposta padronizados
└── README.md                     # Esta documentação
```

## 🎯 Objetivo

Fornecer classes base abstratas que implementam operações CRUD comuns, reduzindo duplicação de código e garantindo consistência em toda a aplicação.

## 🔧 Como Funciona

### 1. **BaseEntity Interface**
Define a estrutura básica que todas as entidades devem seguir:

```typescript
interface BaseEntity {
  id: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;  // Para soft delete
}
```

### 2. **BaseRepository**
Classe abstrata que encapsula operações do Prisma:

#### Funcionalidades:
- ✅ Operações CRUD completas
- ✅ Paginação automática
- ✅ Busca com filtros
- ✅ Soft delete
- ✅ Transações
- ✅ Contagem e verificação de existência

#### Métodos principais:
```typescript
findAll(params?: PaginationParams)  // Lista com paginação
findById(id: number)                // Busca por ID
findOne(where: any)                  // Busca única customizada
create(data: T)                      // Criar registro
update(id: number, data: T)         // Atualizar registro
delete(id: number, options?)        // Deletar (soft ou hard)
exists(where: any)                   // Verificar existência
count(where?: any)                   // Contar registros
transaction(fn)                      // Executar em transação
```

### 3. **BaseService**
Classe abstrata com lógica de negócios genérica:

#### Funcionalidades:
- ✅ Validações customizáveis
- ✅ Tratamento de erros padronizado
- ✅ Mensagens de erro contextualizadas
- ✅ Hooks para validação (create, update, delete)

#### Métodos de validação (override nas classes filhas):
```typescript
protected validateCreate(data: T): Promise<void>
protected validateUpdate(id: number, data: T): Promise<void>
protected validateDelete(id: number): Promise<void>
```

### 4. **BaseController**
Controller abstrato com endpoints RESTful padrão:

#### Endpoints disponíveis:
```
GET    /resource           # Listar com paginação
GET    /resource/:id       # Buscar por ID
GET    /resource/count     # Contar registros
GET    /resource/exists    # Verificar existência
POST   /resource           # Criar registro
POST   /resource/bulk      # Criar múltiplos
PUT    /resource/:id       # Atualizar registro
DELETE /resource/:id       # Soft delete
DELETE /resource/:id/permanent  # Hard delete
```

## 💻 Como Usar

### Exemplo 1: Criando um novo módulo Product

#### 1. Criar o Repository:
```typescript
// src/modules/product/product.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Product } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  protected model = this.prisma.product;

  constructor(protected readonly prisma: DatabaseService) {
    super(prisma);
  }

  // Override para campos de busca customizados
  protected getSearchFields(): string[] {
    return ['name', 'description', 'sku'];
  }
}
```

#### 2. Criar o Service:
```typescript
// src/modules/product/product.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { Product } from '@prisma/client';
import { ProductRepository } from './product.repository';

@Injectable()
export class ProductService extends BaseService<Product> {
  protected entityName = 'Product';

  constructor(protected readonly repository: ProductRepository) {
    super(repository);
  }

  // Validação customizada na criação
  protected async validateCreate(data: Partial<Product>): Promise<void> {
    if (data.sku) {
      const exists = await this.repository.exists({ sku: data.sku });
      if (exists) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }
  }

  // Validação customizada na atualização
  protected async validateUpdate(id: number, data: Partial<Product>): Promise<void> {
    if (data.stockQuantity && data.stockQuantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }
  }

  // Método adicional específico do Product
  async findByCategory(categoryId: number) {
    return this.repository.findMany({
      where: { categoryId },
      include: { images: true }
    });
  }
}
```

#### 3. Criar o Controller:
```typescript
// src/modules/product/product.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../../common/controllers/base.controller';
import { Product } from '@prisma/client';
import { ProductService } from './product.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductController extends BaseController<Product> {
  protected resourceName = 'Product';

  constructor(protected readonly service: ProductService) {
    super(service);
  }

  // Endpoint adicional específico
  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.service.findByCategory(categoryId);
  }
}
```

#### 4. Configurar o Module:
```typescript
// src/modules/product/product.module.ts
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
```

### Exemplo 2: Usando com o módulo User existente

Para usar as classes genéricas com o módulo User já criado:

```typescript
// user.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { User } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  protected model = this.prisma.user;

  constructor(protected readonly prisma: DatabaseService) {
    super(prisma);
  }

  protected getSearchFields(): string[] {
    return ['email', 'username', 'phone'];
  }

  // Método específico do User
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }
}
```

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { User } from '@prisma/client';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService extends BaseService<User> {
  protected entityName = 'User';

  constructor(protected readonly repository: UserRepository) {
    super(repository);
  }

  protected async validateCreate(data: Partial<User>): Promise<void> {
    if (data.email) {
      const exists = await this.repository.exists({ email: data.email });
      if (exists) {
        throw new ConflictException('Email already registered');
      }
    }
  }

  // Override do create para hashear senha
  async create(data: Partial<User>): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return super.create(data);
  }
}
```

## 🎨 Personalizações

### Customizando a Paginação

```typescript
// No Service
async findAll(params?: PaginationParams) {
  // Adicionar filtros específicos
  const customParams = {
    ...params,
    filters: {
      ...params?.filters,
      isActive: true,  // Apenas produtos ativos
    }
  };
  
  return super.findAll(customParams);
}
```

### Implementando Soft Delete Customizado

```typescript
// No Repository
async delete(id: number, options?: SoftDeleteOptions): Promise<T> {
  // Lógica adicional antes do delete
  await this.model.update({
    where: { id },
    data: { 
      deletedAt: new Date(),
      deletedBy: getCurrentUserId() // Customização
    }
  });
}
```

### Adicionando Includes Automáticos

```typescript
// No Repository
async findById(id: number): Promise<Product | null> {
  return super.findById(id, {
    images: true,
    category: true,
    reviews: {
      include: { user: true }
    }
  });
}
```

## 📊 Resposta Paginada

Estrutura da resposta paginada:

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## 🔍 Query Parameters para Paginação

```typescript
GET /products?page=1&limit=20&search=laptop&orderBy=price&order=asc

Query params disponíveis:
- page: número da página (default: 1)
- limit: itens por página (default: 20)
- search: busca textual
- orderBy: campo para ordenação
- order: 'asc' ou 'desc'
- Filtros customizados via query string
```

## ⚠️ Considerações Importantes

1. **Soft Delete**: Por padrão, registros com `deletedAt` não são retornados nas queries
2. **Transações**: Use o método `transaction()` para operações que envolvem múltiplas tabelas
3. **Validações**: Sempre implemente validações customizadas nos métodos `validate*`
4. **Performance**: Para queries complexas, crie métodos específicos no Repository
5. **Segurança**: Validações de autorização devem ser feitas no Service ou Guard

## 🚀 Benefícios

- ✅ **DRY (Don't Repeat Yourself)**: Código reutilizável
- ✅ **Manutenibilidade**: Mudanças centralizadas
- ✅ **Padronização**: APIs consistentes
- ✅ **Produtividade**: Menos código para escrever
- ✅ **Testabilidade**: Fácil de mockar e testar
- ✅ **Type Safety**: Totalmente tipado com TypeScript

## 📝 Checklist para Novo Módulo

- [ ] Criar Repository estendendo BaseRepository
- [ ] Definir o model do Prisma no Repository
- [ ] Criar Service estendendo BaseService
- [ ] Definir entityName no Service
- [ ] Implementar validações customizadas se necessário
- [ ] Criar Controller estendendo BaseController
- [ ] Definir resourceName no Controller
- [ ] Adicionar métodos específicos do domínio
- [ ] Configurar o Module com providers
- [ ] Adicionar documentação Swagger

## 🔗 Links Úteis

- [NestJS Documentation](https://nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

💡 **Dica**: Comece sempre estendendo as classes base e adicione customizações conforme necessário. Isso garante que você tenha todas as funcionalidades padrão desde o início!