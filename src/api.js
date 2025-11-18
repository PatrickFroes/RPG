const API_URL = 'http://localhost:3001/api';

// Helper para adicionar userId nos headers
const getHeaders = () => {
  const userId = localStorage.getItem('userId');
  return {
    'Content-Type': 'application/json',
    'user-id': userId || '',
  };
};

// ==================== PERSONAGENS ====================

export const saveCharacter = async (character) => {
  console.log('Salvando personagem:', character);
  const response = await fetch(`${API_URL}/characters`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(character),
  });
  const data = await response.json();
  console.log('Resposta do servidor (personagem):', data);
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao salvar personagem');
  }
  return data;
};

export const loadCharacters = async () => {
  const response = await fetch(`${API_URL}/characters`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return response.json();
};

export const removeCharacter = async (id) => {
  const response = await fetch(`${API_URL}/characters/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
};

// ==================== INIMIGOS ====================

export const saveEnemy = async (enemy) => {
  console.log('Salvando inimigo:', enemy);
  const response = await fetch(`${API_URL}/enemies`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(enemy),
  });
  const data = await response.json();
  console.log('Resposta do servidor (inimigo):', data);
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao salvar inimigo');
  }
  return data;
};

export const loadEnemies = async () => {
  const response = await fetch(`${API_URL}/enemies`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return response.json();
};

export const removeEnemy = async (id) => {
  const response = await fetch(`${API_URL}/enemies/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
};

// ==================== MAPAS ====================

export const saveMap = async (mapData) => {
  const response = await fetch(`${API_URL}/maps`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(mapData),
  });
  return response.json();
};

export const loadMaps = async () => {
  const response = await fetch(`${API_URL}/maps`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return response.json();
};

export const removeMap = async (id) => {
  const response = await fetch(`${API_URL}/maps/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
};
