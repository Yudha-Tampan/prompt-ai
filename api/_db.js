import mysql from "mysql2/promise";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const poolConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.DB_USER || process.env.MYSQLUSER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || "prompthive",
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true
};

if (process.env.DB_SSL === "true" || process.env.MYSQL_SSL === "true") {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = globalThis.__PROMPTHIVE_DB_POOL__ || mysql.createPool(poolConfig);
globalThis.__PROMPTHIVE_DB_POOL__ = pool;

const MAX_USERS = 5000;
const MAX_PROMPTS = 10000;
const MAX_BODY_BYTES = 1_000_000;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function ensureSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    avatar TEXT NOT NULL,
    banned TINYINT(1) NOT NULL DEFAULT 0,
    createdAt DATETIME(3) NOT NULL
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS prompts (
    id VARCHAR(32) NOT NULL PRIMARY KEY,
    userId VARCHAR(32) NOT NULL,
    username VARCHAR(50) NOT NULL,
    title VARCHAR(180) NOT NULL,
    password TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    content MEDIUMTEXT NOT NULL,
    categories JSON NULL,
    createdAt DATETIME(3) NOT NULL,
    INDEX idx_prompts_userId (userId),
    INDEX idx_prompts_category (category)
  )`);
}

function toBool(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function normalizeUser(user) {
  return {
    id: String(user.id || "").trim(),
    username: String(user.username || "").trim().toLowerCase(),
    name: String(user.name || "").trim(),
    email: String(user.email || "").trim().toLowerCase(),
    password: String(user.password || ""),
    bio: String(user.bio || ""),
    avatar: String(user.avatar || "assets/img/default-avatar.svg"),
    banned: toBool(user.banned) ? 1 : 0,
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date()
  };
}

function normalizePrompt(prompt) {
  const categories = Array.isArray(prompt.categories) ? prompt.categories : [];
  return {
    id: String(prompt.id || "").trim(),
    userId: String(prompt.userId || "").trim(),
    username: String(prompt.username || "").trim().toLowerCase(),
    title: String(prompt.title || "").trim(),
    password: String(prompt.password || ""),
    category: String(prompt.category || "").trim(),
    content: String(prompt.content || ""),
    categories: categories.length ? JSON.stringify(categories) : null,
    createdAt: prompt.createdAt ? new Date(prompt.createdAt) : new Date()
  };
}

async function readSeedJson(fileName) {
  const filePath = path.join(rootDir, fileName);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function countRows(table) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(rows?.[0]?.count || 0);
}

async function bootstrapIfEmpty() {
  await ensureSchema();

  const [userCount, promptCount] = await Promise.all([countRows("users"), countRows("prompts")]);
  if (userCount > 0 || promptCount > 0) {
    return false;
  }

  const users = await readSeedJson("users.json");
  const prompts = await readSeedJson("prompts.json");
  await replaceUsers(users, true);
  await replacePrompts(prompts, true);
  return true;
}

async function getUsers() {
  await ensureSchema();
  const [rows] = await pool.query(`SELECT id, username, name, email, password, bio, avatar, banned, createdAt FROM users ORDER BY createdAt ASC`);
  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    password: row.password,
    bio: row.bio || "",
    avatar: row.avatar || "assets/img/default-avatar.svg",
    banned: Boolean(row.banned),
    createdAt: new Date(row.createdAt).toISOString()
  }));
}

async function getPrompts() {
  await ensureSchema();
  const [rows] = await pool.query(`SELECT id, userId, username, title, password, category, content, categories, createdAt FROM prompts ORDER BY createdAt DESC`);
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    username: row.username,
    title: row.title,
    password: row.password || "",
    category: row.category,
    content: row.content,
    categories: row.categories ? JSON.parse(row.categories) : [],
    createdAt: new Date(row.createdAt).toISOString()
  }));
}

async function replaceUsers(users, skipValidation = false) {
  if (!Array.isArray(users)) throw new Error("Users payload invalid");
  if (!skipValidation && users.length > MAX_USERS) throw new Error("Users payload too large");

  await ensureSchema();
  const normalized = users.map(normalizeUser).filter((u) => u.id && u.username && u.name && u.email);

  await pool.query("START TRANSACTION");
  try {
    await pool.query("DELETE FROM users");
    if (normalized.length) {
      const values = normalized.map((u) => [u.id, u.username, u.name, u.email, u.password, u.bio, u.avatar, u.banned, u.createdAt]);
      await pool.query(
        `INSERT INTO users (id, username, name, email, password, bio, avatar, banned, createdAt)
         VALUES ?`,
        [values]
      );
    }
    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }

  return normalized.length;
}

async function replacePrompts(prompts, skipValidation = false) {
  if (!Array.isArray(prompts)) throw new Error("Prompts payload invalid");
  if (!skipValidation && prompts.length > MAX_PROMPTS) throw new Error("Prompts payload too large");

  await ensureSchema();
  const normalized = prompts.map(normalizePrompt).filter((p) => p.id && p.userId && p.username && p.title && p.category);

  await pool.query("START TRANSACTION");
  try {
    await pool.query("DELETE FROM prompts");
    if (normalized.length) {
      const values = normalized.map((p) => [p.id, p.userId, p.username, p.title, p.password, p.category, p.content, p.categories, p.createdAt]);
      await pool.query(
        `INSERT INTO prompts (id, userId, username, title, password, category, content, categories, createdAt)
         VALUES ?`,
        [values]
      );
    }
    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }

  return normalized.length;
}

function isPayloadTooLarge(req) {
  const len = Number(req.headers["content-length"] || 0);
  return len > MAX_BODY_BYTES;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    const size = chunks.reduce((acc, part) => acc + part.length, 0);
    if (size > MAX_BODY_BYTES) {
      throw new Error("Payload too large");
    }
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export {
  pool,
  ensureSchema,
  bootstrapIfEmpty,
  getUsers,
  getPrompts,
  replaceUsers,
  replacePrompts,
  readJsonBody,
  isPayloadTooLarge,
  MAX_USERS,
  MAX_PROMPTS,
  MAX_BODY_BYTES
};
