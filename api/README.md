# 📄 MedChat API - Documentação Técnica

## 🔹 Visão Geral

A **MedChat API** foi desenvolvida em **NestJS**, com banco de dados **PostgreSQL** e **Prisma** como ORM.

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

- Nest.js
- Clean Architecture
- DDD ( Domain-driven design )
- Princípios SOLID
- Redis ( Cache-aside e filas )
- BullMQ
- Prisma ORM
- PostgreSQL
- Testes unitários
- Docker
- Otel com Jaeger
- Sentry
- Github Actions - Testes unitários

---

## Instalação e execução

## Opção 1: Rodar localmente (Node + PNPM)

```bash
# Clonar o repositório
git clone https://github.com/Dioneprey/med-chat-ai.git
# Entrar na pasta do repositório
cd medchat-api

# Copiar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário

# Instalar dependências
pnpm install

# Rodar os containers necessários (Postgres, Redis, etc)
docker compose up -d database

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

# Build e execução de todos os containers (Postgres + API)
docker compose up --build -d
```

## URLs

- **API principal:** [http://localhost:3333](http://localhost:3333)
- **Swagger (documentação da API):** [http://localhost:3333/docs](http://localhost:3333/docs)
- **Jaeger (tracing):** [http://localhost:16686](http://localhost:16686)
- **Bull Board (monitoramento das filas):** [http://localhost:3333/api/queues](http://localhost:3333/api/queues)
