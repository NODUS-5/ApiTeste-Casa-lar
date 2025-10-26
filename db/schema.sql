-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS casalar
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- Usar o banco criado
USE casalar;

-- ========================================
-- Tabela: colaboradores
-- ========================================
CREATE TABLE IF NOT EXISTS colaboradores (
  id_colaborador INT AUTO_INCREMENT PRIMARY KEY,
  nome_colab VARCHAR(255) NOT NULL,
  data_admissao DATE NOT NULL,
  escolaridade VARCHAR(100) NOT NULL,
  data_nascimento DATE NOT NULL,
  genero VARCHAR(50) NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  rg VARCHAR(20) NOT NULL,
  data_emissao_rg DATE NOT NULL,
  orgao_emissor_rg VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  naturalidade VARCHAR(100) NOT NULL,
  cep VARCHAR(8) NOT NULL,
  logradouro VARCHAR(255) NOT NULL,
  numero INT NOT NULL,
  complemento VARCHAR(255),
  bairro VARCHAR(100) NOT NULL,
  celular VARCHAR(15) NOT NULL,
  profissao VARCHAR(100) NOT NULL,
  voluntario BOOLEAN DEFAULT FALSE,
  inativo BOOLEAN DEFAULT FALSE,
  acesso_sistema BOOLEAN DEFAULT FALSE,
  senha_sistema VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_cpf (cpf),
  INDEX idx_acesso_sistema (acesso_sistema)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: acolhidos
-- ========================================
CREATE TABLE IF NOT EXISTS acolhidos (
  id_acolhido INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  nascimento_genitores DATE,
  rua VARCHAR(255),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  responsavel VARCHAR(255),
  data_hora_acolhimento DATETIME NOT NULL,
  orgao_responsavel VARCHAR(255),
  profissional VARCHAR(255),
  motivo TEXT,
  possui_agressao BOOLEAN DEFAULT FALSE,
  assinatura_url VARCHAR(500),
  inativo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nome (nome),
  INDEX idx_data_acolhimento (data_hora_acolhimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: escolar
-- ========================================
CREATE TABLE IF NOT EXISTS escolar (
  id_escolar INT AUTO_INCREMENT PRIMARY KEY,
  id_acolhido INT,
  nome VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  serie_turma VARCHAR(50),
  professor VARCHAR(255),
  escola VARCHAR(255),
  ano_letivo INT,
  observacoes TEXT,
  inativo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_acolhido) REFERENCES acolhidos(id_acolhido) ON DELETE SET NULL,
  INDEX idx_acolhido (id_acolhido),
  INDEX idx_ano_letivo (ano_letivo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: apadrinhamentos
-- ========================================
CREATE TABLE IF NOT EXISTS apadrinhamentos (
  id_apadrinhamento INT AUTO_INCREMENT PRIMARY KEY,
  id_acolhido INT,
  nome_padrinho VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  naturalidade VARCHAR(100),
  rg VARCHAR(20),
  cpf VARCHAR(11) UNIQUE,
  estado_civil VARCHAR(50),
  nome_conjuge VARCHAR(255),
  endereco TEXT,
  telefone VARCHAR(15),
  profissao VARCHAR(100),
  endereco_profissional TEXT,
  escolaridade VARCHAR(100),
  email VARCHAR(255),
  data_inicio DATE,
  data_fim DATE,
  status VARCHAR(50) DEFAULT 'ATIVO',
  observacoes TEXT,
  inativo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_acolhido) REFERENCES acolhidos(id_acolhido) ON DELETE SET NULL,
  INDEX idx_acolhido (id_acolhido),
  INDEX idx_cpf (cpf),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: voluntarios
-- ========================================
CREATE TABLE IF NOT EXISTS voluntarios (
  id_voluntario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  naturalidade VARCHAR(100),
  rg VARCHAR(20),
  cpf VARCHAR(11) UNIQUE,
  endereco VARCHAR(255),
  numero VARCHAR(10),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  telefone VARCHAR(15),
  celular VARCHAR(15),
  profissao VARCHAR(100),
  escolaridade VARCHAR(100),
  email VARCHAR(255),
  area_atuacao VARCHAR(255),
  disponibilidade VARCHAR(255),
  data_inicio DATE,
  inativo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nome (nome),
  INDEX idx_cpf (cpf),
  INDEX idx_area_atuacao (area_atuacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: agenda
-- ========================================
CREATE TABLE IF NOT EXISTS agenda (
  id_agenda INT AUTO_INCREMENT PRIMARY KEY,
  cliente VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  descricao TEXT,
  tipo VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Pendente',
  id_acolhido INT,
  id_colaborador INT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_acolhido) REFERENCES acolhidos(id_acolhido) ON DELETE SET NULL,
  FOREIGN KEY (id_colaborador) REFERENCES colaboradores(id_colaborador) ON DELETE SET NULL,
  INDEX idx_data (data),
  INDEX idx_status (status),
  INDEX idx_acolhido (id_acolhido),
  INDEX idx_colaborador (id_colaborador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: notas_faltas (pedagógico)
-- ========================================
CREATE TABLE IF NOT EXISTS notas_faltas (
  id_nota_falta INT AUTO_INCREMENT PRIMARY KEY,
  id_escolar INT NOT NULL,
  disciplina VARCHAR(100),
  bimestre INT,
  nota DECIMAL(5,2),
  faltas INT DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_escolar) REFERENCES escolar(id_escolar) ON DELETE CASCADE,
  INDEX idx_escolar (id_escolar),
  INDEX idx_bimestre (bimestre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: reforco_escolar
-- ========================================
CREATE TABLE IF NOT EXISTS reforco_escolar (
  id_reforco INT AUTO_INCREMENT PRIMARY KEY,
  id_acolhido INT NOT NULL,
  disciplina VARCHAR(100),
  professor_reforco VARCHAR(255),
  dia_semana VARCHAR(20),
  horario TIME,
  data_inicio DATE,
  data_fim DATE,
  observacoes TEXT,
  inativo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_acolhido) REFERENCES acolhidos(id_acolhido) ON DELETE CASCADE,
  INDEX idx_acolhido (id_acolhido),
  INDEX idx_disciplina (disciplina)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: saidas
-- ========================================
CREATE TABLE IF NOT EXISTS saidas (
  id_saida INT AUTO_INCREMENT PRIMARY KEY,
  id_acolhido INT NOT NULL,
  data_saida DATE NOT NULL,
  hora_saida TIME NOT NULL,
  data_retorno DATE,
  hora_retorno TIME,
  motivo VARCHAR(255),
  destino VARCHAR(255),
  acompanhante VARCHAR(255),
  telefone_contato VARCHAR(15),
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'Em andamento',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_acolhido) REFERENCES acolhidos(id_acolhido) ON DELETE CASCADE,
  INDEX idx_acolhido (id_acolhido),
  INDEX idx_data_saida (data_saida),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: pendencias
-- ========================================
CREATE TABLE IF NOT EXISTS pendencias (
  id_pendencia INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(100),
  prioridade VARCHAR(50) DEFAULT 'MÉDIA',
  status VARCHAR(50) DEFAULT 'ABERTA',
  id_acolhido INT,
  id_responsavel INT,
  data_abertura DATE NOT NULL,
  data_prazo DATE,
  data_conclusao DATE,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_acolhido) REFERENCES acolhidos(id_acolhido) ON DELETE SET NULL,
  FOREIGN KEY (id_responsavel) REFERENCES colaboradores(id_colaborador) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_prioridade (prioridade),
  INDEX idx_acolhido (id_acolhido),
  INDEX idx_responsavel (id_responsavel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Tabela: financeiro
-- ========================================
CREATE TABLE IF NOT EXISTS financeiro (
  id_financeiro INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  categoria VARCHAR(100),
  descricao VARCHAR(255),
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE,
  data_pagamento DATE,
  status VARCHAR(50) DEFAULT 'PENDENTE',
  forma_pagamento VARCHAR(50),
  id_colaborador INT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_colaborador) REFERENCES colaboradores(id_colaborador) ON DELETE SET NULL,
  INDEX idx_tipo (tipo),
  INDEX idx_status (status),
  INDEX idx_data_vencimento (data_vencimento),
  INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
