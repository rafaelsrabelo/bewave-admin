# TASKS — Kanban Redesign (Backend) — apps/api

> Inspirado no Asana: quadros com colunas, atividades ricas, painel lateral, membros por quadro.
> Marque cada task com `[x]` ao concluir.

---

## FASE 1 — Revisão do Schema (Prisma)

> O schema atual tem `Workspace → Board → Column → Activity`. Vamos expandir para suportar tudo que o Asana oferece.

- [x] Abrir `apps/api/prisma/schema.prisma` e adicionar/ajustar os seguintes modelos:

### Board
- [x] Adicionar campo `description String?` ao modelo `Board`
- [x] Adicionar campo `color String?` (cor de identificação do quadro, hex)
- [x] Adicionar campo `icon String?` (emoji ou slug de ícone)
- [x] Adicionar campo `deletedAt DateTime?` (soft delete)
- [x] Criar relação `BoardMember` (N:N entre `Board` e `User`) com campo `role String @default("member")`

### Column
- [x] Garantir campo `color String?` na `Column` (cor da coluna para visual)
- [x] Garantir campo `deletedAt DateTime?` (soft delete)

### Activity
- [x] Adicionar campo `dueDate DateTime?` (data de conclusão)
- [x] Adicionar campo `completedAt DateTime?` (quando foi marcada como concluída)
- [x] Adicionar campo `isCompleted Boolean @default(false)`
- [x] Adicionar campo `coverColor String?` (cor de capa do card)
- [x] Adicionar campo `tags String[]` (array de tags/labels)
- [x] Garantir `deletedAt DateTime?` (soft delete)
- [x] Garantir relação `ActivityAssignee` (N:N com `User`) já existente

### ActivityComment (novo modelo)
- [x] Criar modelo `ActivityComment`
  - `id String @id @default(cuid())`
  - `content String`
  - `activityId String`
  - `userId String`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - relação com `Activity` e `User`

- [x] Rodar `pnpm db:migrate --name kanban-redesign` e confirmar sem erros
- [x] Rodar `pnpm db:generate` para atualizar o Prisma Client

---

## FASE 2 — Módulo Boards (Revisão Completa)

### 2.1 — Schema Zod (`boards.schema.ts`)
- [x] `createBoardSchema` → `name`, `description?`, `color?`, `icon?`, `workspaceId`
- [x] `updateBoardSchema` → todos opcionais: `name?`, `description?`, `color?`, `icon?`
- [x] `listBoardsSchema` → `workspaceId`, `page?`, `limit?`
- [x] `addBoardMemberSchema` → `userId`, `role?` (`"admin" | "member"`)

### 2.2 — Service (`boards.service.ts`)
- [x] `list(workspaceId, userId)` → lista boards do workspace onde o usuário é membro, com contagem de membros e colunas
- [x] `findById(boardId, userId)` → retorna board completo com colunas + atividades + assignees + membros; lança `AppError` se usuário não for membro
- [x] `create(data, creatorUserId)` → cria board e automaticamente adiciona o criador como membro `admin`
- [x] `update(boardId, data, userId)` → verifica se usuário é membro; atualiza campos
- [x] `remove(boardId, userId)` → soft delete; apenas `admin` do board pode deletar
- [x] `addMember(boardId, userId, targetUserId, role)` → adiciona membro ao board; apenas `admin` do board pode adicionar
- [x] `removeMember(boardId, userId, targetUserId)` → remove membro; `admin` pode remover qualquer um; membro pode se auto-remover
- [x] `updateMemberRole(boardId, userId, targetUserId, role)` → promove/rebaixa membro
- [x] `listMembers(boardId, userId)` → lista membros do board com seus dados de usuário

### 2.3 — Controller e Rotas (`boards.controller.ts`, `boards.routes.ts`)
- [x] `GET /boards` → `boards.service.list` (com `workspaceId` na query)
- [x] `GET /boards/:id` → `boards.service.findById`
- [x] `POST /boards` → `boards.service.create`
- [x] `PUT /boards/:id` → `boards.service.update`
- [x] `DELETE /boards/:id` → `boards.service.remove`
- [x] `GET /boards/:id/members` → `boards.service.listMembers`
- [x] `POST /boards/:id/members` → `boards.service.addMember`
- [x] `PUT /boards/:id/members/:userId` → `boards.service.updateMemberRole`
- [x] `DELETE /boards/:id/members/:userId` → `boards.service.removeMember`
- [x] Registrar todas as rotas com prefixo `/api/v1/boards` em `app.ts`

---

## FASE 3 — Módulo Columns (Revisão)

### 3.1 — Schema Zod (`columns.schema.ts`)
- [x] `createColumnSchema` → `title`, `boardId`, `color?`, `position?`
- [x] `updateColumnSchema` → `title?`, `color?`
- [x] `reorderColumnsSchema` → `columns: Array<{ id: string, position: number }>`

### 3.2 — Service (`columns.service.ts`)
- [x] `list(boardId)` → retorna colunas ordenadas por `position`, com contagem de atividades ativas
- [x] `create(data)` → cria coluna no final (`position = max + 1`)
- [x] `update(columnId, data)` → atualiza título e/ou cor
- [x] `reorder(boardId, columns)` → atualiza `position` de múltiplas colunas em uma transação (`prisma.$transaction`)
- [x] `remove(columnId)` → soft delete na coluna; soft delete em cascata nas atividades da coluna

### 3.3 — Controller e Rotas
- [x] `GET /boards/:boardId/columns` → lista colunas do board
- [x] `POST /boards/:boardId/columns` → cria coluna
- [x] `PUT /columns/:id` → atualiza coluna
- [x] `PATCH /boards/:boardId/columns/reorder` → reordena colunas (body: array com ids e posições)
- [x] `DELETE /columns/:id` → remove coluna (com confirmação de cascata)
- [x] Registrar rotas em `app.ts`

---

## FASE 4 — Módulo Activities (Revisão Completa)

### 4.1 — Schema Zod (`activities.schema.ts`)
- [x] `createActivitySchema` → `columnId`, `title`, `description?`, `priority?`, `category?`, `dueDate?`, `tags?`, `assigneeIds?`, `coverColor?`
- [x] `updateActivitySchema` → todos os campos opcionais
- [x] `moveActivitySchema` → `columnId`, `position`
- [x] `completeActivitySchema` → `isCompleted: boolean`
- [x] `listActivitiesSchema` → `columnId?`, `boardId?`, `assigneeId?`, `priority?`, `isCompleted?`, `page?`, `limit?`

### 4.2 — Service (`activities.service.ts`)
- [x] `findById(id)` → retorna atividade com assignees, comentários (últimos 10) e criador; lança `AppError` se não encontrada
- [x] `create(data, creatorUserId)` → cria com `position = max + 1` na coluna; processa `assigneeIds` em `$transaction`
- [x] `update(id, data)` → atualiza campos; se `assigneeIds` presente, sincroniza assignees (remove os ausentes, adiciona os novos) em `$transaction`
- [x] `move(id, { columnId, position })` → move card com reordenação dos demais da coluna de destino em `$transaction`
- [x] `toggleComplete(id, isCompleted)` → seta `isCompleted` e `completedAt`
- [x] `remove(id)` → soft delete
- [x] `addAssignee(activityId, userId)` → adiciona responsável; verifica se já existe
- [x] `removeAssignee(activityId, userId)` → remove responsável
- [x] `listByBoard(boardId, filters)` → lista todas as atividades de um board com filtros opcionais

### 4.3 — Controller e Rotas
- [x] `GET /activities/:id` → retorna atividade completa (para painel lateral)
- [x] `POST /activities` → cria atividade
- [x] `PUT /activities/:id` → atualiza atividade
- [x] `PATCH /activities/:id/move` → move card (DnD)
- [x] `PATCH /activities/:id/complete` → toggle de conclusão
- [x] `DELETE /activities/:id` → soft delete
- [x] `POST /activities/:id/assignees` → `{ userId }` → adiciona responsável
- [x] `DELETE /activities/:id/assignees/:userId` → remove responsável
- [x] `GET /boards/:boardId/activities` → lista atividades do board com filtros
- [x] Registrar rotas em `app.ts`

---

## FASE 5 — Módulo Comments

### 5.1 — Schema Zod (`comments.schema.ts`)
- [x] `createCommentSchema` → `content: string (min 1, max 2000)`
- [x] `updateCommentSchema` → `content: string`

### 5.2 — Service (`comments.service.ts`)
- [x] `list(activityId)` → retorna comentários ordenados por `createdAt asc`, com dados do autor (`name`, `id`)
- [x] `create(activityId, userId, content)` → cria comentário
- [x] `update(commentId, userId, content)` → verifica se o usuário é o autor; atualiza
- [x] `remove(commentId, userId)` → verifica se o usuário é o autor ou admin do board; deleta permanentemente

### 5.3 — Controller e Rotas
- [x] `GET /activities/:activityId/comments` → lista comentários da atividade
- [x] `POST /activities/:activityId/comments` → cria comentário
- [x] `PUT /comments/:id` → edita comentário (apenas autor)
- [x] `DELETE /comments/:id` → deleta comentário (autor ou admin do board)
- [x] Registrar rotas em `app.ts`

---

## FASE 6 — Atualização da documentação

- [x] Atualizar `docs/API.md` com todos os novos endpoints de boards, columns, activities e comments
- [x] Atualizar `apps/api/prisma/schema.prisma` como fonte de verdade do schema
- [x] Rodar `pnpm build` e confirmar sem erros de TypeScript
- [x] Rodar `pnpm lint` e corrigir erros

---

**Progresso:** `68 / 68` tasks concluídas