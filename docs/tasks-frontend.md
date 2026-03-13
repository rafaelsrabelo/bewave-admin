# TASKS — Frontend (apps/web)

> Marque cada task com `[x]` ao concluir.
> Siga a ordem — cada fase depende da anterior.
> As fases 1 e 2 podem ser feitas em paralelo com o backend. A partir da fase 3, a API precisa estar funcional.

---

## FASE 1 — Setup inicial

- [x] Inicializar projeto com Vite + React + TypeScript em `apps/web`
- [x] Configurar `tsconfig.json` com `strict: true` e paths (`@/*`)
- [x] Instalar e configurar TailwindCSS v4
- [x] Inicializar shadcn/ui (`npx shadcn@latest init`)
- [x] Instalar componentes shadcn base: `button`, `input`, `label`, `card`, `badge`, `dialog`, `dropdown-menu`, `select`, `textarea`, `table`, `sonner`, `separator`, `avatar`, `tooltip`
- [x] Instalar dependências: `axios`, `react-router-dom`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`, `lucide-react`
- [x] Instalar `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [x] Configurar fontes Geist via CDN no `index.html`
- [x] Definir CSS variables do design system em `index.css` (paleta dark/light)
- [x] Testar `pnpm dev` com página em branco funcionando

---

## FASE 2 — Infraestrutura base

- [x] Criar `src/lib/axios.ts` → instância Axios com `baseURL`, interceptors de request (token) e response (refresh automático + redirect no 401)
- [x] Criar `src/lib/query-client.ts` → TanStack Query com `staleTime` e `retry` configurados
- [x] Criar `src/stores/auth.store.ts` → Zustand com `accessToken`, `user`, `setAuth`, `clearAuth`
- [x] Criar `src/stores/ui.store.ts` → Zustand com `sidebarOpen`, `theme`
- [x] Criar `src/lib/utils.ts` → funções `cn()`, re-exports de `@bewave/utils`
- [x] Criar `src/routes/PrivateRoute.tsx` → redireciona para `/login` se não autenticado
- [x] Criar `src/routes/index.tsx` → configuração de todas as rotas com React Router
- [x] Envolver `main.tsx` com `QueryClientProvider` e `BrowserRouter`

---

## FASE 3 — Layout principal

- [x] Criar `src/components/layout/AppShell.tsx` → wrapper com sidebar + topbar + `<Outlet />`
- [x] Criar `src/components/layout/Sidebar.tsx`
  - [x] Logo bewave-admin no topo
  - [x] Links de navegação: Dashboard, Usuários, Clientes, Quadros, Financeiro
  - [x] Highlight da rota ativa
  - [x] Botão de collapse (mobile)
  - [x] Avatar + nome do usuário logado no rodapé
- [x] Criar `src/components/layout/TopBar.tsx`
  - [x] Título da página atual
  - [x] Toggle dark/light mode
  - [x] Menu do usuário (perfil, logout)
- [x] Criar `src/components/shared/PageHeader.tsx` → título, descrição, slot de action
- [x] Criar `src/components/shared/EmptyState.tsx` → ícone, mensagem, CTA opcional
- [x] Criar `src/components/shared/LoadingSpinner.tsx`
- [x] Testar layout com página placeholder dentro do `AppShell`

---

## FASE 4 — Autenticação

- [x] Criar `src/services/auth.service.ts` → `login()`, `logout()`, `refreshToken()`
- [x] Criar `src/hooks/useAuth.ts` → `useLogin`, `useLogout`
- [x] Criar `src/pages/auth/LoginPage.tsx`
  - [x] Form com `react-hook-form` + validação Zod (`loginSchema` de `@bewave/schemas`)
  - [x] Campo email + senha com toggle de visibilidade
  - [x] Estado de loading no botão
  - [x] Exibição de erro de credenciais inválidas
  - [x] Redirect para `/dashboard` após login bem-sucedido
- [x] Configurar interceptor de refresh automático no `axios.ts`
- [x] Testar fluxo completo: login → token no Zustand → rota protegida → logout

---

## FASE 5 — Dashboard

- [ ] Criar `src/services/dashboard.service.ts` → chamadas de resumo (ou compor de outros services)
- [ ] Criar `src/pages/dashboard/DashboardPage.tsx`
  - [ ] Card: total de clientes ativos
  - [ ] Card: total de leads
  - [ ] Card: mensalidades pagas vs pendentes
  - [ ] Card: saldo financeiro do mês atual
  - [ ] Lista das últimas atividades criadas (últimas 5)
- [ ] Criar `src/components/shared/StatCard.tsx` → card de métrica reutilizável
- [ ] Testar integração com API

---

## FASE 6 — Módulo Usuários

- [ ] Criar `src/services/users.service.ts` → `list`, `create`, `update`, `deactivate`
- [ ] Criar `src/hooks/useUsers.ts` → `useUsers`, `useCreateUser`, `useUpdateUser`, `useDeactivateUser`
- [ ] Criar `src/components/shared/DataTable.tsx` → tabela genérica com paginação, loading skeleton, empty state
- [ ] Criar `src/pages/users/UsersPage.tsx`
  - [ ] Tabela com colunas: nome, cargo, email, telefone, status, ações
  - [ ] Botão "Novo Usuário"
  - [ ] Ação de desativar usuário com `ConfirmDialog`
- [ ] Criar `src/components/shared/ConfirmDialog.tsx` → dialog de confirmação reutilizável
- [ ] Criar `src/pages/users/UserFormPage.tsx` (criar e editar)
  - [ ] Form: nome, cargo, telefone, email, senha (só no criar), role
  - [ ] Validação Zod com `@bewave/schemas`
  - [ ] Redirect para `/users` após sucesso
- [ ] Testar CRUD completo

---

## FASE 7 — Módulo Clientes

- [ ] Criar `src/services/clients.service.ts` → `list`, `create`, `update`, `remove`
- [ ] Criar `src/hooks/useClients.ts` → `useClients`, `useCreateClient`, `useUpdateClient`, `useRemoveClient`
- [ ] Criar `src/pages/clients/ClientsPage.tsx`
  - [ ] Tabela com colunas: nome, email, telefone, status, contrato, mensalidade, ações
  - [ ] Filtros: por status (`lead` / `active`) e por pagamento (`pago` / `pendente`)
  - [ ] Badge de status colorido (`lead` = amarelo, `active` = verde)
  - [ ] Badge de pagamento (`pago` = verde, `pendente` = vermelho)
  - [ ] Botão "Novo Cliente"
  - [ ] Ação de deletar com `ConfirmDialog`
- [ ] Criar `src/components/shared/StatusBadge.tsx` → badge reutilizável com variantes
- [ ] Criar `src/pages/clients/ClientFormPage.tsx` (criar e editar)
  - [ ] Form: nome, endereço, telefone, email, tempo de contrato, pago (checkbox), status
  - [ ] Validação Zod
  - [ ] Redirect para `/clients` após sucesso
- [ ] Testar CRUD + filtros

---

## FASE 8 — Módulo Kanban (Quadros)

- [ ] Criar `src/services/boards.service.ts` → workspaces, boards, columns, activities
- [ ] Criar `src/hooks/useBoards.ts` → queries e mutations para boards, colunas e atividades
- [ ] Criar `src/pages/boards/WorkspacesPage.tsx`
  - [ ] Grid de cards de workspaces
  - [ ] Botão "Novo Workspace"
  - [ ] Exibir membros (avatares) em cada workspace
  - [ ] Navegar para o board ao clicar
- [ ] Criar `src/pages/boards/BoardPage.tsx`
  - [ ] Listagem das colunas em scroll horizontal
  - [ ] Botão "Adicionar Coluna"
  - [ ] Integração com DnD (estrutura base)
- [ ] Criar `src/components/kanban/Board.tsx` → `DndContext` + `SortableContext` horizontal (colunas)
- [ ] Criar `src/components/kanban/Column.tsx`
  - [ ] Header com título e count de cards
  - [ ] Lista de cards com `SortableContext` vertical
  - [ ] Botão "Adicionar atividade"
  - [ ] Drop zone visível ao arrastar
- [ ] Criar `src/components/kanban/ActivityCard.tsx`
  - [ ] Título, badge de prioridade, badge de categoria
  - [ ] Avatares dos responsáveis (até 3 + overflow)
  - [ ] `useSortable` do dnd-kit
  - [ ] Efeito visual ao arrastar (overlay)
- [ ] Criar `src/components/kanban/ActivityModal.tsx` (criar e editar card)
  - [ ] Form: título, descrição (textarea), prioridade (select), categoria (input), responsáveis (multi-select de usuários)
- [ ] Implementar lógica de DnD
  - [ ] Mover card entre colunas
  - [ ] Reordenar cards dentro da mesma coluna
  - [ ] Optimistic update com TanStack Query
  - [ ] Rollback em caso de erro na API
- [ ] Criar `src/hooks/useKanban.ts` → encapsula toda lógica de DnD e mutations
- [ ] Testar drag & drop completo

---

## FASE 9 — Módulo Financeiro

- [ ] Criar `src/services/finance.service.ts` → `list`, `create`, `remove`, `getSummary`
- [ ] Criar `src/hooks/useFinance.ts` → `useFinanceEntries`, `useFinanceSummary`, `useCreateEntry`, `useRemoveEntry`
- [ ] Criar `src/pages/finance/FinancePage.tsx`
  - [ ] Cards de resumo: Total Entradas, Total Saídas, Saldo (com cor verde/vermelho)
  - [ ] Filtro por período (mês atual como padrão)
  - [ ] Tabela de lançamentos: data, tipo, descrição, categoria, valor
  - [ ] Badge de tipo (`income` = verde, `expense` = vermelho)
  - [ ] Valores formatados com `formatCurrency()` de `@bewave/utils`
  - [ ] Botão "Novo Lançamento"
  - [ ] Ação de deletar com `ConfirmDialog`
- [ ] Criar `src/components/finance/FinanceEntryModal.tsx`
  - [ ] Form: tipo (toggle income/expense), valor, descrição, categoria, data
  - [ ] Validação Zod
- [ ] Testar lançamentos e resumo por período

---

## FASE 10 — Polimento e finalização

- [ ] Adicionar `react-hot-toast` ou usar `sonner` para notificações de sucesso/erro em todas as mutations
- [ ] Garantir responsividade do layout (sidebar colapsável no mobile)
- [ ] Adicionar loading skeletons nas tabelas e nos cards do Kanban
- [ ] Implementar toggle de dark/light mode funcional (persistir no Zustand + `localStorage`)
- [ ] Adicionar página `404` (rota `*` no router)
- [ ] Revisar todos os formulários: foco automático, submit com Enter, campos obrigatórios marcados
- [ ] Rodar `pnpm lint` e corrigir erros de TypeScript
- [ ] Rodar `pnpm build` e confirmar sem erros
- [ ] Testar fluxo completo ponta a ponta (login → dashboard → clientes → kanban → financeiro → logout)

---

**Progresso:** `42 / 90` tasks concluídas