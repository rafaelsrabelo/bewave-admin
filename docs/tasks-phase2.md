# TASKS — Fase 2 do Sistema (Backend + Frontend)

> Novas funcionalidades a serem implementadas após a conclusão das fases anteriores.
> Marque cada task com `[x]` ao concluir.
> Siga a ordem recomendada: A → B → C → D → E

---

## MÓDULO A — Perfil do Usuário (Backend)

> Permite que qualquer usuário autenticado edite seus próprios dados e senha.

### A.1 — Schema Zod
- [x] Criar (ou atualizar) `src/modules/users/users.schema.ts` adicionando:
  - [x] `updateProfileSchema` → `name?`, `phone?`, `email?`
  - [x] `changePasswordSchema` → `currentPassword: string`, `newPassword: string (min 8)`, `confirmPassword` com refinement (deve ser igual a `newPassword`)

### A.2 — Service
- [x] Adicionar em `users.service.ts`:
  - [x] `updateProfile(userId, data)` → atualiza `name`, `phone`, `email`; se `email` mudar, verifica duplicata antes de salvar
  - [x] `changePassword(userId, { currentPassword, newPassword })` → busca usuário, compara hash com `bcrypt.compare`, lança `AppError('INVALID_PASSWORD', 'Senha atual incorreta', 400)` se errado, salva novo hash

### A.3 — Controller e Rotas
- [x] Criar `src/modules/profile/profile.controller.ts` com handlers: `getMe`, `updateProfile`, `changePassword`
- [x] Criar `src/modules/profile/profile.routes.ts`:
  - [x] `GET /api/v1/me` → retorna usuário autenticado (omitir `passwordHash`)
  - [x] `PUT /api/v1/me` → `updateProfile`
  - [x] `PATCH /api/v1/me/password` → `changePassword`
- [x] Todas as rotas protegidas por `authenticate`
- [x] Registrar em `app.ts`

---

## MÓDULO A — Perfil do Usuário (Frontend)

### A.4 — Service e Hook
- [x] Adicionar em `src/services/users.service.ts`:
  - [x] `getMe()` → `GET /me`
  - [x] `updateProfile(data)` → `PUT /me`
  - [x] `changePassword(data)` → `PATCH /me/password`
- [x] Criar `src/hooks/useProfile.ts`:
  - [x] `useMe()` → query com `queryKey: ['me']`
  - [x] `useUpdateProfile()` → mutation com invalidação de `['me']` e atualização do Zustand store
  - [x] `useChangePassword()` → mutation simples

### A.5 — Página de Perfil
- [x] Criar `src/pages/profile/ProfilePage.tsx`
  - [x] Seção "Dados Pessoais": form com nome, email, telefone
    - [x] Pré-preencher com dados atuais do usuário logado
    - [x] Validação com `updateProfileSchema` de `@bewave/schemas`
    - [x] Botão "Salvar Alterações" com estado de loading
    - [x] Toast de sucesso/erro via `sonner`
  - [x] Seção "Alterar Senha": form com senha atual, nova senha, confirmar nova senha
    - [x] Campos de senha com toggle de visibilidade
    - [x] Validação com `changePasswordSchema`
    - [x] Limpar todos os campos após sucesso
    - [x] Exibir erro inline abaixo do campo "Senha atual" se a API retornar `INVALID_PASSWORD`
- [x] Adicionar rota `/profile` em `src/routes/index.tsx` (privada, qualquer role)
- [x] Adicionar link "Meu Perfil" no menu do usuário na `TopBar` (dropdown do avatar)
- [x] Após `useUpdateProfile` bem-sucedido → chamar `setAuth` do Zustand atualizando `user` no store

---

## MÓDULO B — Controle de Acesso por Role (Backend)

> Membros (`role: 'member'`) têm acesso restrito. Admins têm acesso total.

### B.1 — Middleware de Role
- [x] Criar `src/shared/middleware/require-role.middleware.ts`:
  - [x] Exportar `requireAdmin` → verifica `req.user.role === 'admin'`; lança `AppError('FORBIDDEN', 'Acesso restrito a administradores', 403)` se não for
  - [x] Exportar `requireRole(roles: string[])` → versão genérica para uso futuro

### B.2 — Proteção de Rotas Existentes por Role
- [x] Aplicar `requireAdmin` como `preHandler` (após `authenticate`) em:
  - [x] Todas as rotas de `users.routes.ts`
  - [x] Todas as rotas de `clients.routes.ts`
  - [x] Todas as rotas de `finance.routes.ts`
  - [x] Rotas de criação/edição/deleção de workspaces (`POST`, `PUT`, `DELETE`)
- [x] Rotas que membros podem acessar (sem `requireAdmin`):
  - [x] `GET /api/v1/boards` e `GET /api/v1/boards/:id` (filtrado por membership no service)
  - [x] Todas as rotas de `columns`, `activities`, `comments`
  - [x] `GET/PUT /api/v1/me` e `PATCH /api/v1/me/password`
  - [x] `GET /api/v1/notifications` e afins
  - [x] `GET /api/v1/dashboard/member`

### B.3 — Endpoint de Dashboard para Membros
- [x] Criar `src/modules/dashboard/dashboard.routes.ts`
- [x] Criar `GET /api/v1/dashboard/member` (autenticado, qualquer role):
  - [x] Retorna:
    - `activitiesAssigned: number`
    - `activitiesCompleted: number`
    - `activitiesPending: number`
    - `boardsWithPendingActivities: Array<{ boardId, boardName, workspaceId, count }>`
- [x] Registrar em `app.ts`

---

## MÓDULO B — Controle de Acesso por Role (Frontend)

### B.4 — Guard de Role no Frontend
- [x] Criar `src/routes/AdminRoute.tsx`:
  - [x] Lê `user.role` do `auth.store.ts`
  - [x] Se `role !== 'admin'` → `<Navigate to="/dashboard" replace />`
  - [x] Caso contrário → `<Outlet />`
- [x] Envolver com `AdminRoute` as rotas: `/users`, `/users/*`, `/clients`, `/clients/*`, `/finance`, `/plans`, `/plans/*`, `/audit-logs`
- [x] Atualizar `src/routes/index.tsx`

### B.5 — Sidebar adaptada por Role
- [x] Atualizar `src/components/layout/Sidebar.tsx`:
  - [x] Definir `adminNavItems` e `memberNavItems` como constantes separadas
  - [x] `adminNavItems`: Dashboard, Usuários, Clientes, Quadros, Planos, Financeiro, Auditoria
  - [x] `memberNavItems`: Dashboard, Quadros
  - [x] Renderizar somente os itens da lista correspondente ao `user.role`
  - [x] Não renderizar itens ocultos nem como desabilitados — simplesmente não incluir no DOM

### B.6 — Dashboard adaptado por Role
- [x] Atualizar `src/pages/dashboard/DashboardPage.tsx`:
  - [x] Se `user.role === 'admin'` → renderizar `AdminDashboard` (componente atual)
  - [x] Se `user.role === 'member'` → renderizar `MemberDashboard`
- [x] Criar `src/components/dashboard/MemberDashboard.tsx`:
  - [x] Card: "Atividades Pendentes" (número + ícone)
  - [x] Card: "Atividades Concluídas"
  - [x] Seção "Seus Quadros": lista de boards com atividades pendentes
    - [x] Cada item: nome do board, badge com contagem de pendentes, botão "Abrir Quadro"
    - [x] Ao clicar → navegar para `/boards/:id`
  - [x] Estado vazio: "Você ainda não foi adicionado a nenhum quadro"
- [x] Criar `src/hooks/useMemberDashboard.ts` → query para `GET /dashboard/member`

### B.7 — Boards filtrados para Membros
- [x] Confirmar que `WorkspacesPage` e `WorkspaceBoardsPage` não exibem boards dos quais o usuário não é membro
- [x] Ocultar botões "Novo Workspace" e "Novo Board" se `user.role === 'member'`

---

## MÓDULO C — Planos e Assinaturas (Backend)

> Planos personalizados com duração em meses. Ao associar um cliente, o sistema gera um registro
> de pagamento por mês automaticamente. Marcar como pago registra a data real e gera lançamento
> financeiro automaticamente (comportamento padrão, com opt-out).

### C.1 — Schema Prisma
- [x] Abrir `apps/api/prisma/schema.prisma` e adicionar os seguintes modelos:

```prisma
model Plan {
  id             String   @id @default(cuid())
  name           String
  description    String?
  price          Int                      // Valor mensal em centavos
  durationMonths Int                      // Duração total do plano em meses (1–120)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?

  subscriptions  ClientSubscription[]
}

model ClientSubscription {
  id          String             @id @default(cuid())
  clientId    String
  planId      String
  startDate   DateTime           @db.Date
  endDate     DateTime           @db.Date  // startDate + durationMonths (calculado ao criar)
  status      SubscriptionStatus @default(active)
  notes       String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  client      Client             @relation(fields: [clientId], references: [id], onDelete: Cascade)
  plan        Plan               @relation(fields: [planId], references: [id])
  payments    SubscriptionPayment[]
}

model SubscriptionPayment {
  id               String      @id @default(cuid())
  subscriptionId   String
  month            Int                      // 1, 2, 3... sequencial
  dueDate          DateTime    @db.Date     // Calculado: startDate + (month-1) meses
  paidAt           DateTime?               // null = não pago; data real = pago
  amount           Int                     // Centavos; herdado do plano, editável
  notes            String?
  financeEntryId   String?     @unique     // FK para FinanceEntry gerada automaticamente
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  subscription     ClientSubscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  financeEntry     FinanceEntry?       @relation(fields: [financeEntryId], references: [id])
}

enum SubscriptionStatus {
  active      // Em andamento, sem vencidos
  overdue     // Possui pagamento(s) vencido(s) não pagos
  completed   // Todos os meses pagos
  cancelled   // Cancelado manualmente
}
```

- [x] Adicionar relação `subscriptions ClientSubscription[]` ao modelo `Client`
- [x] Adicionar campo opcional `subscriptionPayment SubscriptionPayment?` ao modelo `FinanceEntry` (lado inverso da relação)
- [x] Rodar `pnpm db:push` (sincronizado via `prisma db push`)
- [x] Rodar `pnpm db:generate`

### C.2 — Módulo Plans
- [x] Criar `src/modules/plans/plans.schema.ts`:
  - [x] `createPlanSchema` → `name`, `description?`, `price` (int positivo, centavos), `durationMonths` (int, 1–120)
  - [x] `updatePlanSchema` → todos opcionais
  - [x] `listPlansSchema` → `isActive?: boolean`, `page?`, `limit?`
- [x] Criar `src/modules/plans/plans.service.ts`:
  - [x] `list(filters)` → paginado, filtro por `isActive`, ordena por `name`
  - [x] `findById(id)` → lança `AppError` se não encontrado
  - [x] `create(data)`
  - [x] `update(id, data)` → bloqueia edição de `durationMonths` se houver assinaturas `active` (lança `AppError` explicativo)
  - [x] `deactivate(id)` → seta `isActive: false`; bloqueia se houver assinaturas `active` vinculadas
- [x] Criar `src/modules/plans/plans.controller.ts` e `plans.routes.ts`:
  - [x] `GET /api/v1/plans` (autenticado)
  - [x] `GET /api/v1/plans/:id` (autenticado)
  - [x] `POST /api/v1/plans` (admin only)
  - [x] `PUT /api/v1/plans/:id` (admin only)
  - [x] `DELETE /api/v1/plans/:id` → chama `deactivate` (admin only)
- [x] Registrar em `app.ts`

### C.3 — Módulo Subscriptions
- [x] Criar `src/modules/subscriptions/subscriptions.schema.ts`:
  - [x] `createSubscriptionSchema` → `clientId`, `planId`, `startDate` (ISO date string), `notes?`
  - [x] `updatePaymentSchema` → `paidAt?: string | null`, `amount?: number`, `notes?: string`, `createFinanceEntry?: boolean` (default `true`)
- [x] Criar `src/modules/subscriptions/subscriptions.service.ts`:
  - [x] `create(data)`:
    - [x] Verificar se cliente já tem assinatura `active` ou `overdue` — lançar `AppError` se sim
    - [x] Criar `ClientSubscription` com `endDate = addMonths(startDate, durationMonths)`
    - [x] Em `prisma.$transaction`: gerar todos os `SubscriptionPayment` (month 1..N, `dueDate = addMonths(startDate, month-1)`, `amount = plan.price`)
  - [x] `findByClient(clientId)` → lista assinaturas com `plan` e progresso (pagos/total)
  - [x] `getDetails(subscriptionId)` → retorna assinatura com `plan` e todos `payments` ordenados por `month asc`
  - [x] `markPaymentPaid(paymentId, { paidAt, amount?, notes?, createFinanceEntry? })`:
    - [x] Atualiza `paidAt`, `amount`, `notes`
    - [x] Se `createFinanceEntry !== false`: cria `FinanceEntry` (`type: 'income'`, `description: "Pagamento — ${planName} — Mês ${month}"`, `date: paidAt`, `amount`); salva `financeEntryId` no payment
    - [x] Chama `recalculateStatus(subscriptionId)`
  - [x] `unmarkPaymentPaid(paymentId)`:
    - [x] Limpa `paidAt` e `notes`
    - [x] Se houver `financeEntryId`: deleta o `FinanceEntry` associado; limpa `financeEntryId`
    - [x] Chama `recalculateStatus(subscriptionId)`
  - [x] `recalculateStatus(subscriptionId)`:
    - [x] Todos pagos → `completed`
    - [x] Algum `dueDate < now()` e `paidAt null` → `overdue`
    - [x] Caso contrário → `active`
    - [x] `prisma.clientSubscription.update({ status })`
  - [x] `cancel(subscriptionId, notes?)` → seta `status: 'cancelled'`
- [x] Criar `src/modules/subscriptions/subscriptions.controller.ts` e `subscriptions.routes.ts`:
  - [x] `POST /api/v1/subscriptions` (admin only)
  - [x] `GET /api/v1/clients/:clientId/subscriptions` (admin only)
  - [x] `GET /api/v1/subscriptions/:id` (admin only)
  - [x] `PATCH /api/v1/subscriptions/:id/payments/:paymentId/pay`
  - [x] `PATCH /api/v1/subscriptions/:id/payments/:paymentId/unpay`
  - [x] `PATCH /api/v1/subscriptions/:id/cancel` (admin only)
- [x] Registrar em `app.ts`

### C.4 — Atualização do Módulo Clients
- [x] Atualizar `ClientsService.findById` para incluir assinatura ativa com dados do plano (`include`)
- [x] Atualizar `ClientsService.list` para incluir campo `subscriptionStatus` e `planName` via `include` + transformação

---

## MÓDULO C — Planos e Assinaturas (Frontend)

### C.5 — Services e Hooks
- [x] Criar `src/services/plans.service.ts` → `list`, `getById`, `create`, `update`, `deactivate`
- [x] Criar `src/services/subscriptions.service.ts` → `create`, `listByClient`, `getDetails`, `markPaid`, `unmarkPaid`, `cancel`
- [x] Criar `src/hooks/usePlans.ts` → `usePlans`, `usePlan`, `useCreatePlan`, `useUpdatePlan`, `useDeactivatePlan`
- [x] Criar `src/hooks/useSubscriptions.ts`:
  - [x] `useClientSubscriptions(clientId)`, `useSubscriptionDetails(id)`
  - [x] `useCreateSubscription()`, `useMarkPaid()`, `useUnmarkPaid()`, `useCancelSubscription()`
  - [x] Todas as mutations invalidam `['subscriptions', id]` e `['clients', clientId]`

### C.6 — Página de Planos (Admin)
- [x] Criar `src/pages/plans/PlansPage.tsx`:
  - [x] Tabela: nome, descrição, duração (ex: "3 meses"), valor mensal, valor total do plano, status, ações
  - [x] Botão "Novo Plano"
  - [x] Ações: editar; desativar com `ConfirmDialog`
- [x] Criar `src/pages/plans/PlanFormPage.tsx` (criar e editar):
  - [x] Form: nome, descrição opcional, valor mensal (em R$, convertido para centavos ao enviar), duração em meses
  - [x] Preview automático: "Valor total: R$ X,XX em Y meses"
  - [x] Validação Zod; redirect para `/plans` após sucesso com toast
- [x] Adicionar rotas `/plans`, `/plans/new`, `/plans/:id/edit` em `src/routes/index.tsx` (em `AdminRoute`)
- [x] Adicionar "Planos" no menu admin da `Sidebar` (entre Clientes e Financeiro)

### C.7 — Assinaturas dentro do Módulo Clientes
- [x] Atualizar `src/pages/clients/ClientDetailPage.tsx`:
  - [x] Se **sem assinatura ativa**: select de plano + date picker "Data de início" + botão "Contratar Plano"
  - [x] Se **com assinatura ativa/overdue**: exibir `SubscriptionCard` (read-only)
- [x] Criar `src/components/clients/SubscriptionCard.tsx`:
  - [x] Exibe: nome do plano, data início → data fim, badge de status (ativo=verde, overdue=vermelho, completed=azul, cancelled=cinza), barra de progresso "Mês X de Y", valor total formatado
  - [x] Botão "Ver Pagamentos" → abre `SubscriptionPaymentsModal`
  - [x] Botão "Cancelar Assinatura" → `ConfirmDialog` → `useCancelSubscription`
- [x] Criar `src/components/clients/SubscriptionPaymentsModal.tsx`:
  - [x] Título: "[Nome do Plano] — [Nome do Cliente]"
  - [x] **Timeline vertical** com um item por mês:
    - [x] **Pago**: ícone ✓ verde, "Pago em DD/MM/AAAA", valor pago, botão "Desmarcar" (discreto)
    - [x] **Pendente não vencido**: ícone ○ cinza, "Vence em DD/MM/AAAA", botão "Marcar como Pago"
    - [x] **Pendente vencido**: ícone ✗ vermelho, "Vencido há X dias", botão "Marcar como Pago" destacado em vermelho
  - [x] Ao clicar "Marcar como Pago" → expande formulário inline:
    - [x] Date picker "Data do pagamento" (padrão: hoje)
    - [x] Campo "Observações" (opcional)
    - [x] Checkbox "Criar lançamento financeiro automaticamente" (padrão: marcado)
    - [x] Botões "Confirmar" (loading state) e "Cancelar"
  - [x] "Desmarcar" → `ConfirmDialog` avisando que o lançamento financeiro será removido
  - [x] **Rodapé fixo**: "X de Y meses pagos · Recebido: R$ X,XX · Pendente: R$ X,XX"
- [x] Tipo `Client` atualizado com campo `subscriptions` opcional

---

## MÓDULO D — WebSocket e Notificações (Backend)

### D.1 — Setup WebSocket
- [ ] Instalar `@fastify/websocket` com `pnpm add @fastify/websocket --filter api`
- [ ] Registrar plugin em `app.ts`
- [ ] Criar `src/lib/ws-manager.ts`:
  - [ ] `Map<string, WebSocket>` mapeando `userId → socket`
  - [ ] `connect(userId, socket)` → salva; ao fechar socket remove automaticamente via `socket.on('close', ...)`
  - [ ] `disconnect(userId)` → remove do mapa
  - [ ] `send(userId, payload: object)` → serializa JSON e envia se usuário estiver no mapa
  - [ ] `broadcast(userIds: string[], payload)` → itera e chama `send`

### D.2 — Schema Prisma (Notifications)
- [ ] Adicionar ao `schema.prisma`:

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  body      String?
  data      Json?            // { boardId?, activityId?, commentId?, actorName? }
  readAt    DateTime?
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  board_invite
  activity_assigned
  activity_mention
}
```

- [ ] Adicionar relação `notifications Notification[]` ao modelo `User`
- [ ] Rodar `pnpm db:migrate --name notifications`
- [ ] Rodar `pnpm db:generate`

### D.3 — Módulo Notifications
- [ ] Criar `src/modules/notifications/notifications.service.ts`:
  - [ ] `create(userId, type, title, body?, data?)` → salva; chama `wsManager.send(userId, { event: 'notification', payload: record })`
  - [ ] `list(userId, { unreadOnly?, page?, limit? })` → paginado, `createdAt desc`
  - [ ] `markAsRead(id, userId)` → verifica ownership; seta `readAt = now()`
  - [ ] `markAllAsRead(userId)` → `updateMany`
  - [ ] `countUnread(userId)` → `count` onde `readAt: null`
- [ ] Criar `src/modules/notifications/notifications.routes.ts`:
  - [ ] `GET /api/v1/ws` → endpoint WebSocket; autenticar via `?token=<accessToken>`; chamar `wsManager.connect(userId, socket)`
  - [ ] `GET /api/v1/notifications`
  - [ ] `GET /api/v1/notifications/unread-count`
  - [ ] `PATCH /api/v1/notifications/:id/read`
  - [ ] `PATCH /api/v1/notifications/read-all`
- [ ] Registrar em `app.ts`

### D.4 — Disparar Notificações nos Eventos Existentes
- [ ] `boards.service.ts → addMember`:
  - [ ] `NotificationsService.create(targetUserId, 'board_invite', 'Você foi adicionado a um quadro', \`${actorName} adicionou você ao quadro "${boardName}"\`, { boardId })`
- [ ] `activities.service.ts → update` (quando novo assignee adicionado):
  - [ ] Para cada userId novo: `NotificationsService.create(userId, 'activity_assigned', 'Você foi atribuído a uma atividade', \`${actorName} atribuiu você à atividade "${title}"\`, { boardId, activityId })`
- [ ] `comments.service.ts → create`:
  - [ ] Criar `src/shared/utils/mentions.ts` com `extractMentions(content): string[]` (padrão `@[userId]`)
  - [ ] Para cada userId mencionado: `NotificationsService.create(userId, 'activity_mention', 'Você foi mencionado', \`${actorName}: "${trecho}"\`, { boardId, activityId, commentId })`

---

## MÓDULO D — WebSocket e Notificações (Frontend)

### D.5 — WebSocket Client
- [ ] Criar `src/lib/ws-client.ts`:
  - [ ] Classe `WSClient` com `connect(token)`, `disconnect()`, `on(event, handler)`, `off(event)`
  - [ ] `new WebSocket(\`${VITE_WS_URL}/ws?token=${token}\`)`
  - [ ] Reconexão automática com backoff exponencial: 1s → 2s → 4s → 8s → 16s → 30s (máx); não reconectar se `disconnect()` foi chamado explicitamente
- [ ] Adicionar `VITE_WS_URL` ao `.env.example`

### D.6 — Store de Notificações
- [ ] Criar `src/stores/notifications.store.ts` (Zustand, sem persist):
  - [ ] `notifications: Notification[]`, `unreadCount: number`
  - [ ] `addNotification(n)` → prepend; incrementa `unreadCount`
  - [ ] `setNotifications(list)`, `setUnreadCount(n)`
  - [ ] `markAsRead(id)` → atualiza item; decrementa `unreadCount`
  - [ ] `markAllAsRead()` → atualiza todos; zera `unreadCount`

### D.7 — Hooks
- [ ] Criar `src/hooks/useNotifications.ts`:
  - [ ] `useNotificationsList(filters?)` → query `GET /notifications`
  - [ ] `useUnreadCount()` → query com `refetchInterval: 30000` como fallback
  - [ ] `useMarkAsRead()` → mutation + atualizar store
  - [ ] `useMarkAllAsRead()` → mutation + atualizar store
- [ ] Criar `src/hooks/useWebSocket.ts`:
  - [ ] `useRef(new WSClient())` → conecta ao montar com `accessToken`; desconecta ao desmontar
  - [ ] Handler para `notification` → `notifications.store.addNotification(payload)`
  - [ ] Chamar `useWebSocket()` dentro de `AppShell.tsx`

### D.8 — UI de Notificações
- [ ] Atualizar `src/components/layout/TopBar.tsx`:
  - [ ] Ícone `Bell` com badge numérico de `unreadCount` (vermelho, máx "99+", oculto se 0)
  - [ ] Clicar → abre `NotificationsDropdown`
- [ ] Criar `src/components/notifications/NotificationsDropdown.tsx`:
  - [ ] Header: "Notificações" + botão "Marcar todas como lidas" (visível se `unreadCount > 0`)
  - [ ] Lista scrollável com até 10 notificações mais recentes
  - [ ] Cada item: ícone por tipo (`UserPlus`, `CheckSquare`, `AtSign`), título, body, data relativa, dot azul se não lida
  - [ ] Ao clicar: `useMarkAsRead` + navegar conforme tipo (`board_invite` → `/boards/:boardId`; `activity_assigned/mention` → `/boards/:boardId` + setar `selectedActivityId` no `kanban.store`)
  - [ ] Rodapé: link "Ver todas" → `/notifications`
- [ ] Criar `src/pages/notifications/NotificationsPage.tsx`:
  - [ ] Título + botão "Marcar todas como lidas"
  - [ ] Tabs: "Todas" / "Não lidas"
  - [ ] Lista paginada; ao clicar: marcar como lida + navegar
- [ ] Toast em tempo real:
  - [ ] No handler do `useWebSocket`: se usuário não estiver na página do recurso → `sonner.info(title, { description: body, action: { label: 'Ver', onClick: () => navigate(...) } })`
- [ ] Adicionar rota `/notifications` em `src/routes/index.tsx` (privada, ambas as roles)

---

## MÓDULO E — Audit Log (Backend)

> Registro imutável de ações importantes para rastreabilidade e segurança.

### E.1 — Schema Prisma
- [ ] Adicionar ao `schema.prisma`:

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?  // null se ação do sistema
  userEmail  String?  // snapshot do email no momento da ação
  action     String   // ex: "client.created", "user.deactivated"
  entity     String   // ex: "Client", "User", "Plan"
  entityId   String?
  before     Json?    // Estado anterior (updates)
  after      Json?    // Estado posterior (updates)
  ip         String?
  userAgent  String?
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

- [ ] Adicionar relação `auditLogs AuditLog[]` ao modelo `User`
- [ ] Rodar `pnpm db:migrate --name audit-log`
- [ ] Rodar `pnpm db:generate`

### E.2 — Service e Constantes
- [ ] Criar `src/modules/audit/audit.service.ts`:
  - [ ] `log({ userId?, userEmail?, action, entity, entityId?, before?, after?, ip?, userAgent? })` → `prisma.auditLog.create(...)` — sempre fire-and-forget (`.catch(err => fastify.log.error(err))`, nunca `await` nos callers)
  - [ ] `list(filters: { entity?, action?, userId?, from?, to?, page?, limit? })` → paginado, `createdAt desc`
- [ ] Criar `src/shared/utils/audit-actions.ts`:

```typescript
export const AuditAction = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DEACTIVATED: 'user.deactivated',
  USER_PASSWORD_CHANGED: 'user.password_changed', // nunca logar a senha, só o evento
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',
  CLIENT_DELETED: 'client.deleted',
  PLAN_CREATED: 'plan.created',
  PLAN_UPDATED: 'plan.updated',
  PLAN_DEACTIVATED: 'plan.deactivated',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_PAYMENT_MARKED: 'subscription.payment_marked',
  SUBSCRIPTION_PAYMENT_UNMARKED: 'subscription.payment_unmarked',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  BOARD_CREATED: 'board.created',
  BOARD_MEMBER_ADDED: 'board.member_added',
  BOARD_MEMBER_REMOVED: 'board.member_removed',
} as const
```

### E.3 — Instrumentar os Services
> Em todos os casos abaixo: `ip` e `userAgent` são extraídos do `req` no controller e passados como parâmetro extra para o service.

- [ ] `auth.service.ts → login` → log `AUTH_LOGIN`
- [ ] `auth.service.ts → logout` → log `AUTH_LOGOUT`
- [ ] `users.service.ts → create` → log `USER_CREATED` com `after: newUser` (omitir `passwordHash`)
- [ ] `users.service.ts → update` → log `USER_UPDATED` com `before` e `after`
- [ ] `users.service.ts → deactivate` → log `USER_DEACTIVATED`
- [ ] `users.service.ts → changePassword` → log `USER_PASSWORD_CHANGED` (sem dados de senha)
- [ ] `clients.service.ts → create/update/remove` → logs correspondentes
- [ ] `plans.service.ts → create/update/deactivate` → logs correspondentes
- [ ] `subscriptions.service.ts → create/markPaymentPaid/unmarkPaymentPaid/cancel` → logs correspondentes
- [ ] `boards.service.ts → create/addMember/removeMember` → logs correspondentes

### E.4 — Rota de Audit Log
- [ ] Criar `src/modules/audit/audit.routes.ts`:
  - [ ] `GET /api/v1/audit-logs` (admin only) → filtros: `entity?`, `action?`, `userId?`, `from?`, `to?`, `page?`, `limit?`
- [ ] Registrar em `app.ts`

---

## MÓDULO E — Audit Log (Frontend)

### E.5 — Service e Hook
- [ ] Criar `src/services/audit.service.ts` → `list(filters)`
- [ ] Criar `src/hooks/useAuditLog.ts` → `useAuditLogs(filters?)`

### E.6 — Página de Audit Log (Admin)
- [ ] Criar `src/pages/audit/AuditLogPage.tsx`:
  - [ ] Tabela: data/hora, usuário (email), ação (badge formatado), entidade, ID do recurso (truncado com tooltip completo), botão "Detalhes"
  - [ ] Filtros: seletor de entidade, campo de busca por ação, seletor de usuário, range de datas (from → to)
  - [ ] Paginação
  - [ ] Ao clicar "Detalhes" → abre `AuditDetailModal`
- [ ] Criar `src/components/audit/AuditDetailModal.tsx`:
  - [ ] Exibe todos os campos do log formatados
  - [ ] Se `before` e `after` presentes: diff lado a lado — chaves com valores alterados destacadas com cor
  - [ ] Se apenas `after`: exibir JSON formatado com syntax highlighting simples
- [ ] Adicionar rota `/audit-logs` em `src/routes/index.tsx` (em `AdminRoute`)
- [ ] Adicionar "Auditoria" no menu admin da `Sidebar` abaixo de Financeiro (ícone `ClipboardList`)

---

## Atualização de Documentação

- [ ] Atualizar `ARCHITECTURE.md`:
  - [ ] Diagrama com WebSocket (fluxo: cliente conecta com token → server registra no `ws-manager` → eventos disparam `wsManager.send`)
  - [ ] Atualizar tabela de modelos: `Plan`, `ClientSubscription`, `SubscriptionPayment`, `Notification`, `AuditLog`
  - [ ] Documentar convenção de eventos WS: `{ event: 'notification', payload: NotificationRecord }`
- [ ] Atualizar `PROJECT_RULES.md`:
  - [ ] Seção "Roles e Permissões": listar rotas por role
  - [ ] Regra de audit: "todo service que muta dados chama `AuditService.log` de forma fire-and-forget"
  - [ ] Regra de pagamentos: "ao marcar pago, criar `FinanceEntry` por padrão; pode ser desativado com `createFinanceEntry: false`"
- [ ] Atualizar `apps/api/prisma/seed.ts`:
  - [ ] Planos de exemplo: "Mensal" (1 mês), "Trimestral" (3 meses), "Semestral" (6 meses), "Anual" (12 meses)
  - [ ] Usuário membro de exemplo além do admin
- [ ] Rodar `pnpm lint` e `pnpm build` em todos os apps

---

## Resumo e Ordem de Execução

```
A (Perfil)
  └─► B (Roles + Guards)
        ├─► C (Planos e Assinaturas)
        ├─► D (WebSocket + Notificações)
        └─► E (Audit Log) ← pode ser feito em paralelo com C e D
```

| Módulo | Novas deps (backend) | Tasks estimadas |
|---|---|---|
| A — Perfil | — | ~12 |
| B — Roles | — | ~14 |
| C — Planos | — | ~35 |
| D — Notificações | `@fastify/websocket` | ~32 |
| E — Audit Log | — | ~18 |
| Documentação | — | ~8 |

**Total estimado: ~119 tasks**

---

*Continuação das fases 1–12 (frontend) e 1–10 (backend) + Kanban Redesign.*
*Documento vivo — atualizar conforme padrões evoluem durante a implementação.*