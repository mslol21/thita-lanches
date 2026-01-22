# Lanche Fácil - Sistema de Delivery

Sistema de delivery profissional para lanches, com foco em segurança, performance e facilidade de uso.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Vite, React, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend/DB**: Firebase (Firestore, Auth, Google Login).

- **Gerenciamento de Estado/Queries**: TanStack Query (React Query).

## 🛡️ Arquitetura e Segurança

Este projeto passou por uma auditoria técnica e refatoração profissional, implementando as seguintes melhorias:

1. **Cálculo de Preços no Backend**: Toda a lógica de criação de pedidos é processada via RPC (Remote Procedure Call) no PostgreSQL, garantindo que o preço total seja calculado com base nos dados reais do banco, não no frontend.
2. **Atomicidade**: Pedidos e itens de pedidos são inseridos em uma única transação atômica.
3. **Hardening de RLS**: Row Level Security (RLS) configurado para garantir que clientes só acessem seus próprios dados e que apenas administradores possam gerenciar produtos e status de pedidos.
4. **Camada de Serviços**: Lógica de negócio isolada em serviços dedicados, desacoplando o UI da implementação do banco de dados.

## 💻 Como Rodar Localmente

1. **Clone o repositório**
2. **Instale as dependências**
   ```sh
   npm install
   ```
3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` com as credenciais do seu Supabase:
   ```env
   VITE_SUPABASE_URL=seu_url
   VITE_SUPABASE_PUBLISHABLE_KEY=sua_key
   ```
4. **Inicie o servidor de desenvolvimento**
   ```sh
   npm run dev
   ```

## 🛠️ Estrutura de Pastas

- `src/services/`: Lógica de API e comunicação com Supabase.
- `src/hooks/`: Hooks customizados para React Query.
- `src/lib/validators.ts`: Esquemas de validação Zod centralizados.
- `src/lib/utils.ts`: Utilitários de formatação e helpers.
- `supabase/migrations/`: Scripts SQL de migração do banco de dados.
