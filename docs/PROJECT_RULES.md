# PROJECT_RULES.md — Padrões e Convenções do Projeto

## 1. Gerenciamento de Dependências

### Regras gerais
- Usar **pnpm** como package manager (nunca npm ou yarn neste projeto).
- Dependências compartilhadas entre apps devem estar no `package.json` do pacote `/packages/` correspondente.
- Dependências de desenvolvimento globais (eslint, prettier, typescript) ficam na **raiz** do monorepo.
- Nunca duplicar dependências entre apps se puder ser extraída para um package.

### Como adicionar dependências
```bash
# Adicionar dep em um app específico
pnpm add <pkg> --filter web
pnpm add <pkg> --filter api

# Adicionar dep de dev global
pnpm add -D <pkg> -w

# Adicionar dep em um package compartilhado
pnpm add <pkg> --filter @bewave/ui
```

---

## 2. Estrutura de Pastas Detalhada

### Backend (`apps/api`)
```
apps/api/
├── src/
│   ├── modules/
│   │   └── <module>/
│   │       ├── <module>.controller.ts   # Handlers das rotas
│   │       ├── <module>.service.ts      # Lógica de negócio (usa Prisma Client)
│   │       ├── <module>.schema.ts       # Zod schemas (validação)
│   │       └── <module>.routes.ts       # Registro das rotas no Fastify
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error-handler.ts
│   │   ├── plugins/
│   │   │   ├── cors.plugin.ts
│   │   │   ├── jwt.plugin.ts
│   │   │   └── swagger.plugin.ts
│   │   └── utils/
│   │       ├── pagination.ts
│   │       └── response.ts
│   ├── lib/
│   │   └── prisma.ts            # Prisma Client singleton
│   └── app.ts                   # Fastify app factory
├── prisma/
│   ├── schema.prisma            # Schema do banco
│   ├── migrations/              # Migrations versionadas
│   └── seed.ts                  # Seeds de desenvolvimento
├── tests/
│   ├── unit/
│   └── integration/
├── tsconfig.json
└── package.json
```

### Frontend (`apps/web`)
```
apps/web/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── users/
│   │   │   ├── UsersPage.tsx
│   │   │   └── UserFormPage.tsx
│   │   ├── clients/
│   │   │   ├── ClientsPage.tsx
│   │   │   └── ClientFormPage.tsx
│   │   ├── boards/
│   │   │   ├── WorkspacesPage.tsx
│   │   │   └── BoardPage.tsx
│   │   └── finance/
│   │       └── FinancePage.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # Layout principal com sidebar
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── shared/
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── PageHeader.tsx
│   │   └── kanban/
│   │       ├── Board.tsx
│   │       ├── Column.tsx
│   │       ├── ActivityCard.tsx
│   │       └── ActivityModal.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUsers.ts
│   │   ├── useClients.ts
│   │   ├── useBoards.ts
│   │   └── useFinance.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   └── ui.store.ts
│   ├── services/
│   │   ├── api.ts              # Axios instance + interceptors
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── clients.service.ts
│   │   ├── boards.service.ts
│   │   └── finance.service.ts
│   ├── lib/
│   │   ├── query-client.ts     # TanStack Query config
│   │   └── utils.ts            # cn(), formatCurrency(), etc.
│   └── routes/
│       ├── index.tsx
│       └── PrivateRoute.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Padrões de Componentes React

### Estrutura padrão de um componente de página

```tsx
// src/pages/clients/ClientsPage.tsx

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { useClients } from '@/hooks/useClients'
import { columns } from './clients-columns'

export default function ClientsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useClients({ page })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes e leads"
        action={
          <Button href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        pagination={data?.meta}
        onPageChange={setPage}
      />
    </div>
  )
}
```

### Estrutura padrão de um hook de dados

```typescript
// src/hooks/useClients.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsService } from '@/services/clients.service'
import type { ClientFilters, CreateClientInput } from '@saas/types'

const QUERY_KEY = 'clients'

export function useClients(filters?: ClientFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => clientsService.list(filters),
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}
```

### Estrutura padrão de um service

```typescript
// src/services/clients.service.ts

import { api } from './api'
import type { Client, CreateClientInput, ClientFilters, PaginatedResponse } from '@bewave/types'

export const clientsService = {
  list: (filters?: ClientFilters) =>
    api.get<PaginatedResponse<Client>>('/clients', { params: filters }).then(r => r.data),

  create: (data: CreateClientInput) =>
    api.post<Client>('/clients', data).then(r => r.data),

  update: (id: string, data: Partial<CreateClientInput>) =>
    api.put<Client>(`/clients/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/clients/${id}`),
}
```

---

## 4. Padrões de Backend (Fastify)

### Estrutura de um módulo

```typescript
// src/modules/clients/clients.routes.ts
import type { FastifyInstance } from 'fastify'
import { ClientsController } from './clients.controller'
import { authenticate } from '@/shared/middleware/auth.middleware'

export async function clientsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate)

  fastify.get('/', ClientsController.list)
  fastify.post('/', ClientsController.create)
  fastify.get('/:id', ClientsController.findById)
  fastify.put('/:id', ClientsController.update)
  fastify.delete('/:id', ClientsController.remove)
}
```

```typescript
// src/modules/clients/clients.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify'
import { ClientsService } from './clients.service'
import { createClientSchema, listClientsSchema } from './clients.schema'

export class ClientsController {
  static async list(req: FastifyRequest, reply: FastifyReply) {
    const filters = listClientsSchema.parse(req.query)
    const result = await ClientsService.list(filters)
    return reply.send({ data: result.items, meta: result.meta })
  }

  static async create(req: FastifyRequest, reply: FastifyReply) {
    const body = createClientSchema.parse(req.body)
    const client = await ClientsService.create(body)
    return reply.status(201).send({ data: client })
  }
}
```

### Tratamento de Erros

```typescript
// Usar AppError customizado
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: unknown,
  ) {
    super(message)
  }
}

// Exemplo de uso
throw new AppError('CLIENT_NOT_FOUND', 'Cliente não encontrado', 404)
```

---

## 5. Prisma ORM — Padrões

### Singleton do Prisma Client

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Schema principal (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  admin
  member
}

enum ClientStatus {
  lead
  active
}

enum ActivityPriority {
  low
  medium
  high
  urgent
}

enum FinanceType {
  income
  expense
}

model User {
  id           String    @id @default(cuid())
  name         String
  role         UserRole  @default(member)
  phone        String?
  email        String    @unique
  passwordHash String
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  workspaces   WorkspaceMember[]
  activities   ActivityAssignee[]
}

model Client {
  id              String        @id @default(cuid())
  name            String
  address         String?
  phone           String?
  email           String?
  contractMonths  Int           @default(12)
  paid            Boolean       @default(false)
  status          ClientStatus  @default(lead)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())

  members WorkspaceMember[]
  boards  Board[]
}

model WorkspaceMember {
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  role        String    @default("member")

  @@id([workspaceId, userId])
}

model Board {
  id          String    @id @default(cuid())
  name        String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String
  createdAt   DateTime  @default(now())

  columns Column[]
}

model Column {
  id        String   @id @default(cuid())
  title     String
  position  Int      @default(0)
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  boardId   String
  createdAt DateTime @default(now())

  activities Activity[]
}

model Activity {
  id          String           @id @default(cuid())
  title       String
  description String?
  priority    ActivityPriority @default(medium)
  category    String?
  position    Int              @default(0)
  column      Column           @relation(fields: [columnId], references: [id], onDelete: Cascade)
  columnId    String
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  deletedAt   DateTime?

  assignees ActivityAssignee[]
}

model ActivityAssignee {
  activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  activityId String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String

  @@id([activityId, userId])
}

model FinanceEntry {
  id          String      @id @default(cuid())
  type        FinanceType
  amount      Int
  description String
  category    String?
  date        DateTime    @db.Date
  createdAt   DateTime    @default(now())
}
```

### Padrão de uso nos services

```typescript
// src/modules/clients/clients.service.ts
import { prisma } from '@/lib/prisma'
import { AppError } from '@/shared/errors/app-error'
import type { CreateClientInput } from '@bewave/schemas'

export class ClientsService {
  static async list(filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page ?? 1
    const limit = filters?.limit ?? 20
    const skip = (page - 1) * limit

    const where = {
      deletedAt: null,
      ...(filters?.status && { status: filters.status as any }),
    }

    const [items, total] = await prisma.$transaction([
      prisma.client.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.client.count({ where }),
    ])

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  }

  static async create(data: CreateClientInput) {
    return prisma.client.create({ data })
  }

  static async findById(id: string) {
    const client = await prisma.client.findFirst({ where: { id, deletedAt: null } })
    if (!client) throw new AppError('CLIENT_NOT_FOUND', 'Cliente não encontrado', 404)
    return client
  }

  static async remove(id: string) {
    await this.findById(id)
    return prisma.client.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
```

---

## 6. Variáveis de Ambiente

### `.env.example` (raiz do monorepo)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/saas_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=development
API_PORT=3001
API_HOST=0.0.0.0

# Frontend (Vite — prefixo VITE_)
VITE_API_URL=http://localhost:3001/api/v1
```

---

## 7. Git Workflow

### Branches
```
main          → Produção (protegida)
develop       → Integração
feature/*     → Novas funcionalidades
fix/*         → Correções de bug
chore/*       → Manutenção, deps, configs
```

### Fluxo
```bash
# Criar feature
git checkout develop
git pull origin develop
git checkout -b feature/clients-crud

# Trabalhar... commits...

# PR para develop (nunca direto para main)
git push origin feature/clients-crud
# → Abrir Pull Request no GitHub
```

### Padrão de PR
- Título seguindo Conventional Commits
- Descrição: O que foi feito, como testar, screenshots se UI
- Mínimo 1 review antes de merge
- CI deve passar (lint + tests + build)

---

## 8. Kanban — Regras de Implementação

O Kanban usa `@dnd-kit` com a seguinte estrutura de dados:

```typescript
type Board = {
  id: string
  name: string
  columns: Column[]
}

type Column = {
  id: string
  title: string
  position: number
  activities: Activity[]
}

type Activity = {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  position: number
  assignees: User[]
}
```

**Regra de DnD:** Ao soltar um card em nova posição, fazer PATCH imediato na API com o novo `column_id` e `position`. Usar **optimistic update** no TanStack Query para não travar a UI.

---

## 9. Financeiro — Regras

```typescript
type FinanceEntry = {
  id: string
  type: 'income' | 'expense'
  amount: number           // Em centavos (evitar float para dinheiro)
  description: string
  category: string
  date: string             // ISO 8601
  createdAt: string
}
```

**Importante:** Valores monetários sempre em **centavos** (inteiros) no banco e API. Converter para display apenas no frontend com `formatCurrency()`.

```typescript
// lib/utils.ts
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}
```

---

*Documento vivo — atualizar sempre que novos padrões forem estabelecidos.*