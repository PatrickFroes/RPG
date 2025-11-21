import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'rpg.db'));

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    race TEXT NOT NULL,
    hp INTEGER NOT NULL,
    atk INTEGER NOT NULL,
    spd INTEGER NOT NULL,
    ac INTEGER NOT NULL,
    attack_type TEXT NOT NULL,
    range INTEGER NOT NULL,
    str INTEGER DEFAULT 0,
    dex INTEGER DEFAULT 0,
    int INTEGER DEFAULT 0,
    cha INTEGER DEFAULT 0,
    sprite_url TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS enemies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    hp INTEGER NOT NULL,
    atk INTEGER NOT NULL,
    spd INTEGER NOT NULL,
    sprite_url TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    grid_data TEXT NOT NULL,
    rows INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    is_favorite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`);

// Funções para usuários
export const createUser = (username, password) => {
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  return stmt.run(username, password);
};

export const getUserByUsername = (username) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
};

export const getUserById = (id) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
};

// Funções para personagens
export const createCharacter = (userId, character) => {
  const stmt = db.prepare(`
    INSERT INTO characters (user_id, name, class, race, hp, atk, spd, ac, attack_type, range, str, dex, int, cha, sprite_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    userId, 
    character.name, 
    character.cls, 
    character.race, 
    character.hp, 
    character.atk, 
    character.spd, 
    character.ac || 10,
    character.attackType || 'melee', 
    character.range || 1,
    character.str || 0, 
    character.dex || 0, 
    character.int || 0, 
    character.cha || 0,
    character.spriteUrl || null
  );
};

export const getCharactersByUserId = (userId) => {
  const stmt = db.prepare('SELECT * FROM characters WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
};

export const deleteCharacter = (id, userId) => {
  const stmt = db.prepare('DELETE FROM characters WHERE id = ? AND user_id = ?');
  return stmt.run(id, userId);
};

export const updateCharacter = (id, userId, character) => {
  const stmt = db.prepare(`
    UPDATE characters 
    SET name = ?, class = ?, race = ?, hp = ?, atk = ?, spd = ?, ac = ?, 
        attack_type = ?, range = ?, str = ?, dex = ?, int = ?, cha = ?, sprite_url = ?
    WHERE id = ? AND user_id = ?
  `);
  return stmt.run(
    character.name,
    character.cls,
    character.race,
    character.hp,
    character.atk,
    character.spd,
    character.ac || 10,
    character.attackType || 'melee',
    character.range || 1,
    character.str || 0,
    character.dex || 0,
    character.int || 0,
    character.cha || 0,
    character.spriteUrl || null,
    id,
    userId
  );
};

export const toggleCharacterFavorite = (id, userId) => {
  const stmt = db.prepare('UPDATE characters SET is_favorite = NOT is_favorite WHERE id = ? AND user_id = ?');
  return stmt.run(id, userId);
};

// Funções para inimigos
export const createEnemy = (userId, enemy) => {
  const stmt = db.prepare(`
    INSERT INTO enemies (user_id, name, type, hp, atk, spd, sprite_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    userId, 
    enemy.name, 
    enemy.type || 'unknown', 
    enemy.hp, 
    enemy.atk, 
    enemy.spd, 
    enemy.spriteUrl || null
  );
};

export const getEnemiesByUserId = (userId) => {
  const stmt = db.prepare('SELECT * FROM enemies WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
};

export const deleteEnemy = (id, userId) => {
  const stmt = db.prepare('DELETE FROM enemies WHERE id = ? AND user_id = ?');
  return stmt.run(id, userId);
};

export const updateEnemy = (id, userId, enemy) => {
  const stmt = db.prepare(`
    UPDATE enemies 
    SET name = ?, type = ?, hp = ?, atk = ?, spd = ?, sprite_url = ?
    WHERE id = ? AND user_id = ?
  `);
  return stmt.run(
    enemy.name,
    enemy.type || 'unknown',
    enemy.hp,
    enemy.atk,
    enemy.spd,
    enemy.spriteUrl || null,
    id,
    userId
  );
};

export const toggleEnemyFavorite = (id, userId) => {
  const stmt = db.prepare('UPDATE enemies SET is_favorite = NOT is_favorite WHERE id = ? AND user_id = ?');
  return stmt.run(id, userId);
};

// Funções para mapas
export const createMap = (userId, mapData) => {
  const stmt = db.prepare(`
    INSERT INTO maps (user_id, name, grid_data, rows, cols)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(userId, mapData.name, JSON.stringify(mapData.grid), mapData.rows, mapData.cols);
};

export const getMapsByUserId = (userId) => {
  const stmt = db.prepare('SELECT * FROM maps WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
};

export const deleteMap = (id, userId) => {
  const stmt = db.prepare('DELETE FROM maps WHERE id = ? AND user_id = ?');
  return stmt.run(id, userId);
};

export const updateMap = (id, userId, mapData) => {
  const stmt = db.prepare(`
    UPDATE maps 
    SET name = ?, grid_data = ?, rows = ?, cols = ?
    WHERE id = ? AND user_id = ?
  `);
  return stmt.run(
    mapData.name,
    JSON.stringify(mapData.grid),
    mapData.rows,
    mapData.cols,
    id,
    userId
  );
};

export const toggleMapFavorite = (id, userId) => {
  const stmt = db.prepare('UPDATE maps SET is_favorite = NOT is_favorite WHERE id = ? AND user_id = ?');
  return stmt.run(id, userId);
};

export default db;
