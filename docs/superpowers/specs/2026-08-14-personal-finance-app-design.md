# Especificação de Design: App de Finanças Pessoais Fullstack

- **Data:** 2026-08-14
- **Status:** Aprovado em Brainstorming
- **Stack:** Next.js (App Router, TypeScript), Supabase (PostgreSQL, Auth, RLS), TailwindCSS, Recharts, Lucide Icons

---

## 1. Visão Geral do Produto

O sistema é uma aplicação web moderna, responsiva e segura de controle financeiro pessoal, projetada para proporcionar controle completo de receitas, despesas, transferências, cartões de crédito, metas orçamentárias e importação de extratos bancários com conciliação.

---

## 2. Arquitetura do Sistema

### 2.1 Frontend & Camada de Apresentação
- **Framework:** Next.js 15+ (App Router) com React Server Components (RSC) para renderização eficiente e Client Components para telas interativas (modais, formulários, gráficos).
- **Tipagem:** TypeScript estrito com tipos do banco gerados automaticamente a partir do schema do Supabase.
- **Design System & UI:** TailwindCSS, componentes acessíveis (Radix UI / Headless UI), suporte a temas Claro/Escuro e ícones via Lucide Icons.
- **Visualização de Dados:** Recharts para gráficos interativos de fluxo de caixa, distribuição por categorias e evolução de saldo.

### 2.2 Backend & Camada de Dados
- **Banco de Dados:** PostgreSQL hospedado no Supabase.
- **Autenticação:** Supabase Auth com suporte a E-mail/Senha e Google OAuth, utilizando cookies seguros para persistência de sessão compatível com SSR.
- **Segurança (RLS):** Row-Level Security ativado em 100% das tabelas para garantir isolamento multi-tenant intransponível (`auth.uid() = user_id`).
- **Server Actions:** Manipulação de dados e mutações seguras no servidor com validação via Zod.

---

## 3. Modelo de Dados (PostgreSQL Schema)

### 3.1 `profiles`
- `id` (UUID, PK, FK `auth.users.id` ON DELETE CASCADE)
- `currency` (TEXT, DEFAULT 'BRL')
- `created_at` (TIMESTAMPTZ, DEFAULT now())

### 3.2 `accounts` (Contas Bancárias e Carteiras)
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `user_id` (UUID, FK `profiles.id` ON DELETE CASCADE)
- `name` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL: `'checking' | 'wallet' | 'investment' | 'savings'`)
- `initial_balance` (NUMERIC(14,2), DEFAULT 0.00)
- `current_balance` (NUMERIC(14,2), DEFAULT 0.00)
- `color` (TEXT)
- `icon` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT now())

### 3.3 `credit_cards` (Cartões de Crédito)
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `user_id` (UUID, FK `profiles.id` ON DELETE CASCADE)
- `name` (TEXT, NOT NULL)
- `limit_amount` (NUMERIC(14,2), NOT NULL)
- `closing_day` (INT, NOT NULL) -- Dia de fechamento da fatura
- `due_day` (INT, NOT NULL) -- Dia de vencimento da fatura
- `color` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT now())

### 3.4 `categories` (Categorias de Transações)
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `user_id` (UUID, FK `profiles.id` ON DELETE CASCADE, NULLABLE para categorias padrão globais)
- `name` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL: `'income' | 'expense'`)
- `icon` (TEXT)
- `color` (TEXT)
- `parent_id` (UUID, FK `categories.id` ON DELETE SET NULL, NULLABLE)
- `created_at` (TIMESTAMPTZ, DEFAULT now())

### 3.5 `transactions` (Lançamentos)
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `user_id` (UUID, FK `profiles.id` ON DELETE CASCADE)
- `account_id` (UUID, FK `accounts.id` ON DELETE SET NULL, NULLABLE)
- `credit_card_id` (UUID, FK `credit_cards.id` ON DELETE SET NULL, NULLABLE)
- `category_id` (UUID, FK `categories.id` ON DELETE SET NULL, NULLABLE)
- `type` (TEXT, NOT NULL: `'income' | 'expense' | 'transfer'`)
- `amount` (NUMERIC(14,2), NOT NULL)
- `date` (DATE, NOT NULL)
- `description` (TEXT, NOT NULL)
- `paid` (BOOLEAN, DEFAULT true)
- `destination_account_id` (UUID, FK `accounts.id` ON DELETE SET NULL, NULLABLE) -- Para transferências
- `installment_group_id` (UUID, NULLABLE) -- Agrupador de compras parceladas
- `current_installment` (INT, NULLABLE)
- `total_installments` (INT, NULLABLE)
- `recurring_rule_id` (UUID, NULLABLE)
- `created_at` (TIMESTAMPTZ, DEFAULT now())

### 3.6 `budgets` (Orçamentos e Metas)
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `user_id` (UUID, FK `profiles.id` ON DELETE CASCADE)
- `category_id` (UUID, FK `categories.id` ON DELETE CASCADE)
- `month_year` (TEXT, NOT NULL) -- Formato 'YYYY-MM'
- `planned_amount` (NUMERIC(14,2), NOT NULL)
- `created_at` (TIMESTAMPTZ, DEFAULT now())
- UNIQUE(`user_id`, `category_id`, `month_year`)

---

## 4. Regras de Negócio e Funcionalidades

### 4.1 Faturas de Cartão de Crédito
- A data de corte (`closing_day`) calcula automaticamente a qual fatura uma compra percente:
  - Se `date.day <= closing_day` $\rightarrow$ Fatura do mês corrente.
  - Se `date.day > closing_day` $\rightarrow$ Fatura do mês subsequente.
- Pagamento de fatura: gera uma transação de transferência da conta bancária liquidando o saldo devedor do cartão.

### 4.2 Parcelamento Inteligente
- Ao lançar despesa parcelada (ex: $N$ parcelas de $R\$ X$), o sistema gera $N$ registros com o mesmo `installment_group_id`, incrementando a data mensalmente e atribuindo à respectiva fatura ou mês.

### 4.3 Importação OFX / CSV
- **Parser OFX/CSV:** Extrai data, descrição (`MEMO`/`CHECKNUM`) e valor.
- **Deduplicação:** Gera um hash de checagem (`date + amount + description`) para alertar itens já existentes no banco.
- **Mapeamento de Categoria:** Sugere automaticamente categorias com base no histórico de descrições similares.

---

## 5. Estrutura de Telas e Navegação

1. `/dashboard`: Resumo do mês, cards de saldos e faturas, gráficos de receitas vs despesas e distribuição por categoria.
2. `/transactions`: Extrato completo com busca, múltiplos filtros e ações em lote.
3. `/accounts`: Gestão de contas bancárias e cartões de crédito.
4. `/budgets`: Painel de metas orçamentárias com barras de progresso de consumo em tempo real.
5. `/import`: Assistente de importação e conciliação de arquivos bancários.
6. `/settings`: Preferências de moeda, categorias personalizadas e exportação de dados.

---

## 6. Estratégia de Testes e Validação
- **Testes Unitários:** Validação de regras de cálculo de faturas, parcelamentos e parser de OFX/CSV.
- **Testes de Integração:** Server Actions com Supabase mock / local e testes de isolamento de RLS.
- **Testes E2E:** Fluxo principal de login, lançamento de transação e atualização do dashboard.
