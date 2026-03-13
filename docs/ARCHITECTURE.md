# ARCHITECTURE.md — Arquitetura do Sistema

## Diagrama Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        MONOREPO (pnpm + Turborepo)          │
│                                                             │
│  ┌──────────────────┐          ┌──────────────────────────┐ │
│  │   apps/web       │  HTTP    │      apps/api            │ │
│  │   React + Vite   │ ──────►  │  Fastify + TypeScript    │ │
│  │   Port 5173      │          │  Port 3001               │ │
│  └──────────────────┘          └───────────┬──────────────┘ │
│                                            │                │
│  ┌─────────────────────────────────────┐   │                │
│  │         packages/                  │   │                │
│  │  @bewave/types  @bewave/schemas      │   │                │
│  │  @bewave/ui     @bewave/utils        │   │                │
│  └─────────────────────────────────────┘   │                │
└────────────────────────────────────────────┼────────────────┘
                                             │
                              ┌──────────────▼──────────────┐
                              │         PostgreSQL           │
                              │         Port 5432            │
                              └─────────────────────────────┘
                              ┌─────────────────────────────┐
                              │           Redis              │
                              │  Cache + Refresh Tokens      │
                              │         Port 6379            │
                              └─────────────────────────────┘
```

---

## Fluxo de Autenticação

```
Frontend                           Backend
   │                                  │
   │  POST /auth/login                │
   │  { email, password }   ────────► │
   │                                  │  Valida credenciais
   │                                  │  Gera access_token (15min)
   │                                  │  Gera refresh_token (7d)
   │                                  │  Salva refresh_token no Redis
   │                        ◄──────── │
   │  { access_token }                │  Set-Cookie: refresh_token (httpOnly)
   │                                  │
   │  [Zustand armazena access_token] │
   │                                  │
   │  GET /users                      │
   │  Authorization: Bearer <token>   │
   │                        ────────► │  Valida JWT
   │                        ◄──────── │  Retorna dados
   │                                  │
   │  [access_token expira...]        │
   │                                  │
   │  POST /auth/refresh              │
   │  Cookie: refresh_token ────────► │  Valida refresh no Redis
   │                        ◄──────── │  Novo access_token
```

---

## Fluxo do Kanban (DnD)

```
Usuário arrasta card
        │
        ▼
@dnd-kit detecta DragEndEvent
        │
        ▼
Optimistic Update (TanStack Query)
→ Atualiza posição na UI imediatamente
        │
        ▼
PATCH /api/v1/activities/:id/move
{ column_id: "novo-id", position: 2 }
        │
   ┌────┴────┐
   │ Sucesso │ → Confirma update, invalida query
   │ Falha   │ → Rollback para estado anterior
   └─────────┘
```

---

## Schema do Banco de Dados

O schema é gerenciado pelo **Prisma** e definido em `apps/api/prisma/schema.prisma`.
Consulte a seção **"5. Prisma ORM — Padrões"** no `PROJECT_RULES.md` para o schema completo.

Resumo das tabelas geradas pelo Prisma:

| Modelo | Tabela gerada | Descrição |
|---|---|---|
| `User` | `users` | Usuários do sistema (admin e membros) |
| `Client` | `clients` | Clientes e leads |
| `Workspace` | `workspaces` | Áreas de trabalho |
| `WorkspaceMember` | `workspace_members` | Relação N:N usuários ↔ workspaces |
| `Board` | `boards` | Quadros Kanban |
| `Column` | `columns` | Colunas de um board |
| `Activity` | `activities` | Cards do Kanban |
| `ActivityAssignee` | `activity_assignees` | Relação N:N atividades ↔ usuários |
| `FinanceEntry` | `finance_entries` | Entradas e saídas financeiras |

> **IDs:** Prisma usa `cuid()` por padrão neste projeto (`@default(cuid())`).
> **Soft delete:** campos `deletedAt DateTime?` nas entidades principais — sempre filtrar com `deletedAt: null` nas queries.

---

## Packages Compartilhados

### `@bewave/types`
Tipos TypeScript exportados manualmente. Exporta todas as entidades e DTOs.

```typescript
export type { User, UserRole } from './user'
export type { Client, ClientStatus } from './client'
export type { Board, Column, Activity, ActivityPriority } from './board'
export type { FinanceEntry, FinanceType } from './finance'
export type { PaginatedResponse, PaginationMeta, ApiError } from './api'
```

### `@bewave/schemas`
Schemas Zod usados tanto no frontend (validação de forms) quanto no backend (validação de request body).

```typescript
// Exemplo
export const createClientSchema = z.object({
  name: z.string().min(2).max(255),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  contractMonths: z.number().int().positive().default(12),
  paid: z.boolean().default(false),
  status: z.enum(['lead', 'active']).default('lead'),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
```

### `@bewave/ui`
Componentes shadcn/ui re-exportados com customizações do design system. Qualquer modificação ao design system vai aqui.

### `@bewave/utils`
Funções utilitárias puras: `formatCurrency`, `formatDate`, `cn`, `sleep`, etc.

---

## Turborepo Pipeline

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "db:migrate": { "cache": false },
    "db:generate": { "cache": false },
    "db:studio": { "cache": false, "persistent": true },
    "db:seed": { "cache": false }
  }
}
```

**Nota:** `^build` significa "build todas as dependências deste pacote antes de buildar ele". Isso garante que `@bewave/types` é buildado antes de `apps/web` e `apps/api`.