# TASKS — Kanban Redesign (Frontend) — apps/web

> Inspirado no Asana: painel lateral de atividade, membros por quadro, comentários, DnD robusto.
> Marque cada task com `[x]` ao concluir.
> Depende do backend da Fase Kanban estar funcional.

---

## FASE 1 — Services e Hooks

### 1.1 — Services
- [x] Reescrever `src/services/boards.service.ts`
  - [x] `list(workspaceId)` → `GET /boards?workspaceId=`
  - [x] `getById(boardId)` → `GET /boards/:id` (retorna board com colunas e atividades)
  - [x] `create(data)` → `POST /boards`
  - [x] `update(boardId, data)` → `PUT /boards/:id`
  - [x] `remove(boardId)` → `DELETE /boards/:id`
  - [x] `listMembers(boardId)` → `GET /boards/:id/members`
  - [x] `addMember(boardId, userId, role?)` → `POST /boards/:id/members`
  - [x] `updateMemberRole(boardId, userId, role)` → `PUT /boards/:id/members/:userId`
  - [x] `removeMember(boardId, userId)` → `DELETE /boards/:id/members/:userId`
- [x] Reescrever `src/services/columns.service.ts`
  - [x] `list(boardId)` → `GET /boards/:boardId/columns`
  - [x] `create(data)` → `POST /boards/:boardId/columns`
  - [x] `update(columnId, data)` → `PUT /columns/:id`
  - [x] `reorder(boardId, columns)` → `PATCH /boards/:boardId/columns/reorder`
  - [x] `remove(columnId)` → `DELETE /columns/:id`
- [x] Reescrever `src/services/activities.service.ts`
  - [x] `getById(activityId)` → `GET /activities/:id` (para painel lateral)
  - [x] `create(data)` → `POST /activities`
  - [x] `update(activityId, data)` → `PUT /activities/:id`
  - [x] `move(activityId, { columnId, position })` → `PATCH /activities/:id/move`
  - [x] `toggleComplete(activityId, isCompleted)` → `PATCH /activities/:id/complete`
  - [x] `remove(activityId)` → `DELETE /activities/:id`
  - [x] `addAssignee(activityId, userId)` → `POST /activities/:id/assignees`
  - [x] `removeAssignee(activityId, userId)` → `DELETE /activities/:id/assignees/:userId`
- [x] Criar `src/services/comments.service.ts`
  - [x] `list(activityId)` → `GET /activities/:activityId/comments`
  - [x] `create(activityId, content)` → `POST /activities/:activityId/comments`
  - [x] `update(commentId, content)` → `PUT /comments/:id`
  - [x] `remove(commentId)` → `DELETE /comments/:id`

### 1.2 — Hooks
- [x] Reescrever `src/hooks/useBoards.ts`
  - [x] `useBoards(workspaceId)` → query de listagem
  - [x] `useBoard(boardId)` → query de board completo (colunas + atividades)
  - [x] `useCreateBoard()` → mutation com invalidação de `boards`
  - [x] `useUpdateBoard()` → mutation com invalidação de `board`
  - [x] `useRemoveBoard()` → mutation com invalidação de `boards`
  - [x] `useBoardMembers(boardId)` → query de membros
  - [x] `useAddBoardMember()` → mutation
  - [x] `useUpdateBoardMemberRole()` → mutation
  - [x] `useRemoveBoardMember()` → mutation
- [x] Reescrever `src/hooks/useColumns.ts`
  - [x] `useCreateColumn()` → optimistic update na lista de colunas
  - [x] `useUpdateColumn()` → mutation
  - [x] `useReorderColumns()` → optimistic update
  - [x] `useRemoveColumn()` → mutation com confirmação
- [x] Reescrever `src/hooks/useActivities.ts`
  - [x] `useActivity(activityId)` → query para painel lateral
  - [x] `useCreateActivity()` → optimistic update
  - [x] `useUpdateActivity()` → optimistic update no painel lateral
  - [x] `useMoveActivity()` → optimistic update com rollback
  - [x] `useToggleComplete()` → optimistic update
  - [x] `useRemoveActivity()` → mutation
  - [x] `useAddAssignee()` → mutation com atualização da atividade no cache
  - [x] `useRemoveAssignee()` → mutation com atualização da atividade no cache
- [x] Criar `src/hooks/useComments.ts`
  - [x] `useComments(activityId)` → query
  - [x] `useCreateComment()` → mutation com invalidação
  - [x] `useUpdateComment()` → mutation
  - [x] `useRemoveComment()` → mutation

---

## FASE 2 — Página de Workspaces

- [x] Reescrever `src/pages/boards/WorkspacesPage.tsx`
  - [x] Grid de cards de workspaces com nome, ícone/cor e contagem de boards
  - [x] Botão "Novo Workspace" → abre `WorkspaceFormModal`
  - [x] Cada card com menu de contexto (3 pontos): Editar, Deletar
  - [x] Ao clicar no card → navega para `/workspaces/:id/boards`
- [x] Criar `src/pages/boards/WorkspaceBoardsPage.tsx`
  - [x] Header com nome do workspace e botão "Novo Quadro"
  - [x] Grid de cards de boards: nome, cor/ícone, contagem de membros e colunas, data de criação
  - [x] Menu de contexto por card: Editar, Deletar
  - [x] Ao clicar no card → navega para `/boards/:id`
- [x] Criar `src/components/boards/WorkspaceFormModal.tsx` (criar e editar workspace)
  - [x] Campo: nome
  - [x] Validação Zod
- [x] Criar `src/components/boards/BoardFormModal.tsx` (criar e editar board)
  - [x] Campo: nome, descrição (opcional)
  - [x] Seletor de cor do board (paleta de 8–10 cores predefinidas)
  - [x] Seletor de ícone (emoji picker simples ou lista de emojis comuns)
  - [x] Validação Zod
- [x] Adicionar rotas `/workspaces/:workspaceId/boards` e `/boards/:boardId` em `src/routes/index.tsx`

---

## FASE 3 — Página do Board (Layout Principal)

- [x] Reescrever `src/pages/boards/BoardPage.tsx`
  - [x] Header do board: nome, ícone, cor, menu de ações (Editar, Gerenciar Membros, Deletar)
  - [x] Tabs de visualização: apenas "Quadro" por enquanto (preparado para expandir)
  - [x] Área de colunas com scroll horizontal
  - [x] Botão "+ Adicionar Coluna" no final da lista de colunas
  - [x] Loading skeleton das colunas enquanto carrega
  - [x] `DndContext` envolvendo toda a área de colunas e cards

---

## FASE 4 — Componentes do Board

### 4.1 — Column
- [x] Reescrever `src/components/kanban/Column.tsx`
  - [x] Header: cor da coluna (dot ou borda superior), título editável inline (click para editar, Enter para salvar, Esc para cancelar), contagem de cards
  - [x] Menu de contexto da coluna (3 pontos): Renomear, Alterar cor, Deletar
  - [x] Lista de cards com `SortableContext` vertical
  - [x] Botão "+ Adicionar atividade" no rodapé da coluna
  - [x] Visual de drop zone quando card está sendo arrastado sobre a coluna
  - [x] Largura fixa de `280px`; altura com scroll interno se muitos cards
  - [x] Ao deletar coluna → exibir `ConfirmDialog` com aviso que todos os cards serão apagados

### 4.2 — ActivityCard
- [x] Reescrever `src/components/kanban/ActivityCard.tsx`
  - [x] Capa de cor (`coverColor`) no topo do card se definida
  - [x] Título do card
  - [x] Tags/labels como badges coloridos (se houver)
  - [x] Badge de prioridade com ícone e cor (`low` = cinza, `medium` = azul, `high` = laranja, `urgent` = vermelho)
  - [x] Data de conclusão (`dueDate`) com ícone de calendário; cor vermelha se vencida
  - [x] Avatares dos responsáveis (até 3 + contador de overflow)
  - [x] Indicador de comentários (ícone + contagem) se houver
  - [x] Checkbox de conclusão no canto superior esquerdo → `useToggleComplete`
  - [x] Efeito visual ao arrastar (`useSortable` + `DragOverlay`)
  - [x] Ao clicar no card → abre o painel lateral `ActivityPanel`

### 4.3 — AddActivityInline
- [x] Criar `src/components/kanban/AddActivityInline.tsx`
  - [x] Campo de texto simples que aparece no rodapé da coluna ao clicar em "+ Adicionar atividade"
  - [x] Enter → cria atividade com título digitado; Esc → cancela
  - [x] Exibir loading enquanto a mutation está em andamento
  - [x] Foco automático ao abrir

---

## FASE 5 — Painel Lateral de Atividade (Estilo Asana)

> Este é o componente principal do redesign. Abre à direita do board quando o usuário clica em um card.

- [x] Criar `src/components/kanban/ActivityPanel.tsx`
  - [x] Layout: painel fixo à direita com `width: 420px`, altura 100% do viewport, `z-index` elevado, fundo do tema, sombra lateral
  - [x] Animação de entrada/saída (slide da direita)
  - [x] Botão de fechar (X) no canto superior direito
  - [x] Ao fechar → limpa o `activityId` selecionado no estado (não navega, não recarrega)

  **Header do painel:**
  - [x] Checkbox de conclusão + título editável inline (click para editar, blur/Enter para salvar)
  - [x] Badge de prioridade clicável → dropdown para alterar prioridade
  - [x] Botão "..." → menu: Duplicar (opcional), Deletar atividade

  **Seção de metadados (estilo Asana — grid de label + valor):**
  - [x] **Responsável(eis):** avatares dos assignees + botão "+" para adicionar → dropdown com busca de membros do board → clicar em membro já atribuído remove ele
  - [x] **Data de conclusão:** clique abre date picker; exibir em vermelho se vencida; botão para limpar
  - [x] **Prioridade:** select com ícones (`low`, `medium`, `high`, `urgent`)
  - [x] **Categoria:** input de texto livre
  - [x] **Tags:** chips editáveis — digitar e pressionar Enter adiciona tag; clicar no X remove
  - [x] **Coluna:** badge clicável → dropdown para mover para outra coluna sem DnD

  **Descrição:**
  - [x] Textarea expansível com placeholder "Adicionar descrição..."
  - [x] Salva automaticamente ao perder foco (`onBlur`) com debounce de 500ms
  - [x] Indicador sutil de "Salvo" após persistir

  **Seção de Comentários:**
  - [x] Lista de comentários com avatar do autor, nome, data relativa (ex: "há 2h"), texto
  - [x] Cada comentário com botão de editar e deletar (somente para o próprio autor)
  - [x] Campo de novo comentário: avatar do usuário logado + textarea + botão "Comentar"
  - [x] Submit com Ctrl+Enter ou botão
  - [x] Scroll automático para o último comentário ao abrir o painel

- [x] Criar `src/stores/kanban.store.ts` (Zustand) com:
  - [x] `selectedActivityId: string | null`
  - [x] `setSelectedActivity(id: string | null)`
  - [x] `isPanelOpen: boolean` (derivado de `selectedActivityId !== null`)

- [x] Integrar `ActivityPanel` no `BoardPage.tsx`
  - [x] Quando `selectedActivityId` não é null → renderizar painel à direita
  - [x] O board (colunas) reduz sua largura para acomodar o painel (não sobrepõe)
  - [x] Fechar painel ao pressionar `Esc`

---

## FASE 6 — Gerenciamento de Membros do Board

- [x] Criar `src/components/boards/BoardMembersModal.tsx`
  - [x] Lista de membros atuais com avatar, nome, cargo e badge de role (`Admin` / `Membro`)
  - [x] Ação de remover membro (com `ConfirmDialog`)
  - [x] Ação de promover/rebaixar role (toggle Admin ↔ Membro)
  - [x] Seção "Convidar membro": busca de usuários do sistema por nome ou email (dropdown com debounce) → selecionar → botão "Adicionar"
  - [x] Exibir loading states em todas as ações
- [x] Integrar o modal no header do `BoardPage.tsx` (botão "Membros" ou ícones de avatar com "+")

---

## FASE 7 — DnD Robusto

- [x] Reescrever `src/hooks/useKanban.ts` encapsulando toda a lógica de DnD
  - [x] `onDragStart` → salvar estado atual como snapshot para rollback
  - [x] `onDragOver` → atualizar posição visual do card (optimistic, apenas no estado local)
  - [x] `onDragEnd` → determinar se foi movimento de card ou coluna:
    - [x] **Card movido dentro da mesma coluna** → chamar `useMoveActivity` com nova posição
    - [x] **Card movido para outra coluna** → chamar `useMoveActivity` com novo `columnId` e posição
    - [x] **Coluna reordenada** → chamar `useReorderColumns`
    - [x] Em caso de erro na API → rollback para o snapshot
  - [x] Suporte a `DragOverlay` para preview do card sendo arrastado
- [x] Garantir que o painel lateral (`ActivityPanel`) permanece aberto durante DnD

---

## FASE 8 — Testes e Finalização

- [x] Testar criação de board → adicionar membros → criar colunas → criar atividades inline
- [x] Testar DnD: mover card dentro da coluna → mover entre colunas → reordenar colunas
- [x] Testar painel lateral: abrir ao clicar no card → editar todos os campos → fechar com X e com Esc
- [x] Testar assignees: adicionar múltiplos responsáveis → remover um → verificar avatares no card
- [x] Testar comentários: criar → editar → deletar
- [x] Testar toggle de conclusão: marcar → verificar visual no card → desmarcar
- [x] Testar deletar atividade pelo painel → card some do board
- [x] Testar deletar coluna → confirmar cascata → coluna e cards somem
- [x] Testar responsividade: painel lateral em tela menor → scroll horizontal do board
- [x] Rodar `pnpm lint` e `pnpm build` sem erros

---

**Progresso:** `94 / 94` tasks concluídas