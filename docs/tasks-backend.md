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

- [ ] Instalar e configurar `@fastify/cors`
- [ ] Instalar e configurar `@fastify/jwt`
- [ ] Instalar e configurar `@fastify/cookie`
- [ ] Criar `src/shared/errors/app-error.ts` (classe `AppError`)
- [ ] Criar `src/shared/middleware/error-handler.ts` (hook `setErrorHandler`)
- [ ] Criar `src/shared/utils/response.ts` (helpers `ok`, `created`, `paginated`)
- [ ] Criar `src/shared/utils/pagination.ts` (helper para `skip/take` e meta)
- [ ] Registrar todos os plugins em `app.ts`

---

## FASE 3 — Autenticação

- [ ] Criar `src/modules/auth/auth.schema.ts` (Zod: `loginSchema`, `refreshSchema`)
- [ ] Criar `src/modules/auth/auth.service.ts`
  - [ ] `login(email, password)` → valida usuário, compara hash, gera tokens
  - [ ] `refresh(token)` → valida refresh token no Redis, gera novo access token
  - [ ] `logout(token)` → remove refresh token do Redis
- [ ] Instalar e configurar `ioredis` para armazenar refresh tokens
- [ ] Criar `src/modules/auth/auth.controller.ts` (handlers: `login`, `refresh`, `logout`)
- [ ] Criar `src/modules/auth/auth.routes.ts` e registrar em `app.ts`
- [ ] Criar `src/shared/middleware/auth.middleware.ts` (verifica Bearer JWT)
- [ ] Testar: login, refresh token, logout, rota protegida

---

## FASE 4 — Módulo Usuários

- [ ] Criar `src/modules/users/users.schema.ts` (Zod: `createUser`, `updateUser`, `listUsers`)
- [ ] Criar `src/modules/users/users.service.ts`
  - [ ] `list(filters)` → paginado, com filtro por `role` e `isActive`
  - [ ] `findById(id)` → lança `AppError` se não encontrado
  - [ ] `create(data)` → hash da senha com bcrypt, verifica email duplicado
  - [ ] `update(id, data)` → atualiza campos permitidos
  - [ ] `deactivate(id)` → soft disable (`isActive: false`)
- [ ] Criar `src/modules/users/users.controller.ts`
- [ ] Criar `src/modules/users/users.routes.ts` (todas as rotas protegidas por `authenticate`)
- [ ] Registrar rotas em `app.ts` com prefixo `/api/v1/users`
- [ ] Testar CRUD completo de usuários

---

## FASE 5 — Módulo Clientes

- [ ] Criar `src/modules/clients/clients.schema.ts` (Zod: `createClient`, `updateClient`, `listClients`)
- [ ] Criar `src/modules/clients/clients.service.ts`
  - [ ] `list(filters)` → paginado, filtro por `status` e `paid`
  - [ ] `findById(id)` → lança `AppError` se não encontrado / deletado
  - [ ] `create(data)`
  - [ ] `update(id, data)`
  - [ ] `remove(id)` → soft delete (`deletedAt`)
- [ ] Criar `src/modules/clients/clients.controller.ts`
- [ ] Criar `src/modules/clients/clients.routes.ts`
- [ ] Registrar rotas em `app.ts` com prefixo `/api/v1/clients`
- [ ] Testar CRUD completo + filtros

---

## FASE 6 — Módulo Workspaces & Boards (Kanban)

- [ ] Criar schemas Zod: `createWorkspace`, `createBoard`, `createColumn`
- [ ] Criar `src/modules/boards/boards.service.ts`
  - [ ] `listWorkspaces(userId)` → lista workspaces do usuário autenticado
  - [ ] `createWorkspace(data)`
  - [ ] `addMember(workspaceId, userId, role)`
  - [ ] `removeMember(workspaceId, userId)`
  - [ ] `getBoardWithColumns(boardId)` → inclui colunas + atividades + assignees
  - [ ] `createBoard(data)`
  - [ ] `createColumn(data)`
  - [ ] `updateColumnPosition(id, position)` → reordenação de colunas
- [ ] Criar controller e rotas de workspaces/boards
- [ ] Registrar em `app.ts`
- [ ] Testar criação de workspace, board e colunas

---

## FASE 7 — Módulo Atividades (Cards Kanban)

- [ ] Criar schemas Zod: `createActivity`, `updateActivity`, `moveActivity`
- [ ] Criar `src/modules/activities/activities.service.ts`
  - [ ] `create(data)` → cria card na coluna com `position` no final
  - [ ] `update(id, data)` → atualiza título, descrição, prioridade, categoria
  - [ ] `move(id, { columnId, position })` → reposiciona card (DnD)
  - [ ] `addAssignee(activityId, userId)`
  - [ ] `removeAssignee(activityId, userId)`
  - [ ] `remove(id)` → soft delete
- [ ] Criar controller e rotas de atividades
- [ ] `PATCH /api/v1/activities/:id/move` → endpoint de DnD
- [ ] Registrar em `app.ts`
- [ ] Testar movimentação de cards e atribuição de responsáveis

---

## FASE 8 — Módulo Financeiro

- [ ] Criar schemas Zod: `createFinanceEntry`, `listFinanceEntries`
- [ ] Criar `src/modules/finance/finance.service.ts`
  - [ ] `list(filters)` → paginado, filtro por `type`, `category`, `dateRange`
  - [ ] `create(data)`
  - [ ] `remove(id)`
  - [ ] `getSummary(dateRange)` → soma entradas, saídas, saldo
- [ ] Criar controller e rotas financeiras
- [ ] `GET /api/v1/finance/summary` → retorna totais do período
- [ ] Registrar em `app.ts`
- [ ] Testar registro e resumo financeiro

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

**Progresso:** `10 / 70` tasks concluídas