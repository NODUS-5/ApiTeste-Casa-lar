
// Servidor de teste para ProjetoCasaLar - CRUD dos cadastros + auth básico
const express = require('express');
const cors = require('cors');
const multer = require('multer');

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
app.get('/api/acolhidos', (req, res) => res.json(paginated(acolhidos)));
app.post('/api/acolhidos', upload.single('assinatura'), (req, res) => {
  const payload = req.body || {};
  const novo = {
    id: makeId('acolhido'),
    nome: payload.nome,
    dataNascimento: payload.dataNascimento,
    nascimentoGenitores: payload.nascimentoGenitores,
    rua: payload.rua,
    bairro: payload.bairro,
    cidade: payload.cidade,
    responsavel: payload.responsavel,
    dataHoraAcolhimento: payload.dataHoraAcolhimento,
    orgaoResponsavel: payload.orgaoResponsavel,
    profissional: payload.profissional,
    motivo: payload.motivo,
    possuiAgressao: payload.possuiAgressao === 'true' || payload.possuiAgressao === true,
    assinaturaUrl: req.file ? '/uploads/assinatura-demo.png' : null
  };
  acolhidos.push(novo);
  res.status(201).json(novo);
});
app.put('/api/acolhidos/:id', upload.single('assinatura'), (req, res) => {
  const idx = acolhidos.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });
  const current = acolhidos[idx];
  const patch = req.body || {};
  const updated = {
    ...current,
    ...patch,
    possuiAgressao: patch.possuiAgressao === 'true' || patch.possuiAgressao === true || current.possuiAgressao,
    assinaturaUrl: req.file ? '/uploads/assinatura-demo.png' : current.assinaturaUrl ?? null
  };
  acolhidos[idx] = updated;
  res.json(updated);
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

app.get('/api/voluntarios', (req, res) => res.json(paginated(voluntarios)));
app.post('/api/voluntarios', (req, res) => {
  const payload = req.body || {};
  const novo = { id: makeId('vol'), ...payload };
  voluntarios.push(novo);
  res.status(201).json(novo);
});
app.put('/api/voluntarios/:id', (req, res) => {
  const idx = voluntarios.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });
  voluntarios[idx] = { ...voluntarios[idx], ...(req.body || {}) };
  res.json(voluntarios[idx]);
});

app.get('/api/funcionarios', (req, res) => res.json(paginated(funcionarios)));
app.post('/api/funcionarios', upload.single('documentos'), (req, res) => {
  const payload = req.body || {};
  const novo = {
    id: makeId('func'),
    ...payload,
    documentosUrl: req.file ? '/uploads/documento-demo.pdf' : null
  };
  funcionarios.push(novo);
  res.status(201).json(novo);
});
app.put('/api/funcionarios/:id', upload.single('documentos'), (req, res) => {
  const idx = funcionarios.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Não encontrado' });
  const current = funcionarios[idx];
  const patch = req.body || {};
  const updated = {
    ...current,
    ...patch,
    documentosUrl: req.file ? '/uploads/documento-demo.pdf' : current.documentosUrl ?? null
  };
  funcionarios[idx] = updated;
  res.json(updated);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API de teste rodando em http://localhost:${PORT}/api`);
});