# 📄 MedChat API - Documentação Técnica

## 🔹 Visão Geral

**MedChat API** foi desenvolvida em **NestJS**, com banco de dados **PostgreSQL** e **Prisma** como ORM.

A aplicação permite que usuários de diferentes empresas (multi-tenant) façam perguntas a uma IA e recebam respostas, garantindo que:

- Cada empresa tenha seus próprios usuários.
- Usuários só visualizem perguntas e respostas da sua própria empresa.
- Administradores tenham acesso a estatísticas de uso da empresa.

Principais funcionalidades:

- **Autenticação e autorização** via JWT + Refresh Token, com roles `Admin` e `User`.
- **Perguntas e respostas com IA**: registro de pergunta, resposta, empresa, usuário e data/hora.
- **Dashboard básico para admins**: quantidade de perguntas por dia, top usuários por atividade.
- **Multi-tenant**: isolamento de dados entre empresas.

---

## 📌 Requisitos do Sistema

- Docker e Docker Compose
- Node.js >= 20 (se for rodar local)
- pnpm >= 10 (se for rodar local)

---

## 📌 Tecnologias utilizadas

- **Nest.js**
- **Clean Architecture**
- **DDD** (Domain-driven design)
- **Princípios SOLID**
- **Redis** (Cache-aside e filas)
- **BullMQ**
- **Prisma ORM**
- **PostgreSQL**
- **Testes unitários**
- **Docker**
- **OpenTelemetry (OTel) com Jaeger**
- **Sentry**
- **GitHub Actions**
  - Testes unitários (em todo **push**)
  - Testes E2E (em **pull requests**)
- **Deploy automático com Coolify** (CD / Implantação Contínua)

---

## Instalação e execução

## Opção 1: Rodar localmente (Node + PNPM)

```bash
# Clonar o repositório
git clone https://github.com/Dioneprey/med-chat-ai.git
# Entrar na pasta do repositório
cd med-chat-api

# Copiar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário

# Instalar pnpm ( se não tiver )
npm install pnpm -g

# Instalar dependências
pnpm install

# Rodar os containers necessários (Postgres, Redis, etc)
docker compose up database redis jaeger -d

# Aplicar as migrations e generate do prisma
pnpm run db:deploy

# Rodar a aplicação em modo desenvolvimento
pnpm run start:dev
```

## Opção 2: Rodar tudo via Docker

```bash
# Clonar o repositório
git clone https://github.com/Dioneprey/med-chat-ai.git
# Entrar na pasta do repositório
cd medchat-api

# Copiar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário

# Build e execução de todos os containers
docker compose up --build -d
```

## URLs

- **API principal:** [http://localhost:3333](http://localhost:3333)
- **Swagger (documentação da API):** [http://localhost:3333/docs](http://localhost:3333/docs)
- **Jaeger (tracing):** [http://localhost:16686](http://localhost:16686)
- **Bull Board (monitoramento das filas):** [http://localhost:3333/api/queues](http://localhost:3333/api/queues)

## 🔄 Fluxo de uso da API

Para testar a aplicação de forma rápida, siga o fluxo abaixo:

### 1. Criação de conta

**Admin**

- `POST /user/tenant` → Registra uma conta de admin de uma empresa e já autentica.

**Usuário**

- `POST /user` → Registra uma conta de usuário que recebeu convite e já autentica.

---

### 2. Autenticação

- **Login**

  - `POST /auth` → autentica o usuário de teste.
  - Retorna `access_token` e `RefreshToken` (cookies HTTP-only).

- **Renovação de token (opcional)**
  - `POST /auth/refresh` → renova o `access_token` usando o `RefreshToken`.

---

### 3. Usuário logado

- `GET /users/me` → retorna os dados do usuário autenticado.

---

### 4. Chats

- `GET /chat?pageIndex=1` → lista todos os chats do usuário.
- `GET /chat/:chatId/messages` → lista mensagens de um chat específico.
- `POST /chat/message` → envia uma mensagem para um chat existente ou cria um novo chat.

---

### 5. Convites

- `POST /invitation` → cria um convite.
- `DELETE /invitation` → revoga um convite existente.

---

### 6. Empresas

- `GET /company?name=<empresa>` → busca uma empresa pelo nome.

---

### 7. Dashboard (Admin)

- `GET /dashboard?from=<YYYY-MM-DD>&to=<YYYY-MM-DD>` → busca dados de dashboard do admin no período especificado.

---

### 8. Healthcheck

- `GET /health` → verifica se a API está rodando.
