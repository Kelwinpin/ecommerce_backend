# 🛒 E-commerce API - Documentação do Projeto

> Sistema de e-commerce completo desenvolvido em NestJS com Prisma ORM

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
3. [Pré-requisitos](#-pré-requisitos)
4. [Instalação e Configuração](#-instalação-e-configuração)
5. [Estrutura do Projeto](#-estrutura-do-projeto)
6. [Módulos da Aplicação](#-módulos-da-aplicação)
7. [Banco de Dados](#-banco-de-dados)
8. [Autenticação e Autorização](#-autenticação-e-autorização)
9. [API Endpoints](#-api-endpoints)
10. [Testes](#-testes)
11. [Deploy](#-deploy)
12. [Contribuição](#-contribuição)

## 🎯 Visão Geral

Este projeto é uma API REST completa para e-commerce que oferece:

- ✅ **Gestão de usuários** com autenticação JWT
- ✅ **Catálogo de produtos** com categorias e imagens
- ✅ **Sistema de carrinho** de compras
- ✅ **Processamento de pedidos** e pagamentos
- ✅ **Sistema de avaliações** e reviews
- ✅ **Cupons de desconto** e promoções
- ✅ **Lista de desejos** (wishlist)
- ✅ **Newsletter** e notificações
- ✅ **Gestão de estoque** com movimentações
- ✅ **Cache Redis** para performance
- ✅ **Rate limiting** e segurança
- ✅ **Documentação automática** com Swagger

## 🚀 Tecnologias Utilizadas

### Backend
- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[Prisma](https://prisma.io/)** - ORM moderno para TypeScript
- **[PostgreSQL](https://postgresql.org/)** - Banco de dados relacional
- **[Redis](https://redis.io/)** - Cache em memória
- **[JWT](https://jwt.io/)** - Autenticação stateless

### Ferramentas de Desenvolvimento
- **TypeScript** - Linguagem tipada
- **Jest** - Framework de testes
- **ESLint** - Linter de código
- **Prettier** - Formatador de código
- **Husky** - Git hooks
- **Docker** - Containerização

### Bibliotecas Principais
- `@nestjs/passport` - Autenticação
- `@nestjs/jwt` - Tokens JWT
- `@nestjs/config` - Configurações
- `@nestjs/cache-manager` - Sistema de cache
- `@nestjs/bull` - Filas de processamento
- `class-validator` - Validação de dados
- `bcrypt` - Hash de senhas

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (versão 13 ou superior)
- **Redis** (versão 6 ou superior)
- **Git**

## ⚙️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/ecommerce-api.git
cd ecommerce-api
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/ecommerce"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_EXPIRES_IN="24h"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# App
PORT=3000
NODE_ENV="development"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"

# Upload de arquivos
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_PATH="./uploads"

# Paginação
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# Rate Limiting
THROTTLE_TTL=60000  # 1 minuto
THROTTLE_LIMIT=100  # 100 requests por minuto
```

### 4. Configure o banco de dados

```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrations
npx prisma migrate deploy

# (Opcional) Popule com dados de exemplo
npx prisma db seed
```

### 5. Inicie a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app.module.ts                 # Módulo principal
├── main.ts                       # Arquivo de entrada
├── common/                       # Código compartilhado
│   ├── decorators/              # Decorators customizados
│   │   ├── roles.decorator.ts
│   │   └── user.decorator.ts
│   ├── dto/                     # DTOs globais
│   │   ├── pagination.dto.ts
│   │   └── response.dto.ts
│   ├── enums/                   # Enums globais
│   │   ├── order-status.enum.ts
│   │   └── user-role.enum.ts
│   ├── exceptions/              # Filtros de exceção
│   │   └── http-exception.filter.ts
│   ├── guards/                  # Guards globais
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/            # Interceptors globais
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── pipes/                   # Pipes globais
│   │   └── validation.pipe.ts
│   └── utils/                   # Funções utilitárias
│       ├── pagination.util.ts
│       └── hash.util.ts
├── config/                      # Configurações
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── redis.config.ts
├── database/                    # Configuração do Prisma
│   ├── database.module.ts
│   ├── database.service.ts
│   └── prisma/
│       ├── schema.prisma
│       ├── migrations/
│       └── seeds/
└── modules/                     # Módulos da aplicação
    ├── auth/                    # Autenticação
    ├── users/                   # Usuários
    ├── products/                # Produtos
    ├── categories/              # Categorias
    ├── orders/                  # Pedidos
    ├── carts/                   # Carrinho
    ├── payments/                # Pagamentos
    ├── reviews/                 # Avaliações
    ├── coupons/                 # Cupons
    ├── wishlists/               # Lista de desejos
    └── newsletter/              # Newsletter
```

## 🧩 Módulos da Aplicação

### 🔐 Auth Module
- **Responsabilidade**: Autenticação e autorização
- **Features**: Login, registro, JWT tokens, password reset
- **Endpoints**: `/auth/login`, `/auth/register`, `/auth/refresh`

### 👥 Users Module
- **Responsabilidade**: Gestão de usuários
- **Features**: CRUD de usuários, perfis, endereços
- **Endpoints**: `/users`, `/users/:id`, `/users/:id/addresses`

### 📦 Products Module
- **Responsabilidade**: Catálogo de produtos
- **Features**: CRUD de produtos, imagens, categorias, estoque
- **Endpoints**: `/products`, `/products/:id`, `/products/search`

### 🛒 Carts Module
- **Responsabilidade**: Carrinho de compras
- **Features**: Adicionar/remover itens, calcular totais
- **Endpoints**: `/carts`, `/carts/items`, `/carts/clear`

### 📋 Orders Module
- **Responsabilidade**: Processamento de pedidos
- **Features**: Criar pedidos, acompanhar status, histórico
- **Endpoints**: `/orders`, `/orders/:id`, `/orders/:id/status`

### 💳 Payments Module
- **Responsabilidade**: Processamento de pagamentos
- **Features**: Múltiplos gateways, webhooks, reembolsos
- **Endpoints**: `/payments`, `/payments/:id/refund`

## 🗄️ Banco de Dados

### Esquema Principal

O banco de dados utiliza PostgreSQL com as seguintes entidades principais:

- **users** - Dados dos usuários
- **products** - Catálogo de produtos
- **orders** - Pedidos realizados
- **order_items** - Itens dos pedidos
- **carts** - Carrinhos de compra
- **cart_items** - Itens dos carrinhos
- **payments** - Transações de pagamento
- **reviews** - Avaliações de produtos
- **coupons** - Cupons de desconto
- **addresses** - Endereços dos usuários

### Migrations

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Resetar banco (apenas desenvolvimento)
npx prisma migrate reset
```

### Seeds

```bash
# Executar seeds
npx prisma db seed
```

## 🔐 Autenticação e Autorização

### JWT Authentication

O sistema utiliza JWT (JSON Web Tokens) para autenticação stateless:

```typescript
// Payload do token
{
  sub: userId,
  email: userEmail,
  iat: issuedAt,
  exp: expiresAt
}
```

### Roles e Permissões

- **ADMIN** - Acesso total ao sistema
- **USER** - Acesso limitado às próprias informações
- **GUEST** - Acesso apenas a endpoints públicos

### Proteção de Rotas

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Get('admin-only')
adminOnlyEndpoint() {
  // Apenas admins podem acessar
}
```

## 🔗 API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrar usuário | ❌ |
| POST | `/auth/login` | Login | ❌ |
| POST | `/auth/refresh` | Renovar token | ✅ |
| POST | `/auth/logout` | Logout | ✅ |
| POST | `/auth/forgot-password` | Esqueci minha senha | ❌ |

### Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/users` | Listar usuários | ✅ Admin |
| GET | `/users/:id` | Buscar usuário | ✅ |
| PUT | `/users/:id` | Atualizar usuário | ✅ |
| DELETE | `/users/:id` | Remover usuário | ✅ |
| GET | `/users/:id/orders` | Pedidos do usuário | ✅ |

### Produtos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/products` | Listar produtos | ❌ |
| GET | `/products/:id` | Buscar produto | ❌ |
| POST | `/products` | Criar produto | ✅ Admin |
| PUT | `/products/:id` | Atualizar produto | ✅ Admin |
| DELETE | `/products/:id` | Remover produto | ✅ Admin |
| GET | `/products/search` | Buscar produtos | ❌ |

### Carrinho

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/carts` | Buscar carrinho | ✅ |
| POST | `/carts/items` | Adicionar item | ✅ |
| PUT | `/carts/items/:id` | Atualizar item | ✅ |
| DELETE | `/carts/items/:id` | Remover item | ✅ |
| DELETE | `/carts/clear` | Limpar carrinho | ✅ |

### Pedidos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/orders` | Listar pedidos | ✅ |
| GET | `/orders/:id` | Buscar pedido | ✅ |
| POST | `/orders` | Criar pedido | ✅ |
| PUT | `/orders/:id/status` | Atualizar status | ✅ Admin |
| POST | `/orders/:id/cancel` | Cancelar pedido | ✅ |

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Estrutura de Testes

```
test/
├── unit/                    # Testes unitários
│   ├── users/
│   ├── products/
│   └── orders/
├── integration/             # Testes de integração
│   ├── auth.e2e-spec.ts
│   ├── users.e2e-spec.ts
│   └── products.e2e-spec.ts
└── fixtures/               # Dados de teste
    ├── users.fixture.ts
    └── products.fixture.ts
```

### Exemplo de Teste

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should create a user', async () => {
    const userData = { email: 'test@test.com', username: 'test' };
    const result = await service.create(userData);
    
    expect(result).toBeDefined();
    expect(result.email).toBe(userData.email);
  });
});
```

## 🚀 Deploy

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ecommerce
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Deploy na Nuvem

#### Heroku
```bash
# Login no Heroku
heroku login

# Criar app
heroku create seu-app-name

# Configurar variáveis
heroku config:set DATABASE_URL=sua-database-url
heroku config:set JWT_SECRET=seu-jwt-secret

# Deploy
git push heroku main
```

#### Vercel
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel
```

## 📊 Monitoramento e Logs

### Health Check

```typescript
@Get('health')
getHealth() {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

### Métricas

- **Response time** médio
- **Throughput** de requests
- **Error rate** por endpoint
- **Database** connection pool
- **Redis** hit/miss ratio

### Logs Estruturados

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('UsersService');

logger.log('User created successfully', { userId: user.id });
logger.error('Failed to create user', { error: error.message });
```

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -am 'Add nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. **Abra** um Pull Request

### Padrões de Código

- Use **TypeScript** para todo o código
- Siga o **ESLint** e **Prettier**
- Escreva **testes** para novas features
- Documente **APIs** com decorators Swagger
- Use **conventional commits**

### Estrutura de Commits

```
feat: add user authentication
fix: resolve cart calculation bug
docs: update API documentation
test: add unit tests for products service
refactor: improve error handling
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@ecommerce-api.com
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/ecommerce-api/issues)
- **Wiki**: [GitHub Wiki](https://github.com/seu-usuario/ecommerce-api/wiki)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/ecommerce-api/discussions)

---

⭐ **Se este projeto foi útil, considere dar uma estrela no GitHub!**

Desenvolvido com ❤️ por Kelwinpin