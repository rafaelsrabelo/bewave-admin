# API.md — Documentação dos Endpoints

> Base URL: `http://localhost:3001/api/v1`  
> Todas as rotas (exceto `/auth/login`) exigem header `Authorization: Bearer <access_token>`

---

## Autenticação

### POST `/auth/login`
Login com email e senha.

**Body**
```json
{ "email": "admin@bewave.com", "password": "senha123" }
```

**Response `200`**
```json
{ "data": { "accessToken": "eyJ..." } }
```
> Também seta cookie `httpOnly`: `refreshToken`

**Erros**
- `401` → `INVALID_CREDENTIALS`

---

### POST `/auth/refresh`
Gera novo access token usando o refresh token do cookie.

**Cookie** `refreshToken` (httpOnly, enviado automaticamente)

**Response `200`**
```json
{ "data": { "accessToken": "eyJ..." } }
```

**Erros**
- `401` → `INVALID_REFRESH_TOKEN`

---

### POST `/auth/logout`
Invalida o refresh token no Redis.

**Response `204`** — sem body

---

## Usuários

### GET `/users`
Lista usuários com paginação.

**Query params**
| Param | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | number | 1 | Página atual |
| `limit` | number | 20 | Itens por página |
| `role` | string | — | Filtrar por `admin` ou `member` |
| `isActive` | boolean | — | Filtrar por status ativo |

**Response `200`**
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "João Silva",
      "role": "member",
      "phone": "85999999999",
      "email": "joao@bewave.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

---

### GET `/users/:id`
Busca um usuário pelo ID.

**Response `200`** → objeto `User`

**Erros**
- `404` → `USER_NOT_FOUND`

---

### POST `/users`
Cria um novo usuário. Apenas `admin` pode executar.

**Body**
```json
{
  "name": "Maria Costa",
  "role": "member",
  "phone": "85988888888",
  "email": "maria@bewave.com",
  "password": "senhaSegura123"
}
```

**Response `201`** → objeto `User` criado

**Erros**
- `409` → `EMAIL_ALREADY_EXISTS`
- `403` → `FORBIDDEN` (não é admin)

---

### PUT `/users/:id`
Atualiza dados de um usuário.

**Body** — todos os campos são opcionais
```json
{
  "name": "Maria Costa Silva",
  "phone": "85977777777",
  "role": "admin"
}
```

**Response `200`** → objeto `User` atualizado

---

### DELETE `/users/:id`
Desativa um usuário (soft disable — `isActive: false`).

**Response `204`** — sem body

---

## Clientes

### GET `/clients`
Lista clientes com paginação e filtros.

**Query params**
| Param | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | number | 1 | |
| `limit` | number | 20 | |
| `status` | string | — | `lead` ou `active` |
| `paid` | boolean | — | Filtrar por mensalidade paga |

**Response `200`**
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Empresa ABC",
      "address": "Rua X, 100",
      "phone": "8532323232",
      "email": "contato@abc.com",
      "contractMonths": 12,
      "paid": true,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
}
```

---

### GET `/clients/:id`
**Response `200`** → objeto `Client`

**Erros**
- `404` → `CLIENT_NOT_FOUND`

---

### POST `/clients`
**Body**
```json
{
  "name": "Empresa XYZ",
  "address": "Av. Principal, 500",
  "phone": "8533334444",
  "email": "contato@xyz.com",
  "contractMonths": 6,
  "paid": false,
  "status": "lead"
}
```

**Response `201`** → objeto `Client` criado

---

### PUT `/clients/:id`
**Body** — campos opcionais

**Response `200`** → objeto `Client` atualizado

---

### DELETE `/clients/:id`
Soft delete — seta `deletedAt`.

**Response `204`** — sem body

---

## Workspaces

### GET `/workspaces`
Lista workspaces do usuário autenticado.

**Response `200`**
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Marketing",
      "members": [
        { "id": "clx...", "name": "João", "role": "admin" }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/workspaces`
**Body**
```json
{ "name": "Desenvolvimento" }
```

**Response `201`** → objeto `Workspace` criado

---

### POST `/workspaces/:id/members`
Adiciona membro ao workspace.

**Body**
```json
{ "userId": "clx...", "role": "member" }
```

**Response `201`** → membro adicionado

---

### DELETE `/workspaces/:id/members/:userId`
Remove membro do workspace.

**Response `204`**

---

## Boards

### GET `/workspaces/:workspaceId/boards`
Lista boards de um workspace.

**Response `200`**
```json
{
  "data": [
    { "id": "clx...", "name": "Sprint 1", "workspaceId": "clx...", "createdAt": "..." }
  ]
}
```

---

### POST `/workspaces/:workspaceId/boards`
**Body**
```json
{ "name": "Sprint 2" }
```

**Response `201`** → objeto `Board` criado

---

### GET `/boards/:id`
Retorna board completo com colunas, atividades e responsáveis.

**Response `200`**
```json
{
  "data": {
    "id": "clx...",
    "name": "Sprint 1",
    "columns": [
      {
        "id": "clx...",
        "title": "A Fazer",
        "position": 0,
        "activities": [
          {
            "id": "clx...",
            "title": "Criar tela de login",
            "description": "...",
            "priority": "high",
            "category": "Frontend",
            "position": 0,
            "assignees": [
              { "id": "clx...", "name": "João" }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## Colunas

### POST `/boards/:boardId/columns`
**Body**
```json
{ "title": "Em Revisão", "position": 2 }
```

**Response `201`** → objeto `Column` criado

---

### PUT `/columns/:id`
Atualiza título ou posição da coluna.

**Body**
```json
{ "title": "Revisão", "position": 1 }
```

**Response `200`** → objeto `Column` atualizado

---

### DELETE `/columns/:id`
Deleta coluna e todas as suas atividades.

**Response `204`**

---

## Atividades (Cards Kanban)

### POST `/activities`
**Body**
```json
{
  "columnId": "clx...",
  "title": "Implementar autenticação",
  "description": "JWT com refresh token",
  "priority": "high",
  "category": "Backend",
  "assigneeIds": ["clx...", "clx..."]
}
```

**Response `201`** → objeto `Activity` criado

---

### PUT `/activities/:id`
**Body** — campos opcionais
```json
{
  "title": "Implementar auth JWT",
  "priority": "urgent",
  "category": "Backend"
}
```

**Response `200`** → objeto `Activity` atualizado

---

### PATCH `/activities/:id/move`
Move um card para outra coluna e/ou posição. Usado pelo DnD.

**Body**
```json
{ "columnId": "clx...", "position": 1 }
```

**Response `200`** → objeto `Activity` com nova posição

---

### POST `/activities/:id/assignees`
Adiciona responsável à atividade.

**Body**
```json
{ "userId": "clx..." }
```

**Response `201`**

---

### DELETE `/activities/:id/assignees/:userId`
Remove responsável da atividade.

**Response `204`**

---

### DELETE `/activities/:id`
Soft delete.

**Response `204`**

---

## Financeiro

### GET `/finance/entries`
Lista lançamentos com paginação.

**Query params**
| Param | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | number | 1 | |
| `limit` | number | 20 | |
| `type` | string | — | `income` ou `expense` |
| `category` | string | — | Filtrar por categoria |
| `dateFrom` | string | — | Data inicial `YYYY-MM-DD` |
| `dateTo` | string | — | Data final `YYYY-MM-DD` |

**Response `200`**
```json
{
  "data": [
    {
      "id": "clx...",
      "type": "income",
      "amount": 150000,
      "description": "Mensalidade cliente ABC",
      "category": "Mensalidade",
      "date": "2024-06-01",
      "createdAt": "2024-06-01T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

> `amount` é em **centavos**. R$ 1.500,00 = `150000`

---

### POST `/finance/entries`
**Body**
```json
{
  "type": "expense",
  "amount": 50000,
  "description": "Servidor AWS",
  "category": "Infraestrutura",
  "date": "2024-06-05"
}
```

**Response `201`** → objeto `FinanceEntry` criado

---

### DELETE `/finance/entries/:id`
**Response `204`**

---

### GET `/finance/summary`
Retorna totais do período.

**Query params**
| Param | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `dateFrom` | string | sim | `YYYY-MM-DD` |
| `dateTo` | string | sim | `YYYY-MM-DD` |

**Response `200`**
```json
{
  "data": {
    "totalIncome": 450000,
    "totalExpense": 120000,
    "balance": 330000,
    "period": { "from": "2024-06-01", "to": "2024-06-30" }
  }
}
```

> Todos os valores em **centavos**.

---

## Formato padrão de erros

```json
{
  "error": {
    "code": "CLIENT_NOT_FOUND",
    "message": "Cliente não encontrado",
    "statusCode": 404
  }
}
```

### Códigos de erro comuns

| Code | Status | Descrição |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Email ou senha incorretos |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token inválido ou expirado |
| `UNAUTHORIZED` | 401 | Token ausente ou expirado |
| `FORBIDDEN` | 403 | Sem permissão para executar a ação |
| `USER_NOT_FOUND` | 404 | Usuário não encontrado |
| `CLIENT_NOT_FOUND` | 404 | Cliente não encontrado |
| `EMAIL_ALREADY_EXISTS` | 409 | Email já cadastrado |
| `VALIDATION_ERROR` | 400 | Dados inválidos (detalhes no campo `details`) |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |