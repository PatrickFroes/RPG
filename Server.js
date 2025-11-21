import express from 'express';
import cors from 'cors';
import {
  createUser,
  getUserByUsername,
  createCharacter,
  getCharactersByUserId,
  deleteCharacter,
  updateCharacter,
  toggleCharacterFavorite,
  createEnemy,
  getEnemiesByUserId,
  deleteEnemy,
  updateEnemy,
  toggleEnemyFavorite,
  createMap,
  getMapsByUserId,
  deleteMap,
  updateMap,
  toggleMapFavorite
} from './database.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Middleware simples para verificar se usuário está logado
const authMiddleware = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  req.userId = parseInt(userId);
  next();
};

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Registro de usuário
app.post('/api/register', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    const existingUser = getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const result = createUser(username, password);
    res.json({ 
      success: true, 
      userId: result.lastInsertRowid,
      username 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// login
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    const user = getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({ 
      success: true, 
      userId: user.id,
      username: user.username 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROTAS DE PERSONAGENS ====================

// Criar personagem
app.post('/api/characters', authMiddleware, (req, res) => {
  try {
    console.log('Recebendo requisição para criar personagem:', req.body);
    console.log('User ID:', req.userId);
    const result = createCharacter(req.userId, req.body);
    console.log('Personagem criado com ID:', result.lastInsertRowid);
    res.json({ success: true, characterId: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar personagem:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar personagens do usuário
app.get('/api/characters', authMiddleware, (req, res) => {
  try {
    const characters = getCharactersByUserId(req.userId);
    // Converter de snake_case para camelCase
    const formatted = characters.map(c => ({
      id: c.id,
      name: c.name,
      cls: c.class,
      race: c.race,
      hp: c.hp,
      atk: c.atk,
      spd: c.spd,
      ac: c.ac,
      attackType: c.attack_type,
      range: c.range,
      str: c.str,
      dex: c.dex,
      int: c.int,
      cha: c.cha,
      spriteUrl: c.sprite_url,
      isFavorite: c.is_favorite === 1,
      currentHp: c.hp,
      alive: true
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar personagem
app.delete('/api/characters/:id', authMiddleware, (req, res) => {
  try {
    deleteCharacter(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar personagem
app.put('/api/characters/:id', authMiddleware, (req, res) => {
  try {
    updateCharacter(req.params.id, req.userId, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorito de personagem
app.patch('/api/characters/:id/favorite', authMiddleware, (req, res) => {
  try {
    toggleCharacterFavorite(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROTAS DE INIMIGOS ====================

// Criar inimigo
app.post('/api/enemies', authMiddleware, (req, res) => {
  try {
    console.log('Recebendo requisição para criar inimigo:', req.body);
    console.log('User ID:', req.userId);
    const result = createEnemy(req.userId, req.body);
    console.log('Inimigo criado com ID:', result.lastInsertRowid);
    res.json({ success: true, enemyId: result.lastInsertRowid });
  } catch (error) {
    console.error('Erro ao criar inimigo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar inimigos do usuário
app.get('/api/enemies', authMiddleware, (req, res) => {
  try {
    const enemies = getEnemiesByUserId(req.userId);
    const formatted = enemies.map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      hp: e.hp,
      atk: e.atk,
      spd: e.spd,
      spriteUrl: e.sprite_url,
      isFavorite: e.is_favorite === 1
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar inimigo
app.delete('/api/enemies/:id', authMiddleware, (req, res) => {
  try {
    deleteEnemy(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar inimigo
app.put('/api/enemies/:id', authMiddleware, (req, res) => {
  try {
    updateEnemy(req.params.id, req.userId, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorito de inimigo
app.patch('/api/enemies/:id/favorite', authMiddleware, (req, res) => {
  try {
    toggleEnemyFavorite(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROTAS DE MAPAS ====================

// Criar mapa
app.post('/api/maps', authMiddleware, (req, res) => {
  try {
    const result = createMap(req.userId, req.body);
    res.json({ success: true, mapId: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar mapas do usuário
app.get('/api/maps', authMiddleware, (req, res) => {
  try {
    const maps = getMapsByUserId(req.userId);
    const formatted = maps.map(m => ({
      id: m.id,
      name: m.name,
      grid: JSON.parse(m.grid_data),
      rows: m.rows,
      cols: m.cols,
      isFavorite: m.is_favorite === 1
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar mapa
app.delete('/api/maps/:id', authMiddleware, (req, res) => {
  try {
    deleteMap(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar mapa
app.put('/api/maps/:id', authMiddleware, (req, res) => {
  try {
    updateMap(req.params.id, req.userId, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorito de mapa
app.patch('/api/maps/:id/favorite', authMiddleware, (req, res) => {
  try {
    toggleMapFavorite(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🎮 Servidor RPG rodando na porta ${PORT}`);
});
