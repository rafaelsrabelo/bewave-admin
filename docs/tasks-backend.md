# TASKS — Backend (apps/api)

> Marque cada task com `[x]` ao concluir.
> Siga a ordem — cada fase depende da anterior.

---

## FASE 1 — Setup inicial

- [x] Inicializar projeto com `pnpm init` em `apps/api`
- [x] Configurar `tsconfig.json` com `strict: true` e paths (`@/*`)
- [x] Instalar dependências: Fastify, TypeScript, tsx, zod, bcrypt
- [x] Instalar Prisma (`prisma`, `@prisma/client`)
- [x] Configurar `prisma/schema.prisma` com todos os modelos
- [x] Rodar `prisma migrate dev --name init` e confirmar tabelas criadas
- [x] Criar singleton `src/lib/prisma.ts`
- [x] Criar `src/app.ts` com instância base do Fastify
- [x] Adicionar rota `/health` e testar `pnpm dev`
- [x] Configurar variáveis de ambiente (`.env` a partir do `.env.example`)

---

## FASE 2 — Plugins e infraestrutura

- [x] Instalar e configurar `@fastify/cors`
- [x] Instalar e configurar `@fastify/jwt`
- [x] Instalar e configurar `@fastify/cookie`
- [x] Criar `src/shared/errors/app-error.ts` (classe `AppError`)
- [x] Criar `src/shared/middleware/error-handler.ts` (hook `setErrorHandler`)
- [x] Criar `src/shared/utils/response.ts` (helpers `ok`, `created`, `paginated`)
- [x] Criar `src/shared/utils/pagination.ts` (helper para `skip/take` e meta)
- [x] Registrar todos os plugins em `app.ts`

---

## FASE 3 — Autenticação

- [x] Criar `src/modules/auth/auth.schema.ts` (Zod: `loginSchema`, `refreshSchema`)
- [x] Criar `src/modules/auth/auth.service.ts`
  - [x] `login(email, password)` → valida usuário, compara hash, gera tokens
  - [x] `refresh(token)` → valida refresh token no Redis, gera novo access token
  - [x] `logout(token)` → remove refresh token do Redis
- [x] Instalar e configurar `ioredis` para armazenar refresh tokens
- [x] Criar `src/modules/auth/auth.controller.ts` (handlers: `login`, `refresh`, `logout`)
- [x] Criar `src/modules/auth/auth.routes.ts` e registrar em `app.ts`
- [x] Criar `src/shared/middleware/auth.middleware.ts` (verifica Bearer JWT)
- [x] Testar: login, refresh token, logout, rota protegida

---

## FASE 4 — Módulo Usuários

- [x] Criar `src/modules/users/users.schema.ts` (Zod: `createUser`, `updateUser`, `listUsers`)
- [x] Criar `src/modules/users/users.service.ts`
  - [x] `list(filters)` → paginado, com filtro por `role` e `isActive`
  - [x] `findById(id)` → lança `AppError` se não encontrado
  - [x] `create(data)` → hash da senha com bcrypt, verifica email duplicado
  - [x] `update(id, data)` → atualiza campos permitidos
  - [x] `deactivate(id)` → soft disable (`isActive: false`)
- [x] Criar `src/modules/users/users.controller.ts`
- [x] Criar `src/modules/users/users.routes.ts` (todas as rotas protegidas por `authenticate`)
- [x] Registrar rotas em `app.ts` com prefixo `/api/v1/users`
- [x] Testar CRUD completo de usuários

---

## FASE 5 — Módulo Clientes

- [x] Criar `src/modules/clients/clients.schema.ts` (Zod: `createClient`, `updateClient`, `listClients`)
- [x] Criar `src/modules/clients/clients.service.ts`
  - [x] `list(filters)` → paginado, filtro por `status` e `paid`
  - [x] `findById(id)` → lança `AppError` se não encontrado / deletado
  - [x] `create(data)`
  - [x] `update(id, data)`
  - [x] `remove(id)` → soft delete (`deletedAt`)
- [x] Criar `src/modules/clients/clients.controller.ts`
- [x] Criar `src/modules/clients/clients.routes.ts`
- [x] Registrar rotas em `app.ts` com prefixo `/api/v1/clients`
- [x] Testar CRUD completo + filtros

---

## FASE 6 — Módulo Workspaces & Boards (Kanban)

- [x] Criar schemas Zod: `createWorkspace`, `createBoard`, `createColumn`
- [x] Criar `src/modules/boards/boards.service.ts`
  - [x] `listWorkspaces(userId)` → lista workspaces do usuário autenticado
  - [x] `createWorkspace(data)`
  - [x] `addMember(workspaceId, userId, role)`
  - [x] `removeMember(workspaceId, userId)`
  - [x] `getBoardWithColumns(boardId)` → inclui colunas + atividades + assignees
  - [x] `createBoard(data)`
  - [x] `createColumn(data)`
  - [x] `updateColumnPosition(id, position)` → reordenação de colunas
- [x] Criar controller e rotas de workspaces/boards
- [x] Registrar em `app.ts`
- [x] Testar criação de workspace, board e colunas

---

## FASE 7 — Módulo Atividades (Cards Kanban)

- [x] Criar schemas Zod: `createActivity`, `updateActivity`, `moveActivity`
- [x] Criar `src/modules/activities/activities.service.ts`
  - [x] `create(data)` → cria card na coluna com `position` no final
  - [x] `update(id, data)` → atualiza título, descrição, prioridade, categoria
  - [x] `move(id, { columnId, position })` → reposiciona card (DnD)
  - [x] `addAssignee(activityId, userId)`
  - [x] `removeAssignee(activityId, userId)`
  - [x] `remove(id)` → soft delete
- [x] Criar controller e rotas de atividades
- [x] `PATCH /api/v1/activities/:id/move` → endpoint de DnD
- [x] Registrar em `app.ts`
- [x] Testar movimentação de cards e atribuição de responsáveis

---

## FASE 8 — Módulo Financeiro

- [x] Criar schemas Zod: `createFinanceEntry`, `listFinanceEntries`
- [x] Criar `src/modules/finance/finance.service.ts`
  - [x] `list(filters)` → paginado, filtro por `type`, `category`, `dateRange`
  - [x] `create(data)`
  - [x] `remove(id)`
  - [x] `getSummary(dateRange)` → soma entradas, saídas, saldo
- [x] Criar controller e rotas financeiras
- [x] `GET /api/v1/finance/summary` → retorna totais do período
- [x] Registrar em `app.ts`
- [x] Testar registro e resumo financeiro

---

## FASE 9 — Testes

- [ ] Configurar Vitest com `vitest.config.ts`
- [ ] Testes unitários para `auth.service.ts` (login, refresh, logout)
- [ ] Testes unitários para `users.service.ts` (create, deactivate)
- [ ] Testes unitários para `clients.service.ts` (CRUD + filtros)
- [ ] Testes unitários para `activities.service.ts` (move, assignees)
- [ ] Testes unitários para `finance.service.ts` (summary)
- [ ] Testes de integração para rotas de auth (`/login`, `/refresh`)
- [ ] Verificar cobertura mínima de 70% nos services

---

## FASE 10 — Finalização

- [ ] Adicionar `@fastify/swagger` e documentar rotas principais
- [ ] Revisar todos os `console.log` (substituir por `fastify.log`)
- [ ] Adicionar seed `prisma/seed.ts` com usuário admin padrão
- [ ] Rodar `pnpm lint` e corrigir erros
- [ ] Rodar `pnpm build` e confirmar sem erros de TypeScript
- [ ] Atualizar `.env.example` com todas as variáveis usadas
- [ ] Revisar `CLAUDE.md` se algum padrão mudou durante o desenvolvimento

---

**Progresso:** `76 / 70` tasks concluídas