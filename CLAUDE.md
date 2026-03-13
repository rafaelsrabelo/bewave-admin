# CLAUDE.md — Regras do Projeto bewave-admin

> Este arquivo é lido pelo Claude (e outros agentes de IA) antes de qualquer tarefa.
> Leia **todo** este documento antes de escrever qualquer linha de código.

---

## 📌 Visão Geral do Projeto

**Nome:** bewave-admin  
**Tipo:** Monorepo Turborepo (Node.js + React)  
**Objetivo:** Sistema de administração interno para gerenciar usuários, clientes, quadros de atividades (Kanban) e financeiro.

---

## 🗂️ Estrutura do Monorepo

```
bewave-admin/
├── apps/
│   ├── web/                  # Frontend React (Vite + TypeScript)
│   └── api/                  # Backend Node.js (Fastify + TypeScript)
├── packages/
│   ├── ui/                   # Componentes compartilhados (shadcn/ui base)
│   ├── types/                # Tipos TypeScript compartilhados
│   ├── schemas/              # Schemas Zod compartilhados (validação)
│   ├── utils/                # Utilitários compartilhados
│   └── config/               # Configurações compartilhadas
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
├── turbo.json
├── package.json              # Root workspace (pnpm)
├── .env.example
├── CLAUDE.md                 # ← Este arquivo
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    └── PROJECT_RULES.md
```

---

## ⚙️ Stack Tecnológica

### Frontend (`apps/web`)
| Tecnologia | Versão | Propósito |
|---|---|---|
| React | ^18 | UI Framework |
| TypeScript | ^5 | Tipagem estática |
| Vite | ^5 | Build tool |
| TailwindCSS | ^4 | Estilização |
| shadcn/ui | latest | Componentes base |
| React Router | ^6 | Roteamento |
| TanStack Query | ^5 | Server state / cache |
| Zustand | ^4 | Client state global |
| React Hook Form | ^7 | Formulários |
| Zod | ^3 | Validação de schemas |
| @dnd-kit | ^6 | Drag and drop (Kanban) |
| Lucide React | latest | Ícones |
| date-fns | ^3 | Manipulação de datas |
| axios | ^1 | HTTP client |

### Backend (`apps/api`)
| Tecnologia | Versão | Propósito |
|---|---|---|
| Node.js | ^20 LTS | Runtime |
| Fastify | ^4 | HTTP Framework |
| TypeScript | ^5 | Tipagem estática |
| Prisma ORM | ^5 | ORM |
| PostgreSQL | ^15 | Banco de dados |
| Redis | ^7 | Cache / sessions |
| Zod | ^3 | Validação |
| JWT | — | Autenticação |
| bcrypt | — | Hash de senhas |

### DevOps / Tooling
| Tecnologia | Propósito |
|---|---|
| pnpm | Package manager do monorepo |
| Turborepo | Build system e cache |
| ESLint (flat config) | Linting |
| Prettier | Formatação |
| Husky | Git hooks |
| lint-staged | Lint antes do commit |
| commitlint | Padrão de commits |
| Vitest | Testes unitários |
| Playwright | Testes E2E |

---

## 📐 Regras de Código

### TypeScript
- **SEMPRE** usar TypeScript. Nunca usar `any` — prefira `unknown` e faça type guards.
- Exportar tipos e interfaces dos arquivos `types/` do pacote `@bewave/types`.
- Usar `satisfies` operator quando útil.
- Preferir `type` sobre `interface` para objetos de dados; `interface` para contratos de classe.
- Habilitar `strict: true` em todos os `tsconfig.json`.

```typescript
// ✅ Correto
type User = {
  id: string
  name: string
  role: UserRole
}

// ❌ Errado
const user: any = getUser()
```

### Nomenclatura
- **Arquivos:** `kebab-case.ts` para utilitários, `PascalCase.tsx` para componentes React.
- **Variáveis/funções:** `camelCase`
- **Constantes globais:** `UPPER_SNAKE_CASE`
- **Tipos/Interfaces:** `PascalCase`
- **Componentes React:** `PascalCase`
- **Hooks:** `useCamelCase`

### Estrutura de Componentes React

Seguir esta ordem dentro de um componente:

```tsx
// 1. Imports externos
// 2. Imports internos
// 3. Tipos / interfaces locais
// 4. Constantes locais
// 5. Componente (function declaration, não arrow function para componentes principais)
// 6. Sub-componentes (se necessário)
// 7. Export default
```

### Commits (Conventional Commits)

```
feat: adicionar cadastro de clientes
fix: corrigir validação de email no login
chore: atualizar dependências
docs: atualizar CLAUDE.md
refactor: reorganizar módulo de autenticação
test: adicionar testes para service de usuários
```

Escopos disponíveis: `auth`, `users`, `clients`, `kanban`, `finance`, `ui`, `api`, `db`

Exemplo: `feat(clients): adicionar filtro por status de contrato`

---

## 🏗️ Arquitetura

### Backend — Estrutura de Pastas (`apps/api/src`)

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.schema.ts
│   │   └── auth.routes.ts
│   ├── users/
│   ├── clients/
│   ├── boards/        # Kanban
│   ├── activities/    # Cards do Kanban
│   └── finance/
├── shared/
│   ├── middleware/
│   ├── plugins/
│   ├── errors/
│   └── utils/
├── lib/
│   └── prisma.ts      # Prisma Client singleton
└── app.ts

prisma/
├── schema.prisma      # Schema do banco
└── migrations/        # Migrations geradas pelo Prisma
```

### Frontend — Estrutura de Pastas (`apps/web/src`)

```
src/
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── dashboard/
│   ├── users/
│   ├── clients/
│   ├── boards/
│   └── finance/
├── components/
│   ├── layout/        # Shell, Sidebar, Header
│   ├── shared/        # Componentes reutilizáveis
│   └── ui/            # Re-exports do @bewave/ui
├── hooks/             # Custom hooks
├── stores/            # Zustand stores
├── services/          # Chamadas de API (axios)
├── lib/               # Utilitários (queryClient, axios instance)
├── routes/            # Configuração de rotas
└── types/             # Tipos locais (importar de @bewave/types quando possível)
```

---

## 🔐 Autenticação

- Usar **JWT** com **access token** (15min) + **refresh token** (7 dias).
- Refresh token armazenado em **httpOnly cookie**.
- Access token armazenado em **memória** (Zustand), nunca no localStorage.
- Rotas protegidas no frontend via `PrivateRoute` wrapper.
- Middleware de autenticação no backend em todas as rotas protegidas.

---

## 🗄️ Banco de Dados

### ORM: Prisma

- Schema definido em `apps/api/prisma/schema.prisma`
- **Nunca** usar `$queryRaw` ou `$executeRaw` — sempre usar os métodos do Prisma Client.
- Rodar `pnpm --filter api db:generate` sempre que alterar o schema.
- Migrations versionadas em `apps/api/prisma/migrations/`.
- IDs sempre como `String @id @default(cuid())`.
- Timestamps sempre em UTC (`DateTime @default(now())`).
- Soft delete com campo `deletedAt DateTime?` nas entidades principais.

### Modelos principais (Prisma)

```prisma
// Entidades:
// User        (id, name, role, phone, email, passwordHash, isActive, createdAt)
// Client      (id, name, address, phone, email, contractMonths, paid, status, createdAt)
// Workspace   (id, name, createdAt)
// WorkspaceMember (workspaceId, userId, role)
// Board       (id, name, workspaceId, createdAt)
// Column      (id, title, position, boardId, createdAt)
// Activity    (id, title, description, priority, category, position, columnId, createdAt)
// ActivityAssignee (activityId, userId)
// FinanceEntry (id, type, amount, description, category, date, createdAt)
```

---

## 🧩 Módulos do Sistema

### 1. Autenticação
- Login com email/senha
- Logout
- Refresh token automático

### 2. Usuários (Admin)
- Listar, criar, editar, desativar usuários
- Campos: nome, cargo, telefone, email, senha (hash)
- Roles: `admin`, `member`

### 3. Clientes
- Listar, criar, editar clientes
- Status: `lead` (possível cliente) | `active` (cliente fechado)
- Campos: nome, endereço, telefone, email, tempo de contrato (meses), mensalidade paga (boolean)
- Filtros: por status, por pagamento

### 4. Quadros (Kanban)
- Múltiplos workspaces
- Cada workspace tem membros (usuários)
- Cada workspace tem múltiplos boards
- Cada board tem colunas (ex: A Fazer, Em Progresso, Concluído)
- Cada coluna tem atividades (cards)
- Atividades: título, descrição, responsáveis, prioridade (`low|medium|high|urgent`), categoria
- Drag & drop de atividades entre colunas (e reordenação)
- Usar `@dnd-kit` para implementar DnD

### 5. Financeiro
- Registrar entradas e saídas
- Campos: tipo (`income|expense`), valor, descrição, categoria, data
- Resumo: total de entradas, saídas e saldo do período

---

## 🎨 Design System

- **Design base:** shadcn/ui + TailwindCSS v4
- **Tema:** Dark mode como padrão, com toggle para light
- **Paleta de cores:**
  - Background: `zinc-950` / `zinc-900`
  - Surface: `zinc-800`
  - Border: `zinc-700`
  - Primary: `indigo-500`
  - Success: `emerald-500`
  - Warning: `amber-500`
  - Danger: `red-500`
- **Tipografia:** `Geist` (display) + `Geist Mono` (código)

---

## ✅ Padrões de API REST

```
GET    /api/v1/users              → Listar usuários
POST   /api/v1/users              → Criar usuário
GET    /api/v1/users/:id          → Buscar usuário
PUT    /api/v1/users/:id          → Atualizar usuário
DELETE /api/v1/users/:id          → Deletar (soft delete)

GET    /api/v1/clients            → Listar clientes
POST   /api/v1/clients            → Criar cliente
...

GET    /api/v1/workspaces                          → Listar workspaces
GET    /api/v1/workspaces/:id/boards               → Boards do workspace
GET    /api/v1/boards/:id/columns                  → Colunas do board
PATCH  /api/v1/activities/:id/move                 → Mover atividade (DnD)

GET    /api/v1/finance/entries    → Listar entradas/saídas
POST   /api/v1/finance/entries    → Registrar entrada/saída
GET    /api/v1/finance/summary    → Resumo financeiro
```

### Formato de Resposta

```typescript
// Sucesso
{ data: T, meta?: PaginationMeta }

// Erro
{ error: { code: string, message: string, details?: unknown } }

// Paginação
{ data: T[], meta: { page: number, limit: number, total: number, totalPages: number } }
```

---

## 🧪 Testes

- **Unitários:** Vitest para services e utilitários
- **Integração:** Vitest + supertest para rotas da API
- **E2E:** Playwright para fluxos críticos (login, criar cliente, mover card)
- Manter cobertura mínima de **70%** nos services
- Rodar `pnpm test` antes de qualquer PR

---

## 🚫 O que NUNCA fazer

- ❌ `any` em TypeScript
- ❌ `console.log` em produção (usar logger do Fastify / `pino`)
- ❌ `$queryRaw` / `$executeRaw` no Prisma — sempre usar os métodos tipados do Prisma Client
- ❌ Armazenar access token em `localStorage`
- ❌ Fazer chamadas de API diretamente nos componentes (sempre usar hooks/services)
- ❌ Mutations de estado diretamente (sempre via Zustand actions ou React Query mutations)
- ❌ Componentes maiores que 200 linhas — dividir em sub-componentes
- ❌ Lógica de negócio no frontend — sempre no backend
- ❌ Variáveis de ambiente hardcoded — sempre via `.env`
- ❌ Instalar deps sem verificar se já existe em outro package do monorepo

---

## 🔧 Comandos Úteis

```bash
# Instalar todas as deps
pnpm install

# Rodar todos os apps em dev
pnpm dev

# Rodar apenas o frontend
pnpm --filter web dev

# Rodar apenas a API
pnpm --filter api dev

# Build de todos os apps
pnpm build

# Rodar todos os testes
pnpm test

# Lint em todo o monorepo
pnpm lint

# Migrations do banco (Prisma)
pnpm --filter api db:migrate      # Aplica migrations em dev
pnpm --filter api db:generate     # Gera novo migration após alterar schema.prisma
pnpm --filter api db:studio       # Prisma Studio (UI do DB)
pnpm --filter api db:seed         # Rodar seeds (se existir)
```

---

## 📋 Checklist antes de abrir PR

- [ ] `pnpm lint` sem erros
- [ ] `pnpm build` funciona
- [ ] `pnpm test` passando
- [ ] Tipos corretos (sem `any`)
- [ ] `.env.example` atualizado se novas variáveis foram adicionadas
- [ ] `pnpm --filter api db:generate` rodado se `schema.prisma` mudou
- [ ] Commits seguem Conventional Commits

---

## 🔁 Fluxo de trabalho por task

**Após concluir CADA task do `tasks-backend.md` ou `tasks-frontend.md`, você DEVE:**

1. Marcar o item com `[x]` no arquivo de tasks correspondente
2. Fazer `git add .`
3. Fazer commit seguindo Conventional Commits

### Formato do commit por task

```
<tipo>(<escopo>): <descrição curta do que foi feito>
```

**Exemplos reais por fase:**

```bash
# Fase 1 — Setup
git commit -m "chore(config): inicializar monorepo com pnpm workspaces e turbo"
git commit -m "chore(db): configurar prisma com schema inicial completo"
git commit -m "chore(api): criar estrutura base do fastify com rota /health"

# Fase 2 — Plugins
git commit -m "feat(api): adicionar plugins cors, jwt e cookie no fastify"
git commit -m "feat(api): criar app-error e error-handler global"

# Fase 3 — Auth
git commit -m "feat(auth): implementar login com jwt e refresh token no redis"
git commit -m "feat(auth): criar middleware de autenticação para rotas protegidas"

# Fase 4 — Usuários
git commit -m "feat(users): implementar crud completo de usuários"
git commit -m "feat(users): adicionar soft delete e filtro por role"

# Fase 5 — Clientes
git commit -m "feat(clients): implementar crud de clientes com filtros"

# Fase 6/7 — Kanban
git commit -m "feat(kanban): criar workspaces, boards e colunas"
git commit -m "feat(kanban): implementar endpoint de movimentação de cards (dnd)"

# Fase 8 — Financeiro
git commit -m "feat(finance): implementar lançamentos e resumo financeiro"

# Frontend
git commit -m "chore(web): configurar vite, tailwind e shadcn/ui"
git commit -m "feat(web): criar layout principal com sidebar e topbar"
git commit -m "feat(auth): implementar tela de login com react-hook-form"
git commit -m "feat(clients): implementar listagem com filtros e badges de status"
git commit -m "feat(kanban): implementar drag and drop com dnd-kit e optimistic update"
```

### Regra importante

> **Nunca acumule múltiplas tasks em um único commit.**  
> Um commit = uma task concluída (ou um conjunto pequeno e coeso da mesma task).  
> Isso mantém o histórico legível e facilita rollback se necessário.

---

*Última atualização: gerado automaticamente na criação do projeto.*