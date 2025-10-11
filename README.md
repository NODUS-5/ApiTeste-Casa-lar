# API Teste - Casa Lar

Esta é uma API de teste para o Projeto Casa Lar, desenvolvida em Node.js com Express. A API fornece funcionalidades de CRUD (Create, Read, Update, Delete) para diferentes entidades do sistema, incluindo autenticação básica.

## 📋 Índice

- [Características](#características)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação](#instalação)
- [Uso](#uso)
- [Endpoints da API](#endpoints-da-api)
  - [Autenticação](#autenticação)
  - [Acolhidos](#acolhidos)
  - [Registro Escolar](#registro-escolar)
  - [Apadrinhamentos](#apadrinhamentos)
  - [Voluntários](#voluntários)
  - [Funcionários](#funcionários)
  - [Agenda](#agenda)
- [Estrutura dos Dados](#estrutura-dos-dados)
- [Exemplos de Uso](#exemplos-de-uso)
- [Contribuição](#contribuição)

## ✨ Características

- 🔐 Sistema de autenticação básico com tokens
- 👥 Gerenciamento de acolhidos
- 📚 Controle de registros escolares
- 🤝 Sistema de apadrinhamentos
- 🙋‍♀️ Gestão de voluntários
- 👔 Administração de funcionários
- 📅 Sistema de agenda
- 📁 Upload de arquivos (assinaturas e documentos)
- 🌐 CORS habilitado
- 📊 Resposta paginada para listagens

## 🛠 Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **Express.js** - Framework web para Node.js
- **Multer** - Middleware para upload de arquivos
- **CORS** - Middleware para Cross-Origin Resource Sharing

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/NODUS-5/ApiTeste-Casa-lar.git
cd ApiTeste-Casa-lar
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor:
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 💻 Uso

A API estará disponível em `http://localhost:3000/api`

### URL Base
```
http://localhost:3000/api
```

## 📚 Endpoints da API

### 🔐 Autenticação

#### GET `/api`
Verifica se a API está funcionando.

**Resposta:**
```json
{
  "ok": true
}
```

#### POST `/api/auth/login`
Realiza login no sistema.

**Body:**
```json
{
  "email": "demo@casalar.org",
  "password": "qualquer_senha"
}
```

**Resposta:**
```json
{
  "user": {
    "id": 1,
    "name": "Usuário Demo",
    "email": "demo@casalar.org",
    "role": "admin"
  },
  "tokens": {
    "accessToken": "fake_access_token",
    "refreshToken": "fake_refresh_token",
    "expiresAt": 1234567890123
  }
}
```

#### POST `/api/auth/logout`
Realiza logout do sistema.

#### GET `/api/auth/me`
Retorna informações do usuário atual.

#### POST `/api/auth/refresh`
Renova o token de acesso.

#### PUT `/api/users/me`
Atualiza dados do usuário atual.

### 👥 Acolhidos

#### GET `/api/acolhidos`
Lista todos os acolhidos.

#### POST `/api/acolhidos`
Cria um novo registro de acolhido.

**Content-Type:** `multipart/form-data`

**Campos:**
- `nome` - Nome do acolhido
- `dataNascimento` - Data de nascimento
- `nascimentoGenitores` - Informações dos genitores
- `rua` - Endereço - rua
- `bairro` - Endereço - bairro
- `cidade` - Endereço - cidade
- `responsavel` - Responsável pelo acolhimento
- `dataHoraAcolhimento` - Data e hora do acolhimento
- `orgaoResponsavel` - Órgão responsável
- `profissional` - Profissional responsável
- `motivo` - Motivo do acolhimento
- `possuiAgressao` - Boolean indicando se houve agressão
- `assinatura` - Arquivo de assinatura (opcional)

#### PUT `/api/acolhidos/:id`
Atualiza um registro de acolhido existente.

### 📚 Registro Escolar

#### GET `/api/escolar`
Lista todos os registros escolares.

#### POST `/api/escolar`
Cria um novo registro escolar.

#### PUT `/api/escolar/:id`
Atualiza um registro escolar existente.

### 🤝 Apadrinhamentos

#### GET `/api/apadrinhamentos`
Lista todos os apadrinhamentos.

#### POST `/api/apadrinhamentos`
Cria um novo apadrinhamento.

#### PUT `/api/apadrinhamentos/:id`
Atualiza um apadrinhamento existente.

### 🙋‍♀️ Voluntários

#### GET `/api/voluntarios`
Lista todos os voluntários.

#### POST `/api/voluntarios`
Cadastra um novo voluntário.

#### PUT `/api/voluntarios/:id`
Atualiza dados de um voluntário.

### 👔 Funcionários

#### GET `/api/funcionarios`
Lista todos os funcionários.

#### POST `/api/funcionarios`
Cadastra um novo funcionário.

**Content-Type:** `multipart/form-data`

**Campos:**
- Dados do funcionário (todos os campos são opcionais conforme payload)
- `documentos` - Arquivo de documentos (opcional)

#### PUT `/api/funcionarios/:id`
Atualiza dados de um funcionário.

### 📅 Agenda

#### GET `/api/agenda`
Lista todos os compromissos da agenda.

#### POST `/api/agenda`
Cria um novo compromisso.

**Body:**
```json
{
  "cliente": "Nome do cliente",
  "data": "2024-01-01",
  "hora": "14:30",
  "descricao": "Descrição do compromisso",
  "status": "agendado"
}
```

#### PUT `/api/agenda/:id`
Atualiza um compromisso existente.

## 📊 Estrutura dos Dados

### Resposta Paginada
Todas as listagens retornam dados no formato paginado:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "total": 0
}
```

### Estrutura de Acolhido
```json
{
  "id": "acolhido_abc123",
  "nome": "João Silva",
  "dataNascimento": "2010-05-15",
  "nascimentoGenitores": "Maria Silva e José Silva",
  "rua": "Rua das Flores, 123",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "responsavel": "Dr. Ana Santos",
  "dataHoraAcolhimento": "2024-01-01T10:00:00Z",
  "orgaoResponsavel": "Conselho Tutelar",
  "profissional": "Assistente Social Maria",
  "motivo": "Situação de vulnerabilidade",
  "possuiAgressao": false,
  "assinaturaUrl": "/uploads/assinatura-demo.png"
}
```

### Estrutura de Agenda
```json
{
  "id": "ag_xyz789",
  "cliente": "João Silva",
  "data": "2024-01-15",
  "hora": "14:30",
  "descricao": "Consulta de acompanhamento",
  "status": "agendado"
}
```

## 🔧 Exemplos de Uso

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@casalar.org", "password": "123456"}'
```

### Listar Acolhidos
```bash
curl -X GET http://localhost:3000/api/acolhidos
```

### Criar Novo Acolhido
```bash
curl -X POST http://localhost:3000/api/acolhidos \
  -F "nome=João Silva" \
  -F "dataNascimento=2010-05-15" \
  -F "cidade=São Paulo" \
  -F "possuiAgressao=false"
```

### Criar Compromisso na Agenda
```bash
curl -X POST http://localhost:3000/api/agenda \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "João Silva",
    "data": "2024-01-15",
    "hora": "14:30",
    "descricao": "Consulta de acompanhamento",
    "status": "agendado"
  }'
```

## ⚠️ Observações Importantes

- Esta é uma API de **teste/desenvolvimento**
- Os dados são armazenados em memória e são perdidos quando o servidor é reiniciado
- A autenticação é simulada e não oferece segurança real
- Os uploads de arquivos retornam URLs fictícias
- Não há validação rigorosa de dados de entrada

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido para o Projeto Casa Lar** 🏠❤️