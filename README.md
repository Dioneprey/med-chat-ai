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
- **Kafka**
- **Kong ( API Gateway )**
- **GitHub Actions**
  - Testes unitários (em todo **push**)
  - Testes E2E (em **pull requests**)
- **Deploy automático com Coolify** (CD / Implantação Contínua)

---

## Instalação e execução

## Opção 1: Rodar tudo via Docker

```bash
# 1️⃣ Clonar o repositório
git clone https://github.com/Dioneprey/med-chat-ai.git
# Entrar na pasta do repositório
cd med-chat-ai

# 2️⃣ Copiar variáveis de ambiente
cp api/.env.example api/.env
cp auth/.env.example auth/.env
# Edite o arquivo .env conforme necessário

# 3️⃣ Build e execução de todos os containers
docker compose --profile apis up --build -d
```

## Opção 2: Rodar localmente (Node + PNPM)

```bash
# 1️⃣ Clonar o repositório
git clone https://github.com/Dioneprey/med-chat-ai.git
cd med-chat-ai

# 2️⃣ Copiar variáveis de ambiente
cp api/.env.example api/.env
cp auth/.env.example auth/.env
# Edite os arquivos .env conforme necessário

# 3️⃣ Instalar pnpm (se não tiver)
npm install -g pnpm

# 4️⃣ Subir serviços principais em modo desenvolvimento
docker compose up --build -d
## 🔹 Serviço de autenticação (Auth) - Terminal 1
cd auth
pnpm install           # Instalar dependências
pnpm run db:deploy     # Aplicar migrations e gerar Prisma Client
pnpm run start:dev     # Rodar a API

## 🔹 Serviço de perguntas e respostas (QA) - Terminal 2
cd ../api
pnpm install           # Instalar dependências
pnpm run db:deploy     # Aplicar migrations e gerar Prisma Client
pnpm run start:dev     # Rodar a API
```

# 🌐 URLs

## 📘 API de Perguntas e Respostas (QA)

- Endpoint: [http://localhost:8000/qa/api](http://localhost:8000/qa/api)
- Swagger: [http://localhost:8000/qa/api/docs](http://localhost:8000/qa/api/docs)

---

## 🔑 API de Autenticação (Auth)

- Endpoint: [http://localhost:8000/auth/api](http://localhost:8000/auth/api)
- Swagger: [http://localhost:8000/auth/api/docs](http://localhost:8000/auth/api/docs)

---

## 🔍 Observabilidade

- **Jaeger (Tracing):** [http://localhost:16686](http://localhost:16686)
- **Bull Board (Filas Auth):** [http://localhost:8000/auth/api/queues](http://localhost:8000/auth/api/queues)

## 🔄 Fluxo de uso da API

Para testar a aplicação de forma rápida, siga o fluxo abaixo:

### 1. Criação de conta (AUTH)

**Admin**

- `POST /user/tenant` → Registra uma conta de admin de uma empresa e já autentica.

**Usuário**

- `POST /user` → Registra uma conta de usuário que recebeu convite e já autentica.

---

### 2. Autenticação (AUTH)

- **Login**

  - `POST /auth` → autentica o usuário de teste.
  - Retorna `access_token` e `RefreshToken` (cookies HTTP-only).

- **Renovação de token (opcional)**
  - `POST /auth/refresh` → renova o `access_token` usando o `RefreshToken`.

---

### 3. Usuário logado (AUTH)

- `GET /users/me` → retorna os dados do usuário autenticado.

---

### 4. Chats (QA)

- `GET /chat?pageIndex=1` → lista todos os chats do usuário.
- `GET /chat/:chatId/messages` → lista mensagens de um chat específico.
- `POST /chat/message` → envia uma mensagem para um chat existente ou cria um novo chat.

---

### 5. Convites (AUTH)

- `POST /invitation` → cria um convite.
- `DELETE /invitation` → revoga um convite existente.

---

### 6. Empresas (AUTH)

- `GET /company?name=<empresa>` → busca uma empresa pelo nome.

---

### 7. Dashboard (Admin) (QA)

- `GET /dashboard?from=<YYYY-MM-DD>&to=<YYYY-MM-DD>` → busca dados de dashboard do admin no período especificado.

---

### 8. Healthcheck (QA / AUTH)

- `GET /health` → verifica se a API está rodando.
