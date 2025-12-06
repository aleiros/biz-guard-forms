# Sistema de Gestão de CCB (Cédula de Crédito Bancário)

## Visão Geral

Sistema web para gerenciamento de operações de CCB com controle de acesso por agência (PA) e administradores.

---

## Autenticação

### Cadastro
- **Campos obrigatórios:**
  - Nome completo
  - Email
  - Senha
  - PA (código da agência)

### Login
- Email e senha

### Tipos de Usuários
| Tipo | Descrição |
|------|-----------|
| **admin** | Acesso total a todas operações |
| **user** | Acesso apenas às operações da sua PA |

---

## Estrutura do Banco de Dados

### Tabela: `profiles`
Armazena informações adicionais dos usuários.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Chave primária (auto-gerado) |
| user_id | UUID | Sim | ID do usuário (referência auth) |
| full_name | TEXT | Não | Nome completo |
| pa | TEXT | Não | Código da agência |
| created_at | TIMESTAMP | Sim | Data de criação (auto) |
| updated_at | TIMESTAMP | Sim | Data de atualização (auto) |

### Tabela: `ccb_operations`
Armazena as operações de CCB.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Chave primária (auto-gerado) |
| user_id | UUID | Sim | ID de quem cadastrou |
| numero_ccb | TEXT | Sim | Número da CCB |
| nome | TEXT | Sim | Nome do cliente |
| cpf_cnpj | TEXT | Sim | CPF ou CNPJ do cliente |
| conta_corrente | TEXT | Sim | Número da conta corrente |
| pa | TEXT | Sim | Código da agência |
| produto | TEXT | Sim | Tipo de produto |
| limite | NUMERIC | Sim | Valor do limite em R$ |
| modalidade | ENUM | Sim | Tipo de modalidade |
| status | ENUM | Sim | Status da operação (default: pendente) |
| pendencia | BOOLEAN | Sim | Tem pendência? (default: false) |
| pendente_malote | BOOLEAN | Sim | Pendente no malote? (default: false) |
| pendencia_regularizacao | BOOLEAN | Sim | Regularização pendente? (default: false) |
| created_at | TIMESTAMP | Sim | Data de criação (auto) |
| updated_at | TIMESTAMP | Sim | Data de atualização (auto) |

#### Valores de `modalidade`:
- `capital_giro`
- `financiamento`
- `emprestimo`
- `credito_pessoal`
- `consignado`

#### Valores de `status`:
- `pendente`
- `em_analise`
- `aprovado`
- `rejeitado`
- `cancelado`
- `aberto`
- `liquidado`
- `prejuizo_quitado`
- `transferencia_prejuizo`
- `repactuado`

### Tabela: `user_roles`
Controla os papéis/permissões dos usuários.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | Sim | Chave primária (auto-gerado) |
| user_id | UUID | Sim | ID do usuário |
| role | ENUM | Sim | Papel: `admin` ou `user` |
| created_at | TIMESTAMP | Sim | Data de criação (auto) |

---

## Regras de Permissão (RLS)

### Operações CCB

| Ação | Admin | Usuário (agência) |
|------|-------|-------------------|
| **Visualizar** | Todas as operações | Apenas operações da sua PA |
| **Criar** | ✅ | ✅ (próprias, com seu user_id) |
| **Editar** | Todas as operações | Apenas suas próprias |
| **Excluir** | Todas as operações | Apenas suas próprias |

### Profiles

| Ação | Regra |
|------|-------|
| **Visualizar** | Apenas o próprio perfil |
| **Criar** | Apenas o próprio (via trigger automático) |
| **Editar** | Apenas o próprio perfil |
| **Excluir** | ❌ Não permitido |

### User Roles

| Ação | Regra |
|------|-------|
| **Visualizar** | Apenas o próprio role |
| **Criar/Editar/Excluir** | ❌ Apenas via trigger automático |

---

## Funcionalidades por Tela

### Tela de Login/Cadastro (`/auth`)
- Formulário de login (email + senha)
- Formulário de cadastro (nome, email, senha, PA)
- Redirecionamento automático para dashboard após login

### Dashboard Admin (`/dashboard`)
- **Header:** Nome do usuário, botão de logout
- **Tabs de navegação:**
  - Pendentes
  - Em Análise
  - Aprovados
  - Todos
- **Lista de operações:** Tabela com todas operações
- **Ações:** Editar, Excluir qualquer operação

### Dashboard Agência (`/dashboard`)
- **Header:** Nome do usuário, PA, botão de logout
- **Cards estatísticos (clicáveis para filtrar):**
  - Total de operações
  - Aprovadas
  - Pendentes
  - Com pendência
- **Formulário de cadastro:** Nova operação CCB
- **Lista de operações:** Apenas da sua PA
- **Ações:** Editar/Excluir apenas próprias

### Formulário de Operação CCB
- Número CCB
- Nome do cliente
- CPF/CNPJ
- Conta corrente
- Produto
- Limite (R$)
- Modalidade (select)
- Checkboxes: Pendência, Pendente Malote, Pendência Regularização

### Importação via Excel
- Modal para colar dados do Excel
- Parsing automático das colunas
- Inserção em lote

---

## Triggers Automáticos

### Ao criar usuário (`on_auth_user_created`)
1. Cria registro em `profiles` com dados do cadastro
2. Cria registro em `user_roles`:
   - Se email = `alexander@gmail.com` → role = `admin`
   - Caso contrário → role = `user`

### Ao atualizar operação
- Atualiza automaticamente o campo `updated_at`

---

## Tecnologias (Projeto Original React)

- **Frontend:** React, TypeScript, Vite
- **Estilização:** Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Validação:** Zod, React Hook Form
- **Estado:** TanStack Query

---

## Conversão para HTML/CSS/JS

Para recriar em HTML/CSS/JS puro, você precisará:

1. **Backend alternativo:**
   - Firebase, ou
   - Supabase com API REST, ou
   - Backend próprio (Node.js, PHP, etc.)

2. **Autenticação:**
   - Firebase Auth, ou
   - JWT com seu backend

3. **Estrutura de arquivos sugerida:**
   ```
   /
   ├── index.html          (página de login)
   ├── dashboard.html      (página principal)
   ├── css/
   │   └── styles.css      (estilos)
   ├── js/
   │   ├── auth.js         (autenticação)
   │   ├── api.js          (chamadas API)
   │   ├── dashboard.js    (lógica do dashboard)
   │   └── utils.js        (funções auxiliares)
   └── assets/
       └── (imagens, ícones)
   ```

4. **Bibliotecas sugeridas:**
   - Fetch API (requisições HTTP)
   - LocalStorage (tokens de sessão)
   - DOMPurify (sanitização de HTML)
