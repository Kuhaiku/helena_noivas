// lib/db.ts
import mysql from 'mysql2/promise';

// Cria o pool de conexões com o banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ─── PROTEÇÃO CONTRA QUEDA DE CONEXÃO (ECONNRESET) ───
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Função auxiliar para facilitar as consultas no código
export async function query(sql: string, values: any[] = []) {
  try {
    const [results] = await pool.execute(sql, values);
    return results;
  } catch (error) {
    console.error("Erro no Banco de Dados: ", error);
    throw error;
  }
}

export default pool;