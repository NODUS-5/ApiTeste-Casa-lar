const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Configuração básica - conforme solicitado
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '123456789',
  // database será definido após criação do banco
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

let pool; // Pool compartilhado após init

async function initDb() {
  // 1) Conexão temporária (sem database) para criar o DB e rodar o schema
  const temp = await mysql.createConnection(DB_CONFIG);
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Executa todo o script de schema (permite múltiplas instruções)
    await temp.query(schemaSQL);
  } finally {
    await temp.end();
  }

  // 2) Cria o pool já apontando para o banco 'casalar'
  pool = mysql.createPool({ ...DB_CONFIG, database: 'casalar' });

  // 3) Sanidade: testa uma query simples
  const [rows] = await pool.query('SELECT DATABASE() AS db');
  const dbName = rows?.[0]?.db;
  if (dbName !== 'casalar') {
    throw new Error(`Falha ao selecionar o banco esperado. DB atual: ${dbName}`);
  }

  return pool;
}

function getPool() {
  if (!pool) throw new Error('Banco de dados não inicializado. Chame initDb() primeiro.');
  return pool;
}

async function query(sql, params) {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

module.exports = {
  initDb,
  getPool,
  query
};
