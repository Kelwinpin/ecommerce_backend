# 🚀 Gerador de Módulos NestJS

Script automatizado para gerar módulos completos do NestJS baseados nos models do Prisma Schema.

## 📋 Funcionalidades

- ✅ **Leitura automática** do schema Prisma
- ✅ **Geração completa** de módulos (Repository, Service, Controller, DTOs)
- ✅ **Detecção automática** de timestamps (createdAt, updatedAt, deletedAt)
- ✅ **Extensão das classes base** quando aplicável
- ✅ **Validações automáticas** com class-validator
- ✅ **Documentação Swagger** automática
- ✅ **Tipagem correta** para Decimal e outros tipos Prisma
- ✅ **Suporte a chaves compostas** (@@id([campo1, campo2]))

## 🛠️ Como Usar

### Listar modelos disponíveis

```bash
npm run generate:module --list
```

### Gerar módulo para um modelo específico

```bash
npm run generate:module <NomeDoModelo>
```

**Exemplos:**
```bash
npm run generate:module Product
npm run generate:module Order
npm run generate:module User
```

### Ver ajuda

```bash
npm run generate:module --help
```

## 📁 Estrutura Gerada

Para cada modelo, o script gera:

```
src/modules/<modelo-name>/
├── dto/
│   ├── create-<modelo-name>.dto.ts    # DTO para criação
│   └── update-<modelo-name>.dto.ts    # DTO para atualização
├── <modelo-name>.repository.ts         # Repository com CRUD
├── <modelo-name>.service.ts            # Service com lógica de negócios  
├── <modelo-name>.controller.ts         # Controller com endpoints REST
└── <modelo-name>.module.ts             # Module do NestJS
```

## 🔧 Tipos de Módulos Gerados

### 🟢 Com Classes Base (Modelos com timestamps e soft delete)

Para modelos que têm `createdAt`, `updatedAt` e `deletedAt`:

- **Repository** estende `BaseRepository`
- **Service** estende `BaseService`
- **Controller** estende `BaseController`
- **Funcionalidades**: CRUD completo, paginação, soft delete, busca, etc.

### 🟡 CRUD Básico (Modelos simples)

Para modelos sem timestamps ou apenas com alguns campos:

- **Repository** com métodos CRUD básicos
- **Service** com lógica simples
- **Controller** com endpoints RESTful padrão
- **Funcionalidades**: CRUD básico sem funcionalidades avançadas

### 🔗 Chaves Compostas (Modelos com @@id([campo1, campo2]))

Para modelos com chave primária composta:

- **Endpoints especiais**: `GET/PATCH/DELETE /:campo1/:campo2`
- **Métodos específicos**: `findByCompositeId()`, `update(campo1, campo2, data)`, etc.
- **Where clause correto**: `{ campo1_campo2: { campo1, campo2 } }`

**Exemplo**: Model `Category` com `@@id([categoryId, productId])` gera:
- `GET /category/:categoryId/:productId`
- `DELETE /category/:categoryId/:productId`

## 📝 Exemplo de Uso

### 1. Listar modelos disponíveis

```bash
npm run generate:module --list
```

**Saída:**
```
📋 Available models in schema.prisma:

   Users 🟢 (with base classes)
   Product 🟡 (basic CRUD)
   Order 🟢 (with base classes)
   Cart 🟢 (with base classes)
   ...

💡 Usage: npm run generate:module <ModelName>
```

### 2. Gerar módulo Product

```bash
npm run generate:module Product
```

**Saída:**
```
✅ Generated: /path/to/src/modules/product/dto/create-product.dto.ts
✅ Generated: /path/to/src/modules/product/dto/update-product.dto.ts
✅ Generated: /path/to/src/modules/product/product.repository.ts
✅ Generated: /path/to/src/modules/product/product.service.ts
✅ Generated: /path/to/src/modules/product/product.controller.ts
✅ Generated: /path/to/src/modules/product/product.module.ts

🎉 Module "Product" generated successfully!

📁 Files created in: src/modules/product/

📝 Next steps:
   1. Add ProductModule to your app.module.ts
   2. Review and customize the generated files
   3. Add any custom business logic to the service
   4. Add authentication guards if needed
```

### 3. Adicionar ao app.module.ts

```typescript
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [
    // outros módulos...
    ProductModule,
  ],
})
export class AppModule {}
```

## 🎨 Personalização

### Adicionar validações customizadas

No service gerado, você pode adicionar validações customizadas:

```typescript
// product.service.ts
protected async validateCreate(data: Partial<Product>): Promise<void> {
  if (data.sku) {
    const exists = await this.repository.exists({ sku: data.sku });
    if (exists) {
      throw new ConflictException('Product with this SKU already exists');
    }
  }
}
```

### Adicionar endpoints customizados

No controller, você pode adicionar endpoints específicos:

```typescript
// product.controller.ts
@Get('category/:categoryId')
async findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
  return this.service.findByCategory(categoryId);
}
```

### Configurar campos de busca

No repository, configure quais campos serão usados na busca textual:

```typescript
// product.repository.ts
protected getSearchFields(): string[] {
  return ['name', 'description', 'sku'];
}
```

## 🔍 Campos Gerados Automaticamente

### DTOs

O script analisa o schema Prisma e gera DTOs com:

- **Campos obrigatórios**: `@ApiProperty()` + `@IsNotEmpty()`
- **Campos opcionais**: `@ApiPropertyOptional()` + `@IsOptional()`
- **Validações por tipo**:
  - String: `@IsString()`
  - Number/Int: `@IsNumber()`
  - Boolean: `@IsBoolean()`
  - DateTime: `@IsDateString()`
  - Decimal: `@IsNumber()` + importação do tipo `Decimal`

### Exclusões Automáticas

Os seguintes campos são automaticamente excluídos dos DTOs:

- `id` (chave primária)
- `createdAt`, `updatedAt`, `deletedAt` (timestamps)
- Campos de relação (não são incluídos diretamente)

## ⚙️ Configuração

### Caminhos do Projeto

O script assume a seguinte estrutura:

- **Schema Prisma**: `src/database/prisma/schema.prisma`
- **Módulos**: `src/modules/`
- **Classes Base**: `src/common/`

### Dependências Necessárias

Certifique-se de ter instalado:

- `@nestjs/common`
- `@nestjs/swagger`
- `@prisma/client`
- `class-validator`
- `class-transformer`

## 🐛 Troubleshooting

### Erro: "Model not found"

Verifique se o nome do modelo está correto:

```bash
npm run generate:module --list
```

### Erro de compilação TypeScript

- Verifique se todas as dependências estão instaladas
- Execute `npm run build` para verificar erros
- Revise os imports gerados

### Campos faltando no DTO

O script pode não detectar todos os campos automaticamente. Você pode:

1. Editar manualmente o DTO gerado
2. Atualizar o script em `scripts/generate-module.ts`

## 📚 Documentação Relacionada

- [Arquitetura de Classes Base](../src/common/README.md)
- [NestJS Documentation](https://nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Class Validator](https://github.com/typestack/class-validator)

## 🤝 Contribuindo

Para melhorar o gerador:

1. Edite o arquivo `scripts/generate-module.ts`
2. Teste com diferentes modelos
3. Commit suas melhorias

---

💡 **Dica**: Use sempre o gerador como ponto de partida e customize conforme necessário para suas regras de negócio específicas!