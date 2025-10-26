
// Servidor de teste para ProjetoCasaLar - CRUD dos cadastros + auth básico
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { initDb, query } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() }); // para testes;

// --- Auth de exemplo ---
const DEMO_USER = {
  id: 1,
  name: 'Usuário Demo',
  email: 'demo@casalar.org',
  role: 'admin'
};

let TOKENS = {
  accessToken: 'fake_access_token',
  refreshToken: 'fake_refresh_token',
  expiresAt: Date.now() + 60 * 60 * 1000 // 1h
};
app.get('/api', (req, res) => res.json({ ok: true }));
// endpoint para validar conexão com o banco
app.get('/api/db/ping', async (req, res) => {
  try {
    const rows = await query('SELECT 1 AS ok');
    res.json({ db: 'casalar', ok: rows?.[0]?.ok === 1 });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Credenciais inválidas' });
  TOKENS = { ...TOKENS, expiresAt: Date.now() + 60 * 60 * 1000 };
  res.json({ user: DEMO_USER, tokens: TOKENS });
});


app.post('/api/auth/logout', (req, res) => res.json({ ok: true }));
app.get('/api/auth/me', (req, res) => res.json(DEMO_USER));
app.post('/api/auth/refresh', (req, res) => {
  TOKENS = { ...TOKENS, accessToken: 'fake_access_token_' + Date.now(), expiresAt: Date.now() + 60 * 60 * 1000 };
  res.json(TOKENS);
});

app.put('/api/users/me', (req, res) => {
  const { name, avatarUrl } = req.body || {};
  if (name) DEMO_USER.name = name;
  if (avatarUrl !== undefined) DEMO_USER.avatarUrl = avatarUrl;
  res.json(DEMO_USER);
});


const makeId = (p) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

const acolhidos = [];
const escolar = [];
const apadrinhamentos = [];
const voluntarios = [];
const funcionarios = [];

const paginated = (arr) => ({ items: arr, page: 1, pageSize: arr.length || 10, total: arr.length });

// --- Acolhidos ---
// --- Acolhidos (MySQL) ---
app.get('/api/acolhidos', async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        id_acolhido AS id,
        nome,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        DATE_FORMAT(nascimento_genitores,'%Y-%m-%d') AS nascimentoGenitores,
        rua,
        bairro,
        cidade,
        responsavel,
        DATE_FORMAT(data_hora_acolhimento,'%Y-%m-%d %H:%i:%s') AS dataHoraAcolhimento,
        orgao_responsavel AS orgaoResponsavel,
        profissional,
        motivo,
        possui_agressao AS possuiAgressao,
        assinatura_url AS assinaturaUrl,
        inativo
      FROM acolhidos
      ORDER BY id_acolhido DESC
    `);
    res.json({ items: rows, page: 1, pageSize: rows.length, total: rows.length });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar acolhidos', error: err.message });
  }
});

app.post('/api/acolhidos', upload.single('assinatura'), async (req, res) => {
  try {
    const p = req.body || {};
    const required = ['nome', 'dataNascimento', 'dataHoraAcolhimento'];
    const missing = required.filter(k => !p[k]);
    if (missing.length) return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });

    const assinaturaUrl = req.file ? '/uploads/assinatura-demo.png' : (p.assinaturaUrl ?? null);
    const possuiAgressao = p.possuiAgressao === 'true' || p.possuiAgressao === true ? 1 : 0;

    const sql = `
      INSERT INTO acolhidos (
        nome, data_nascimento, nascimento_genitores, rua, bairro, cidade,
        responsavel, data_hora_acolhimento, orgao_responsavel, profissional,
        motivo, possui_agressao, assinatura_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      p.nome,
      p.dataNascimento,
      p.nascimentoGenitores || null,
      p.rua || null,
      p.bairro || null,
      p.cidade || null,
      p.responsavel || null,
      p.dataHoraAcolhimento,
      p.orgaoResponsavel || null,
      p.profissional || null,
      p.motivo || null,
      possuiAgressao,
      assinaturaUrl
    ];

    const result = await query(sql, params);
    const insertedId = result.insertId;
    const rows = await query(`
      SELECT 
        id_acolhido AS id,
        nome,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        DATE_FORMAT(nascimento_genitores,'%Y-%m-%d') AS nascimentoGenitores,
        rua,
        bairro,
        cidade,
        responsavel,
        DATE_FORMAT(data_hora_acolhimento,'%Y-%m-%d %H:%i:%s') AS dataHoraAcolhimento,
        orgao_responsavel AS orgaoResponsavel,
        profissional,
        motivo,
        possui_agressao AS possuiAgressao,
        assinatura_url AS assinaturaUrl,
        inativo
      FROM acolhidos WHERE id_acolhido = ?
    `, [insertedId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar acolhido', error: err.message });
  }
});

app.put('/api/acolhidos/:id', upload.single('assinatura'), async (req, res) => {
  try {
    const id = req.params.id;
    const p = req.body || {};
    const fieldsMap = {
      nome: 'nome',
      dataNascimento: 'data_nascimento',
      nascimentoGenitores: 'nascimento_genitores',
      rua: 'rua',
      bairro: 'bairro',
      cidade: 'cidade',
      responsavel: 'responsavel',
      dataHoraAcolhimento: 'data_hora_acolhimento',
      orgaoResponsavel: 'orgao_responsavel',
      profissional: 'profissional',
      motivo: 'motivo',
      possuiAgressao: 'possui_agressao',
      assinaturaUrl: 'assinatura_url',
      inativo: 'inativo'
    };

    const sets = [];
    const params = [];

    if (req.file) {
      p.assinaturaUrl = '/uploads/assinatura-demo.png';
    }

    for (const [k, v] of Object.entries(p)) {
      if (!(k in fieldsMap)) continue;
      if (k === 'possuiAgressao') {
        sets.push(`${fieldsMap[k]} = ?`);
        params.push(v === 'true' || v === true ? 1 : 0);
      } else {
        sets.push(`${fieldsMap[k]} = ?`);
        params.push(v === '' ? null : v);
      }
    }

    if (!sets.length) return res.status(400).json({ message: 'Nenhum campo para atualizar' });

    const sql = `UPDATE acolhidos SET ${sets.join(', ')} WHERE id_acolhido = ?`;
    params.push(id);
    await query(sql, params);

    const rows = await query(`
      SELECT 
        id_acolhido AS id,
        nome,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        DATE_FORMAT(nascimento_genitores,'%Y-%m-%d') AS nascimentoGenitores,
        rua,
        bairro,
        cidade,
        responsavel,
        DATE_FORMAT(data_hora_acolhimento,'%Y-%m-%d %H:%i:%s') AS dataHoraAcolhimento,
        orgao_responsavel AS orgaoResponsavel,
        profissional,
        motivo,
        possui_agressao AS possuiAgressao,
        assinatura_url AS assinaturaUrl,
        inativo
      FROM acolhidos WHERE id_acolhido = ?
    `, [id]);

    if (!rows.length) return res.status(404).json({ message: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar acolhido', error: err.message });
  }
});

// Toggle ativo/inativo para acolhidos
app.patch('/api/acolhidos/:id/ativo', async (req, res) => {
  try {
    const id = req.params.id;
    const { ativo } = req.body || {};
    if (ativo === undefined) return res.status(400).json({ message: 'Campo "ativo" é obrigatório (true/false)' });
    const inativo = (ativo === 'true' || ativo === true) ? 0 : 1;
    await query('UPDATE acolhidos SET inativo = ? WHERE id_acolhido = ?', [inativo, id]);
    const rows = await query(`
      SELECT 
        id_acolhido AS id,
        nome,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        DATE_FORMAT(nascimento_genitores,'%Y-%m-%d') AS nascimentoGenitores,
        rua,
        bairro,
        cidade,
        responsavel,
        DATE_FORMAT(data_hora_acolhimento,'%Y-%m-%d %H:%i:%s') AS dataHoraAcolhimento,
        orgao_responsavel AS orgaoResponsavel,
        profissional,
        motivo,
        possui_agressao AS possuiAgressao,
        assinatura_url AS assinaturaUrl,
        inativo
      FROM acolhidos WHERE id_acolhido = ?
    `, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao alterar status', error: err.message });
  }
});

app.get('/api/escolar', (req, res) => res.json(paginated(escolar)));
app.post('/api/escolar', (req, res) => {
  const payload = req.body || {};
  const novo = { id: makeId('escolar'), ...payload };
  escolar.push(novo);
  res.status(201).json(novo);
});
app.put('/api/escolar/:id', (req, res) => {
  const idx = escolar.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });
  escolar[idx] = { ...escolar[idx], ...(req.body || {}) };
  res.json(escolar[idx]);
});

// Toggle ativo/inativo para escolar (MySQL)
app.patch('/api/escolar/:id/ativo', async (req, res) => {
  try {
    const id = req.params.id;
    const { ativo } = req.body || {};
    if (ativo === undefined) return res.status(400).json({ message: 'Campo "ativo" é obrigatório (true/false)' });
    const inativo = (ativo === 'true' || ativo === true) ? 0 : 1;
    await query('UPDATE escolar SET inativo = ? WHERE id_escolar = ?', [inativo, id]);
    const rows = await query(`
      SELECT 
        id_escolar AS id,
        id_acolhido AS idAcolhido,
        nome,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        serie_turma AS serieTurma,
        professor,
        escola,
        ano_letivo AS anoLetivo,
        observacoes,
        inativo
      FROM escolar WHERE id_escolar = ?
    `, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao alterar status', error: err.message });
  }
});


app.get('/api/apadrinhamentos', (req, res) => res.json(paginated(apadrinhamentos)));
app.post('/api/apadrinhamentos', (req, res) => {
  const payload = req.body || {};
  const novo = { id: makeId('apad'), ...payload };
  apadrinhamentos.push(novo);
  res.status(201).json(novo);
});
app.put('/api/apadrinhamentos/:id', (req, res) => {
  const idx = apadrinhamentos.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });
  apadrinhamentos[idx] = { ...apadrinhamentos[idx], ...(req.body || {}) };
  res.json(apadrinhamentos[idx]);
});

// Toggle ativo/inativo para apadrinhamentos (MySQL)
app.patch('/api/apadrinhamentos/:id/ativo', async (req, res) => {
  try {
    const id = req.params.id;
    const { ativo } = req.body || {};
    if (ativo === undefined) return res.status(400).json({ message: 'Campo "ativo" é obrigatório (true/false)' });
    const inativo = (ativo === 'true' || ativo === true) ? 0 : 1;
    await query('UPDATE apadrinhamentos SET inativo = ? WHERE id_apadrinhamento = ?', [inativo, id]);
    const rows = await query(`
      SELECT 
        id_apadrinhamento AS id,
        id_acolhido AS idAcolhido,
        nome_padrinho AS nomePadrinho,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        naturalidade,
        rg,
        cpf,
        estado_civil AS estadoCivil,
        nome_conjuge AS nomeConjuge,
        endereco,
        telefone,
        profissao,
        endereco_profissional AS enderecoProfissional,
        escolaridade,
        email,
        DATE_FORMAT(data_inicio,'%Y-%m-%d') AS dataInicio,
        DATE_FORMAT(data_fim,'%Y-%m-%d') AS dataFim,
        status,
        observacoes,
        inativo
      FROM apadrinhamentos WHERE id_apadrinhamento = ?
    `, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao alterar status', error: err.message });
  }
});

// --- Voluntarios (MySQL) ---
app.get('/api/voluntarios', async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        id_voluntario AS id,
        nome,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        naturalidade,
        rg,
        cpf,
        endereco,
        numero,
        bairro,
        cidade,
        telefone,
        celular,
        profissao,
        escolaridade,
        email,
        area_atuacao AS areaAtuacao,
        disponibilidade,
        DATE_FORMAT(data_inicio,'%Y-%m-%d') AS dataInicio,
        inativo
      FROM voluntarios
      ORDER BY id_voluntario DESC
    `);
    res.json({ items: rows, page: 1, pageSize: rows.length, total: rows.length });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar voluntários', error: err.message });
  }
});

app.post('/api/voluntarios', async (req, res) => {
  try {
    const p = req.body || {};
    const required = ['nome', 'dataNascimento'];
    const missing = required.filter(k => !p[k]);
    if (missing.length) return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });

    const sql = `
      INSERT INTO voluntarios (
        nome, data_nascimento, naturalidade, rg, cpf, endereco, numero, bairro, cidade,
        telefone, celular, profissao, escolaridade, email, area_atuacao, disponibilidade, data_inicio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      p.nome,
      p.dataNascimento,
      p.naturalidade || null,
      p.rg || null,
      p.cpf || null,
      p.endereco || null,
      p.numero || null,
      p.bairro || null,
      p.cidade || null,
      p.telefone || null,
      p.celular || null,
      p.profissao || null,
      p.escolaridade || null,
      p.email || null,
      p.areaAtuacao || null,
      p.disponibilidade || null,
      p.dataInicio || null
    ];

    const result = await query(sql, params);
    const insertedId = result.insertId;

    const rows = await query(`
      SELECT 
        id_voluntario AS id,
        nome,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        naturalidade,
        rg,
        cpf,
        endereco,
        numero,
        bairro,
        cidade,
        telefone,
        celular,
        profissao,
        escolaridade,
        email,
        area_atuacao AS areaAtuacao,
        disponibilidade,
        DATE_FORMAT(data_inicio,'%Y-%m-%d') AS dataInicio,
        inativo
      FROM voluntarios WHERE id_voluntario = ?
    `, [insertedId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar voluntário', error: err.message });
  }
});

app.put('/api/voluntarios/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const p = req.body || {};
    const fieldsMap = {
      nome: 'nome',
      dataNascimento: 'data_nascimento',
      naturalidade: 'naturalidade',
      rg: 'rg',
      cpf: 'cpf',
      endereco: 'endereco',
      numero: 'numero',
      bairro: 'bairro',
      cidade: 'cidade',
      telefone: 'telefone',
      celular: 'celular',
      profissao: 'profissao',
      escolaridade: 'escolaridade',
      email: 'email',
      areaAtuacao: 'area_atuacao',
      disponibilidade: 'disponibilidade',
      dataInicio: 'data_inicio',
      inativo: 'inativo'
    };

    const sets = [];
    const params = [];

    for (const [k, v] of Object.entries(p)) {
      if (!(k in fieldsMap)) continue;
      sets.push(`${fieldsMap[k]} = ?`);
      params.push(v === '' ? null : v);
    }

    if (!sets.length) return res.status(400).json({ message: 'Nenhum campo para atualizar' });

    const sql = `UPDATE voluntarios SET ${sets.join(', ')} WHERE id_voluntario = ?`;
    params.push(id);
    await query(sql, params);

    const rows = await query(`
      SELECT 
        id_voluntario AS id,
        nome,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        naturalidade,
        rg,
        cpf,
        endereco,
        numero,
        bairro,
        cidade,
        telefone,
        celular,
        profissao,
        escolaridade,
        email,
        area_atuacao AS areaAtuacao,
        disponibilidade,
        DATE_FORMAT(data_inicio,'%Y-%m-%d') AS dataInicio,
        inativo
      FROM voluntarios WHERE id_voluntario = ?
    `, [id]);

    if (!rows.length) return res.status(404).json({ message: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar voluntário', error: err.message });
  }
});

// Toggle ativo/inativo para voluntários
app.patch('/api/voluntarios/:id/ativo', async (req, res) => {
  try {
    const id = req.params.id;
    const { ativo } = req.body || {};
    if (ativo === undefined) return res.status(400).json({ message: 'Campo "ativo" é obrigatório (true/false)' });
    const inativo = (ativo === 'true' || ativo === true) ? 0 : 1;
    await query('UPDATE voluntarios SET inativo = ? WHERE id_voluntario = ?', [inativo, id]);
    const rows = await query(`
      SELECT 
        id_voluntario AS id,
        nome,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        naturalidade,
        rg,
        cpf,
        endereco,
        numero,
        bairro,
        cidade,
        telefone,
        celular,
        profissao,
        escolaridade,
        email,
        area_atuacao AS areaAtuacao,
        disponibilidade,
        DATE_FORMAT(data_inicio,'%Y-%m-%d') AS dataInicio,
        inativo
      FROM voluntarios WHERE id_voluntario = ?
    `, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao alterar status', error: err.message });
  }
});

// --- Funcionarios (colaboradores) MySQL ---
app.get('/api/funcionarios', async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        id_colaborador AS id,
        nome_colab AS nomeColab,
        DATE_FORMAT(data_admissao,'%Y-%m-%d') AS dataAdmissao,
        escolaridade,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        genero,
        cpf,
        rg,
        DATE_FORMAT(data_emissao_rg,'%Y-%m-%d') AS dataEmissaoRg,
        orgao_emissor_rg AS orgaoEmissorRg,
        email,
        naturalidade,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        celular,
        profissao,
        voluntario,
        inativo,
        acesso_sistema AS acessoSistema
      FROM colaboradores
      ORDER BY id_colaborador DESC
    `);
    res.json({ items: rows, page: 1, pageSize: rows.length, total: rows.length });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar funcionários', error: err.message });
  }
});

app.post('/api/funcionarios', upload.single('documentos'), async (req, res) => {
  try {
    const p = req.body || {};
    const required = [
      'nomeColab','dataAdmissao','escolaridade','dataNascimento','genero','cpf','rg',
      'dataEmissaoRg','orgaoEmissorRg','email','naturalidade','cep','logradouro','numero',
      'bairro','celular','profissao','senhaSistema'
    ];
    const missing = required.filter(k => p[k] === undefined || p[k] === null || p[k] === '');
    if (missing.length) return res.status(400).json({ message: `Campos obrigatórios: ${missing.join(', ')}` });

    const voluntario = p.voluntario === 'true' || p.voluntario === true ? 1 : 0;
    const inativo = p.inativo === 'true' || p.inativo === true ? 1 : 0;
    const acessoSistema = p.acessoSistema === 'true' || p.acessoSistema === true ? 1 : 0;
    const numero = Number.isNaN(Number(p.numero)) ? null : Number(p.numero);
    if (numero === null) return res.status(400).json({ message: 'numero deve ser inteiro' });

    const sql = `
      INSERT INTO colaboradores (
        nome_colab, data_admissao, escolaridade, data_nascimento, genero, cpf, rg,
        data_emissao_rg, orgao_emissor_rg, email, naturalidade, cep, logradouro, numero,
        complemento, bairro, celular, profissao, voluntario, inativo, acesso_sistema, senha_sistema
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      p.nomeColab,
      p.dataAdmissao,
      p.escolaridade,
      p.dataNascimento,
      p.genero,
      p.cpf,
      p.rg,
      p.dataEmissaoRg,
      p.orgaoEmissorRg,
      p.email,
      p.naturalidade,
      p.cep,
      p.logradouro,
      numero,
      p.complemento || null,
      p.bairro,
      p.celular,
      p.profissao,
      voluntario,
      inativo,
      acessoSistema,
      p.senhaSistema
    ];

    const result = await query(sql, params);
    const insertedId = result.insertId;
    const rows = await query(`
      SELECT
        id_colaborador AS id,
        nome_colab AS nomeColab,
        DATE_FORMAT(data_admissao,'%Y-%m-%d') AS dataAdmissao,
        escolaridade,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        genero,
        cpf,
        rg,
        DATE_FORMAT(data_emissao_rg,'%Y-%m-%d') AS dataEmissaoRg,
        orgao_emissor_rg AS orgaoEmissorRg,
        email,
        naturalidade,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        celular,
        profissao,
        voluntario,
        inativo,
        acesso_sistema AS acessoSistema
      FROM colaboradores WHERE id_colaborador = ?
    `, [insertedId]);

    // compat: retorna também um documentosUrl if file provided (não persiste em DB)
    const created = rows[0] || {};
    if (req.file) created.documentosUrl = '/uploads/documento-demo.pdf';
    res.status(201).json(created);
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'CPF ou Email já cadastrados', error: err.message });
    }
    res.status(500).json({ message: 'Erro ao criar funcionário', error: err.message });
  }
});

app.put('/api/funcionarios/:id', upload.single('documentos'), async (req, res) => {
  try {
    const id = req.params.id;
    const p = req.body || {};
    const fieldsMap = {
      nomeColab: 'nome_colab',
      dataAdmissao: 'data_admissao',
      escolaridade: 'escolaridade',
      dataNascimento: 'data_nascimento',
      genero: 'genero',
      cpf: 'cpf',
      rg: 'rg',
      dataEmissaoRg: 'data_emissao_rg',
      orgaoEmissorRg: 'orgao_emissor_rg',
      email: 'email',
      naturalidade: 'naturalidade',
      cep: 'cep',
      logradouro: 'logradouro',
      numero: 'numero',
      complemento: 'complemento',
      bairro: 'bairro',
      celular: 'celular',
      profissao: 'profissao',
      voluntario: 'voluntario',
      inativo: 'inativo',
      acessoSistema: 'acesso_sistema',
      senhaSistema: 'senha_sistema'
    };

    const sets = [];
    const params = [];

    for (const [k, vRaw] of Object.entries(p)) {
      if (!(k in fieldsMap)) continue;
      let v = vRaw;
      if (['voluntario','inativo','acessoSistema'].includes(k)) {
        v = (vRaw === 'true' || vRaw === true) ? 1 : 0;
      }
      if (k === 'numero') {
        const n = Number(vRaw);
        if (Number.isNaN(n)) return res.status(400).json({ message: 'numero deve ser inteiro' });
        v = n;
      }
      sets.push(`${fieldsMap[k]} = ?`);
      params.push(v === '' ? null : v);
    }

    if (!sets.length) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    const sql = `UPDATE colaboradores SET ${sets.join(', ')} WHERE id_colaborador = ?`;
    params.push(id);
    await query(sql, params);

    const rows = await query(`
      SELECT
        id_colaborador AS id,
        nome_colab AS nomeColab,
        DATE_FORMAT(data_admissao,'%Y-%m-%d') AS dataAdmissao,
        escolaridade,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        genero,
        cpf,
        rg,
        DATE_FORMAT(data_emissao_rg,'%Y-%m-%d') AS dataEmissaoRg,
        orgao_emissor_rg AS orgaoEmissorRg,
        email,
        naturalidade,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        celular,
        profissao,
        voluntario,
        inativo,
        acesso_sistema AS acessoSistema
      FROM colaboradores WHERE id_colaborador = ?
    `, [id]);

    if (!rows.length) return res.status(404).json({ message: 'Não encontrado' });
    const updated = rows[0];
    if (req.file) updated.documentosUrl = '/uploads/documento-demo.pdf';
    res.json(updated);
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'CPF ou Email já cadastrados', error: err.message });
    }
    res.status(500).json({ message: 'Erro ao atualizar funcionário', error: err.message });
  }
});

// Toggle ativo/inativo para funcionários (colaboradores)
app.patch('/api/funcionarios/:id/ativo', async (req, res) => {
  try {
    const id = req.params.id;
    const { ativo } = req.body || {};
    if (ativo === undefined) return res.status(400).json({ message: 'Campo "ativo" é obrigatório (true/false)' });
    const inativo = (ativo === 'true' || ativo === true) ? 0 : 1;
    await query('UPDATE colaboradores SET inativo = ? WHERE id_colaborador = ?', [inativo, id]);
    const rows = await query(`
      SELECT
        id_colaborador AS id,
        nome_colab AS nomeColab,
        DATE_FORMAT(data_admissao,'%Y-%m-%d') AS dataAdmissao,
        escolaridade,
        DATE_FORMAT(data_nascimento,'%Y-%m-%d') AS dataNascimento,
        genero,
        cpf,
        rg,
        DATE_FORMAT(data_emissao_rg,'%Y-%m-%d') AS dataEmissaoRg,
        orgao_emissor_rg AS orgaoEmissorRg,
        email,
        naturalidade,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        celular,
        profissao,
        voluntario,
        inativo,
        acesso_sistema AS acessoSistema
      FROM colaboradores WHERE id_colaborador = ?
    `, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao alterar status', error: err.message });
  }
});

const agenda = [];


app.get('/api/agenda', (req, res) => {
  res.json(paginated(agenda));
});

app.post('/api/agenda', (req, res) => {
  const payload = req.body || {};
  const novo = {
    id: makeId('ag'),
    cliente: payload.cliente,
    data: payload.data,      
    hora: payload.hora,     
    descricao: payload.descricao,
    status: payload.status
  };
  agenda.push(novo);
  res.status(201).json(novo);
});

app.put('/api/agenda/:id', (req, res) => {
  const idx = agenda.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });
  agenda[idx] = { ...agenda[idx], ...(req.body || {}) };
  res.json(agenda[idx]);
});

// Toggle ativo/inativo para reforço escolar (MySQL)
app.patch('/api/reforco-escolar/:id/ativo', async (req, res) => {
  try {
    const id = req.params.id;
    const { ativo } = req.body || {};
    if (ativo === undefined) return res.status(400).json({ message: 'Campo "ativo" é obrigatório (true/false)' });
    const inativo = (ativo === 'true' || ativo === true) ? 0 : 1;
    await query('UPDATE reforco_escolar SET inativo = ? WHERE id_reforco = ?', [inativo, id]);
    const rows = await query(`
      SELECT 
        id_reforco AS id,
        id_acolhido AS idAcolhido,
        disciplina,
        professor_reforco AS professorReforco,
        dia_semana AS diaSemana,
        TIME_FORMAT(horario, '%H:%i:%s') AS horario,
        DATE_FORMAT(data_inicio,'%Y-%m-%d') AS dataInicio,
        DATE_FORMAT(data_fim,'%Y-%m-%d') AS dataFim,
        observacoes,
        inativo
      FROM reforco_escolar WHERE id_reforco = ?
    `, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao alterar status', error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
// Inicializa banco e só então inicia o servidor
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Banco 'casalar' conectado. API em http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('Falha ao inicializar o banco:', err);
    process.exit(1);
  });