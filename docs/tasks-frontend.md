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

- [x] Criar `src/services/dashboard.service.ts` → chamadas de resumo (ou compor de outros services)
- [x] Criar `src/pages/dashboard/DashboardPage.tsx`
  - [x] Card: total de clientes ativos
  - [x] Card: total de leads
  - [x] Card: mensalidades pagas vs pendentes
  - [x] Card: saldo financeiro do mês atual
  - [x] Lista das últimas atividades criadas (últimas 5)
- [x] Criar `src/components/shared/StatCard.tsx` → card de métrica reutilizável
- [x] Testar integração com API

---

## FASE 6 — Módulo Usuários

- [x] Criar `src/services/users.service.ts` → `list`, `create`, `update`, `deactivate`
- [x] Criar `src/hooks/useUsers.ts` → `useUsers`, `useCreateUser`, `useUpdateUser`, `useDeactivateUser`
- [x] Criar `src/components/shared/DataTable.tsx` → tabela genérica com paginação, loading skeleton, empty state
- [x] Criar `src/pages/users/UsersPage.tsx`
  - [x] Tabela com colunas: nome, cargo, email, telefone, status, ações
  - [x] Botão "Novo Usuário"
  - [x] Ação de desativar usuário com `ConfirmDialog`
- [x] Criar `src/components/shared/ConfirmDialog.tsx` → dialog de confirmação reutilizável
- [x] Criar `src/pages/users/UserFormPage.tsx` (criar e editar)
  - [x] Form: nome, cargo, telefone, email, senha (só no criar), role
  - [x] Validação Zod com `@bewave/schemas`
  - [x] Redirect para `/users` após sucesso
- [x] Testar CRUD completo

---

## FASE 7 — Módulo Clientes

- [x] Criar `src/services/clients.service.ts` → `list`, `create`, `update`, `remove`
- [x] Criar `src/hooks/useClients.ts` → `useClients`, `useCreateClient`, `useUpdateClient`, `useRemoveClient`
- [x] Criar `src/pages/clients/ClientsPage.tsx`
  - [x] Tabela com colunas: nome, email, telefone, status, contrato, mensalidade, ações
  - [x] Filtros: por status (`lead` / `active`) e por pagamento (`pago` / `pendente`)
  - [x] Badge de status colorido (`lead` = amarelo, `active` = verde)
  - [x] Badge de pagamento (`pago` = verde, `pendente` = vermelho)
  - [x] Botão "Novo Cliente"
  - [x] Ação de deletar com `ConfirmDialog`
- [x] Criar `src/components/shared/StatusBadge.tsx` → badge reutilizável com variantes
- [x] Criar `src/pages/clients/ClientFormPage.tsx` (criar e editar)
  - [x] Form: nome, endereço, telefone, email, tempo de contrato, pago (checkbox), status
  - [x] Validação Zod
  - [x] Redirect para `/clients` após sucesso
- [x] Testar CRUD + filtros

---

## FASE 8 — Módulo Kanban (Quadros)

- [x] Criar `src/services/boards.service.ts` → workspaces, boards, columns, activities
- [x] Criar `src/hooks/useBoards.ts` → queries e mutations para boards, colunas e atividades
- [x] Criar `src/pages/boards/WorkspacesPage.tsx`
  - [x] Grid de cards de workspaces
  - [x] Botão "Novo Workspace"
  - [x] Exibir membros (avatares) em cada workspace
  - [x] Navegar para o board ao clicar
- [x] Criar `src/pages/boards/BoardPage.tsx`
  - [x] Listagem das colunas em scroll horizontal
  - [x] Botão "Adicionar Coluna"
  - [x] Integração com DnD (estrutura base)
- [x] Criar `src/components/kanban/Board.tsx` → `DndContext` + `SortableContext` horizontal (colunas)
- [x] Criar `src/components/kanban/Column.tsx`
  - [x] Header com título e count de cards
  - [x] Lista de cards com `SortableContext` vertical
  - [x] Botão "Adicionar atividade"
  - [x] Drop zone visível ao arrastar
- [x] Criar `src/components/kanban/ActivityCard.tsx`
  - [x] Título, badge de prioridade, badge de categoria
  - [x] Avatares dos responsáveis (até 3 + overflow)
  - [x] `useSortable` do dnd-kit
  - [x] Efeito visual ao arrastar (overlay)
- [x] Criar `src/components/kanban/ActivityModal.tsx` (criar e editar card)
  - [x] Form: título, descrição (textarea), prioridade (select), categoria (input), responsáveis (multi-select de usuários)
- [x] Implementar lógica de DnD
  - [x] Mover card entre colunas
  - [x] Reordenar cards dentro da mesma coluna
  - [x] Optimistic update com TanStack Query
  - [x] Rollback em caso de erro na API
- [x] Criar `src/hooks/useKanban.ts` → encapsula toda lógica de DnD e mutations
- [x] Testar drag & drop completo

---

## FASE 9 — Módulo Financeiro

- [x] Criar `src/services/finance.service.ts` → `list`, `create`, `remove`, `getSummary`
- [x] Criar `src/hooks/useFinance.ts` → `useFinanceEntries`, `useFinanceSummary`, `useCreateEntry`, `useRemoveEntry`
- [x] Criar `src/pages/finance/FinancePage.tsx`
  - [x] Cards de resumo: Total Entradas, Total Saídas, Saldo (com cor verde/vermelho)
  - [x] Filtro por período (mês atual como padrão)
  - [x] Tabela de lançamentos: data, tipo, descrição, categoria, valor
  - [x] Badge de tipo (`income` = verde, `expense` = vermelho)
  - [x] Valores formatados com `formatCurrency()` de `@bewave/utils`
  - [x] Botão "Novo Lançamento"
  - [x] Ação de deletar com `ConfirmDialog`
- [x] Criar `src/components/finance/FinanceEntryModal.tsx`
  - [x] Form: tipo (toggle income/expense), valor, descrição, categoria, data
  - [x] Validação Zod
- [x] Testar lançamentos e resumo por período

---

## FASE 10 — Polimento e finalização

- [x] Adicionar `sonner` para notificações de sucesso/erro em todas as mutations
- [x] Garantir responsividade do layout (sidebar colapsável no mobile)
- [x] Adicionar loading skeletons nas tabelas e nos cards do Kanban
- [x] Implementar toggle de dark/light mode funcional (persistir no Zustand + `localStorage`)
- [x] Adicionar página `404` (rota `*` no router)
- [x] Revisar todos os formulários: foco automático, submit com Enter, campos obrigatórios marcados
- [x] Rodar `pnpm lint` e corrigir erros de TypeScript
- [x] Rodar `pnpm build` e confirmar sem erros
- [x] Testar fluxo completo ponta a ponta (login → dashboard → clientes → kanban → financeiro → logout)

---

## FASE 11 — Melhoria de Layout (UI Redesign)

> Foco em elevar a qualidade visual do sistema. Nenhuma lógica de negócio ou integração com API é alterada nesta fase.

### 11.1 — Página de Login

- [x] Redesenhar `src/pages/auth/LoginPage.tsx` com layout split 50/50
  - [x] **Esquerda** — formulário sobre fundo claro (`#f4f4f0`)
    - [x] Logo Bewave (ícone + nome) no topo esquerdo
    - [x] Tag "Área Restrita" em `#3841D4` acima do título
    - [x] Título tipográfico de impacto: "Bem-vindo de volta." com acento colorido
    - [x] Subtítulo descritivo em cinza
    - [x] Campo e-mail com ícone interno e label uppercase
    - [x] Campo senha com ícone interno + toggle de visibilidade
    - [x] Link "Esqueceu a senha?" alinhado à direita
    - [x] Botão "Entrar" em `#3841D4` com sombra colorida, ícone de seta e hover com elevação
    - [x] Exibição de erros de validação inline (Zod)
    - [x] Exibição de erro de credenciais inválidas vindo da API
  - [x] **Direita** — painel visual com fundo `#3841D4`
    - [x] Elemento decorativo tipográfico de fundo (letra "B" em opacidade baixa)
    - [x] Círculos geométricos decorativos e linha vertical sutil
    - [x] Dois cards flutuantes com métricas reais vindas da API (ex: faturamento do mês, total de clientes ativos)
    - [x] Tag "Sistema ao vivo" com dot verde animado
    - [x] Título e descrição do sistema no rodapé do painel
    - [x] Linha de stats estáticos: Acesso seguro / 24/7 / Versão atual
  - [x] Responsividade: painel direito oculto em telas menores que 900px
- [x] Adicionar fonte display (ex: Syne) via CDN no `index.html` para uso nos títulos
- [x] Testar fluxo: login com credenciais válidas → redirect para `/dashboard`
- [x] Testar fluxo: login com credenciais inválidas → exibir mensagem de erro

### 11.2 — Sidebar e TopBar

- [x] Revisar `src/components/layout/Sidebar.tsx`
  - [x] Ajustar espaçamentos e tipografia dos links de navegação
  - [x] Melhorar visual do item ativo (borda lateral `#3841D4` + fundo sutil)
  - [x] Polir avatar + nome do usuário no rodapé
- [x] Revisar `src/components/layout/TopBar.tsx`
  - [x] Garantir consistência visual com a nova identidade da sidebar
  - [x] Melhorar o toggle dark/light mode (ícone animado)

### 11.3 — Consistência geral

- [x] Revisar `index.css` e garantir que CSS variables reflitam a paleta atualizada (`--primary: #3841D4`)
- [x] Garantir que todos os botões primários do sistema usem `#3841D4`
- [x] Verificar consistência de border-radius, sombras e espaçamentos em todos os módulos
- [x] Testar dark mode com os novos estilos em todas as páginas

---

**Progresso:** `104 / 104` tasks concluídas