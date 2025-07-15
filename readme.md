# 📦 Projeto Chatbot Dashboard

## 🗂️ Sobre o Projeto

O sistema permite que clientes realizem **agendamentos de coletas** via um **chatbot integrado ao WhatsApp**, enquanto administradores monitoram os dados através de um **dashboard web**.

- **Chatbot**: Localizado em `chatbot_integrado`, desenvolvido com **RASA** e **Flask**.
- **Backend**: Em `node`, feito com **Node.js** e **PostgreSQL**.
- **Frontend**: Em `front`, feito com **React.js** para exibição dos dados administrativos.

---

## ✅ Índice

1. [Introdução](#introdução)
2. [Guia de Instalação e Execução](#guia-de-instalação-e-execução)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Documentação da API (Node.js)](#documentação-da-api-nodejs)
5. [Banco de Dados](#banco-de-dados)
6. [Chatbot (RASA + Flask)](#chatbot-rasa--flask)
7. [Frontend (React.js)](#frontend-reactjs)
8. [Autenticação](#autenticação)
9. [Tecnologias Utilizadas](#tecnologias-utilizadas)

---

## Introdução

O sistema automatiza o agendamento de coletas de materiais via WhatsApp, proporcionando aos clientes uma experiência rápida e intuitiva. Já o dashboard web oferece ferramentas de gestão, visualização de dados e relatórios para administradores.

---

## Guia de Instalação e Execução

### Pré-requisitos

- **Node.js** (v16+)
- **Python** (>=3.8)
- **PostgreSQL**
- **RASA** (via pip ou poetry)
- **Yarn** ou **npm**
- **Docker** (opcional)

### 1. Banco de Dados

- Crie um banco PostgreSQL e configure as variáveis de ambiente em `.env` na pasta `node`.

### 2. Backend (Node.js)

```bash
cd node
cp .env.example .env # Edite com as credenciais do banco e JWT_SECRET
npm install
npx prisma generate
npm start
```

**Principais comandos:**
- `npm start`: inicia em modo desenvolvimento.
- `npx prisma migrate dev`: executa as migrações.

### 3. Chatbot (RASA + Flask)

```bash
# Flask - API intermediária
cd flask
pip install -r requirements.txt
python app.py

# RASA (chatbot)
cd ../chatbot_integrado/chatbot
pip install -r requirements.txt
rasa train
rasa run --enable-api --cors "*"
# Para ações customizadas
rasa run actions
```

### 4. Frontend (React.js)

```bash
cd front
cp .env.example .env # Edite a URL da API backend
npm install
npm run dev
```

Acesse em [http://localhost:5173](http://localhost:5173)

---

## Arquitetura do Sistema

### Fluxo Geral

```
[Cliente WhatsApp]
      │
      ▼
[Webhook Flask] <──► [RASA]
      │                 │
      ▼                 ▼
[Backend Node.js] ◄─────┘
      │
      ▼
[PostgreSQL]
      │
      ▼
[Dashboard React.js]
```

- **Chatbot**: Recebe mensagens via WhatsApp API → Flask → RASA → Consome API Node.js para dados → Responde ao usuário.
- **Dashboard**: React.js consome a API Node.js para exibir e manipular dados administrativos.

---

## Documentação da API (Node.js)

### Principais Endpoints

#### Autenticação Administrador

- **POST** `/admin/login`
  - **Body**:
    ```json
    { "email": "admin@exemplo.com", "senha": "123456" }
    ```
  - **Resposta**:
    - 200: `{ "message": "Login bem-sucedido", "token": "JWT..." }`
    - 401: `{ "error": "Email ou senha inválidos" }`

- **POST** `/admin/register`
  - Cadastro de novo admin. **Token JWT** requerido.
  - **Body**:
    ```json
    { "nome": "Nome", "email": "email@exemplo.com", "senha": "abc123" }
    ```
  - **Resposta**:
    - 201: `{ "message": "Administrador registrado com sucesso", "token": "..." }`
    - 400: `{ "error": "Email já está em uso." }`

#### Clientes

- **POST** `/clientes`
  - Cria novo cliente.
  - **Body**:
    ```json
    {
      "nome_cliente": "João",
      "telefone_cliente": "11999999999",
      "tipo": "residencial",
      "id_zona": 1,
      "endereco": {
        "nome_rua": "Rua Exemplo",
        "numero": "123",
        "bairro": "Centro"
      }
    }
    ```
  - **Resposta**:
    - 201: `{ ...cliente }`
    - 400/409/500: `{ "error": "..." }`

- **GET** `/clientes`  
  Lista todos os clientes.

#### Agendamentos

- **POST** `/agendamentos`
  - Cria novo agendamento (via dashboard).
- **POST** `/agendamentos/telefone`
  - Cria agendamento via telefone (usado pelo chatbot).
- **GET** `/agendamentos`
  - Lista todos os agendamentos.
- **PUT** `/agendamentos/registro`
  - Marca um agendamento como realizado.
- **DELETE** `/agendamentos/telefone/:telefone_cliente`
  - Remove agendamento pendente de um cliente.

#### Coletas

- **POST** `/coletas`
- **GET** `/coletas`
- **GET** `/coletas/:id`

#### Relatórios

- **GET** `/relatorios/agendamentos-cancelados`
- **GET** `/relatorios/coletas-por-cliente`
- **GET** `/relatorios/coletas-previstas`

#### Usuários

- **POST** `/usuarios/login`
- **POST** `/usuarios/register`
- **GET** `/usuarios`
- **PUT** `/usuarios/:id`
- **DELETE** `/usuarios/:id`

#### Zonas

- **GET** `/zonas`
- **POST** `/zonas`
- **GET** `/zonas/:id`

### Observações

- **Autenticação**: Endpoints de administração exigem JWT (Bearer Token).
- **Status HTTP**: 200, 201 (sucesso), 400/401/403/404/409/500 (erros).

---

## 🔗 Endpoints Externos para Integração (Chatbot/WhatsApp)

Esta seção detalha os endpoints públicos da API utilizados principalmente por integrações externas, como o chatbot RASA no WhatsApp. Os endpoints permitem operações de agendamento, consulta e atualização de dados relacionados a clientes e coletas, geralmente sem autenticação JWT, pois são usados por sistemas automatizados.

---

### 1. Criar Agendamento por Telefone

**Endpoint:** `POST /agendamentos/telefone`

**Descrição:** Cria um novo agendamento para um cliente identificado pelo telefone.

**Payload de entrada:**
```json
{
  "telefone_cliente": "11999999999",
  "dia_agendado": "2025-07-05",        // Aceita formatos "YYYY-MM-DD" ou "DD/MM/YYYY"
  "turno_agendado": "manhã",
  "id_usuario": 1,                     // ID do usuário responsável
  "observacoes": "Via chatbot"         // (opcional)
}
```

**Resposta de sucesso (201):**
```json
{
  "id_agendamento": 12,
  "dia_agendado": "2025-07-05T00:00:00.000Z",
  "turno_agendado": "manhã",
  "cliente": { ... },
  "zona": { ... },
  // outros campos relevantes
}
```

**Códigos de status:**
- 201: Agendamento criado
- 400: Dados inválidos ou data no passado
- 404: Cliente não encontrado

---

### 2. Atualizar Agendamento por Telefone

**Endpoint:** `PUT /agendamentos/telefone/:telefone_cliente`

**Descrição:** Atualiza o agendamento (geralmente o mais recente) de um cliente identificado pelo telefone.

**Payload de entrada:**
```json
{
  "dia_agendado": "2025-07-10",
  "turno_agendado": "tarde",
  "observacoes": "Remarcado via chatbot"
}
```

**Resposta de sucesso (200):**
```json
{
  "id_agendamento": 12,
  "dia_agendado": "2025-07-10T00:00:00.000Z",
  "turno_agendado": "tarde",
  "cliente": { ... },
  "zona": { ... }
}
```

**Códigos de status:**
- 200: Atualizado com sucesso
- 404: Cliente ou agendamento não encontrado

---

### 3. Cancelar Agendamento por Telefone

**Endpoint:** `DELETE /agendamentos/telefone/:telefone_cliente`

**Descrição:** Cancela o agendamento pendente de um cliente identificado pelo telefone.

**Exemplo de chamada:**  
`DELETE /agendamentos/telefone/11999999999`

**Resposta de sucesso (200):**
```json
{ "message": "Agendamento cancelado com sucesso" }
```

**Códigos de status:**
- 200: Cancelado com sucesso
- 404: Cliente ou agendamento pendente não encontrado

---

### 4. Registrar Coleta Realizada (via QR Code)

**Endpoint:** `PUT /agendamentos/registro`

**Descrição:** Marca um agendamento como realizado, ou cria um se não existir, usando QR code do cliente.

**Payload de entrada:**
```json
{
  "qr_code": "QR12345AB",
  "dia_realizado": "2025-07-05",
  "hora_realizado": "09:00",      // (opcional)
  "id_usuario": 1,                // Id deve ser de um coletor registrado no sistema previamente
  "turno_agendado": "manhã"       // (opcional)
}
```

**Resposta de sucesso (200):**
```json
{
  "id_agendamento": 12,
  "status": "REALIZADO",
  "dia_realizado": "2025-07-05T00:00:00.000Z",
  "cliente": { "nome_cliente": "João" },
  "zona": { ... },
  "usuario": { "nome": "Fulano" }
}
```

**Códigos de status:**
- 200: Coleta registrada
- 404: Cliente não encontrado

---

### 5. Consultar Cliente por Telefone

**Endpoint:** `GET /clientes/consulta-cliente-telefone/:telefone`

**Descrição:** Consulta cliente e retorna se possui agendamento pendente.

**Exemplo de chamada:**  
`GET /clientes/consulta-cliente-telefone/11999999999`

**Resposta de sucesso (200):**
```json
{
  "nome_cliente": "João",
  "id_cliente": 2,
  "tem_agendamento": true,
  "agendamentos": [
    { "dia_agendado": "05/07/2025", "turno_agendado": "manhã" }
  ]
}
```

**Códigos de status:**
- 200: Cliente encontrado
- 404: Cliente não encontrado

---

## Observações

- Todos os endpoints acima retornam erros no formato:
  ```json
  { "error": "mensagem do erro" }
  ```
- Datas aceitas tanto no formato ISO (`YYYY-MM-DD`) quanto brasileiro (`DD/MM/YYYY`).
- Usados principalmente por sistemas externos (chatbot) para automação de processos.

---

## Banco de Dados

- **Banco**: PostgreSQL
- **ORM**: Prisma

### Principais Tabelas

- `admin`: Administradores do sistema
- `usuario`: Usuários internos (operadores das coletas)
- `cliente`: Clientes finais
- `endereco`: Endereços dos clientes
- `zona`: Áreas de atuação/coleta
- `agendamento`: Registros de agendamentos
- `coleta`: Coletas realizadas

**Relacionamentos**:

- `cliente` → `endereco` (1:1)
- `endereco` → `zona` (N:1)
- `agendamento` → `cliente` (N:1) e `zona` (N:1)
- `coleta` → `cliente` (N:1) e `usuario` (N:1)

> **Dica:** Consulte o arquivo `node/prisma/schema.prisma` (se houver) para detalhes.

---

## Chatbot (RASA + Flask)

### Organização

- **RASA**: responsável por processar intenções, slots e entidades.
- **Flask**: atua como webhook, conectando WhatsApp API ao RASA.

#### Principais Intents (Exemplos)

- Agendar coleta
- Remarcar coleta
- Cancelar coleta
- Consultar status de coleta

#### Integração

- O webhook Flask recebe mensagens do WhatsApp, encaminha para o RASA, que processa a intenção.
- Ações customizadas do RASA (`actions.py`) fazem requisições HTTP para o backend Node.js para criar, cancelar ou consultar agendamentos.
- O fluxo é assíncrono: cliente → WhatsApp → Flask → RASA → Node.js → PostgreSQL → resposta

#### Exemplo de Fluxo

1. Cliente envia "Quero agendar uma coleta" no WhatsApp.
2. Flask recebe e encaminha ao RASA.
3. RASA detecta a intenção e, se necessário, aciona action customizada para criar agendamento via API Node.js.
4. Node.js grava no banco e retorna resposta.
5. RASA/formatação devolve mensagem ao cliente via Flask.

---

## Frontend (React.js)

### Principais Páginas

- **Login**: Autenticação de administradores.
- **Dashboard**: Resumo de coletas (realizadas, previstas, canceladas, totais).
- **Clientes**: Listagem, cadastro e edição de clientes.
- **Agendamentos**: Gestão de agendamentos.
- **Usuários**: Gestão de usuários internos.
- **Zonas**: Cadastro e edição de zonas de coleta.
- **Admins**: Gestão de administradores.

### Consumo da API

- Todas as páginas administrativas consomem a API Node.js via fetch/axios, utilizando JWT nos headers.
- A navegação é protegida por middlewares/PrivateRoute.

---

## Autenticação

- **Administradores**: Login via `/admin/login`, recebendo JWT para acessar rotas protegidas.
- **Usuários internos**: Login via `/usuarios/login`.
- **Proteção de Rotas**:
  - Backend: middlewares verificam JWT (exemplo: `authMiddleware.js`).
  - Frontend: componente `PrivateRoute` verifica token no localStorage.

---

## Tecnologias Utilizadas

### Chatbot

- **RASA**
- **Flask**
- **Python**
- **Requests**

### Backend

- **Node.js**
- **Express**
- **Prisma**
- **PostgreSQL**
- **bcrypt, jsonwebtoken**

### Frontend

- **React.js**
- **Vite**
- **Ant Design / Tailwind CSS**
- **React Router**

---

## Observações Finais

- Recomendado uso de variáveis de ambiente (`.env`) para segredos e configurações.
- Para ambiente de produção, configure SSL e variáveis de ambiente adequadamente.
- Consulte cada diretório para instruções específicas e exemplos de configuração.

---