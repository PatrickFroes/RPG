# RPG Creator

Sistema completo para criação e gerenciamento de jogos de RPG tático com autenticação de usuários, criação de personagens, inimigos e mapas personalizados.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [API Endpoints](#api-endpoints)
- [Componentes Principais](#componentes-principais)

## Sobre o Projeto

O RPG Creator é uma aplicação web fullstack que permite aos usuários criar e gerenciar seus próprios jogos de RPG tático. O sistema oferece ferramentas completas para:

- **Autenticação de Usuários**: Sistema de login e registro com persistência de sessão
- **Criação de Personagens**: Sistema de classes e raças com atributos personalizáveis
- **Criação de Inimigos**: Biblioteca de inimigos com sprites animados e estatísticas customizáveis
- **Editor de Mapas**: Editor visual com sistema de tiles e colocação de inimigos
- **Modo de Jogo**: Sistema de combate tático turn-based

## Funcionalidades

### Sistema de Autenticação
- Registro de novos usuários
- Login com validação
- Persistência de sessão via localStorage
- Logout seguro

### Criador de Personagens
- **7 Raças disponíveis**: Humano, Elfo, Orc, Gigante, Ogro, Halfling, Gnomo
- **3 Classes disponíveis**: Guerreiro, Ladino, Feiticeiro
- Sistema de atributos (STR, DEX, INT, CHA)
- Bônus raciais automáticos
- Estatísticas de combate (HP, ATK, SPD, AC)
- Sprites animados para cada classe
- Visualização em tempo real
- Salvamento em banco de dados SQLite

### Criador de Inimigos
- **8 tipos de inimigos**: Orc, Orc Guerreiro, Orc Xamã, Orc Arqueiro, Esqueleto, Esqueleto Guerreiro, Esqueleto Mago, Esqueleto Arqueiro
- Sprites animados únicos
- Customização de estatísticas
- Nomeação personalizada
- Sistema de tipos de ataque (melee/ranged)

### Editor de Mapas
- **Sistema de Tiles**:
- Grid configurável (8x8 padrão)
- Seletor visual de tiles
- Preview do tile selecionado em tempo real
- Colocação de inimigos no mapa
- Layout responsivo de 3 colunas:
  - Esquerda: Seletor de tileset
  - Centro: Grid do mapa
  - Direita: Ferramentas e seletor de inimigos
- Salvamento de mapas com nome personalizado
- Thumbnail visual dos mapas salvos

### Modo de Jogo
- Sistema de combate turn-based
- Seleção de mapa
- Posicionamento estratégico de personagens
- Cálculo de dano baseado em atributos
- Sistema de vida e morte
- Visualização de alcance de ataque
- Feedback visual de ações

## Tecnologias Utilizadas

### Frontend
- **React 19.1.1** - Biblioteca UI
- **Vite 7.1.2** - Build tool e dev server
- **Tailwind CSS 4.1.17** - Framework CSS utilitário
- **JavaScript (ES6+)** - Linguagem de programação

### Backend
- **Node.js** - Runtime JavaScript
- **Express 5.1.0** - Framework web
- **Better-SQLite3 12.4.1** - Banco de dados SQLite
- **CORS 2.8.5** - Middleware para Cross-Origin Resource Sharing

### Dev Tools
- **ESLint 9.33.0** - Linter JavaScript
- **Vite Plugin React** - Suporte para React no Vite

## Arquitetura do Projeto

```
RPG/
├── public/
│   ├── logo.png                    # Logo da aplicação
│   └── tileset.png                 # Tileset para mapas (64x72, tiles 8x8)
├── src/
│   ├── components/
│   │   ├── Auth.jsx                # Componente de autenticação
│   │   ├── CharacterCreator.jsx    # Criador de personagens
│   │   ├── EnemyCreator.jsx        # Criador de inimigos
│   │   ├── MapEditor.jsx           # Editor de mapas
│   │   ├── PlayScreen.jsx          # Tela de jogo
│   │   ├── Sidebar.jsx             # Barra lateral de navegação
│   │   ├── Containers.jsx          # Componentes de container
│   │   └── Inputs.jsx              # Componentes de input
│   ├── data/
│   │   ├── entityData.js           # Dados de classes, raças e inimigos
│   │   └── functions.jsx           # Funções auxiliares e AnimatedEnemySprite
│   ├── api.js                      # Cliente API (fetch)
│   ├── App.jsx                     # Componente raiz
│   ├── main.jsx                    # Entry point React
│   └── index.css                   # Estilos globais
├── database.js                     # Funções do banco de dados SQLite
├── Server.js                       # Servidor Express
├── rpg.db                          # Banco de dados SQLite (gerado automaticamente)
├── package.json                    # Dependências e scripts
├── vite.config.js                  # Configuração Vite
└── README.md                       # Documentação

```

## Instalação

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd RPG
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor backend**
```bash
node Server.js
```
O servidor estará rodando em `http://localhost:3001`

4. **Inicie o frontend (em outro terminal)**
```bash
npm run dev
```
O frontend estará disponível em `http://localhost:5173`

## Como Usar

### 1. Autenticação
1. Acesse a aplicação
2. Clique em "Não tem conta? Registre-se"
3. Crie seu usuário e senha
4. Faça login

### 2. Criar Personagens
1. Clique em "Criar Personagem" na sidebar
2. Preencha o nome
3. Selecione uma raça (bônus aplicados automaticamente)
4. Selecione uma classe (stats definidos)
5. Clique em "Adicionar Personagem"
6. Visualize seus personagens criados com sprites animados

### 3. Criar Inimigos
1. Clique em "Criar Inimigo" na sidebar
2. Selecione um tipo de inimigo
3. Personalize o nome e estatísticas
4. Clique em "Adicionar Inimigo"

### 4. Criar Mapas
1. Clique em "Criar Mapa" na sidebar
2. Configure o tamanho do grid (padrão 8x8)
3. Clique em "Criar Novo Mapa"
4. Use o seletor de tiles à esquerda para escolher tiles
5. Clique no grid central para pintar
6. Alterne para modo "Inimigo" nas ferramentas à direita
7. Selecione um inimigo e clique no grid para posicionar
8. Digite um nome para o mapa
9. Clique em "Salvar Mapa"

### 5. Jogar
1. Clique em "Jogar" na sidebar
2. Selecione um mapa da lista
3. Selecione seus personagens para a batalha
4. Clique em "Iniciar Jogo"
5. Posicione seus personagens no grid
6. Clique em "Começar Batalha"
7. Use turnos para mover e atacar inimigos

## Estrutura do Banco de Dados

### Tabela: `users`
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `characters`
```sql
CREATE TABLE characters (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Tabela: `enemies`
```sql
CREATE TABLE enemies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    hp INTEGER NOT NULL,
    atk INTEGER NOT NULL,
    spd INTEGER NOT NULL,
    sprite_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

### Tabela: `maps`
```sql
CREATE TABLE maps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    grid_data TEXT NOT NULL,
    rows INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## API Endpoints

### Autenticação

#### `POST /api/register`
Registra um novo usuário
```json
// Request
{
  "username": "player1",
  "password": "senha123"
}

// Response
{
  "success": true,
  "userId": 1,
  "username": "player1"
}
```

#### `POST /api/login`
Autentica um usuário
```json
// Request
{
  "username": "player1",
  "password": "senha123"
}

// Response
{
  "success": true,
  "userId": 1,
  "username": "player1"
}
```

### Personagens

#### `POST /api/characters`
Cria um novo personagem (requer autenticação)
```json
// Request Headers
{
  "user-id": "1"
}

// Request Body
{
  "name": "Aragorn",
  "cls": "warrior",
  "race": "human",
  "hp": 100,
  "atk": 15,
  "spd": 5,
  "ac": 15,
  "attackType": "melee",
  "range": 1,
  "str": 2,
  "dex": 0,
  "int": 0,
  "cha": 1,
  "spriteUrl": "/warrior.png"
}

// Response
{
  "success": true,
  "characterId": 1
}
```

#### `GET /api/characters`
Lista todos os personagens do usuário autenticado
```json
// Response
[
  {
    "id": 1,
    "name": "Aragorn",
    "cls": "warrior",
    "race": "human",
    "hp": 100,
    "atk": 15,
    "spd": 5,
    "ac": 15,
    "attackType": "melee",
    "range": 1,
    "str": 2,
    "dex": 0,
    "int": 0,
    "cha": 1,
    "spriteUrl": "/warrior.png",
    "currentHp": 100,
    "alive": true
  }
]
```

#### `DELETE /api/characters/:id`
Deleta um personagem específico

### Inimigos

#### `POST /api/enemies`
Cria um novo inimigo
```json
// Request
{
  "name": "Goblin Feroz",
  "type": "goblin",
  "hp": 30,
  "atk": 8,
  "spd": 6,
  "spriteUrl": "/goblin.png"
}

// Response
{
  "success": true,
  "enemyId": 1
}
```

#### `GET /api/enemies`
Lista todos os inimigos do usuário

#### `DELETE /api/enemies/:id`
Deleta um inimigo específico

### Mapas

#### `POST /api/maps`
Cria um novo mapa
```json
// Request
{
  "name": "Floresta Sombria",
  "grid": [[{}, {}, ...], ...],
  "rows": 8,
  "cols": 8
}

// Response
{
  "success": true,
  "mapId": 1
}
```

#### `GET /api/maps`
Lista todos os mapas do usuário
```json
// Response
[
  {
    "id": 1,
    "name": "Floresta Sombria",
    "grid": [[{}, {}, ...], ...],
    "rows": 8,
    "cols": 8
  }
]
```

#### `DELETE /api/maps/:id`
Deleta um mapa específico

## Componentes Principais

### `App.jsx`
Componente raiz que gerencia:
- Estado de autenticação
- Carregamento de dados do usuário
- Roteamento entre Auth e aplicação principal
- Estado global de personagens, inimigos e mapas

### `Auth.jsx`
- Interface de login/registro
- Validação de formulários
- Comunicação com API de autenticação
- Persistência de sessão

### `CharacterCreator.jsx`
- Formulário de criação de personagens
- Sistema de classes e raças
- Cálculo automático de bônus
- Visualização de personagens criados
- Integração com API

### `EnemyCreator.jsx`
- Seleção de tipo de inimigo
- Customização de estatísticas
- Preview de sprites
- Lista de inimigos criados

### `MapEditor.jsx`
- **Estado Principal**:
  - `grid`: Array 2D do mapa
  - `selectedTile`: Tile selecionado do tileset
  - `selectedType`: "tile" ou "enemy"
  - `selectedEnemyIdx`: Índice do inimigo selecionado
  
- **Layout de 3 Colunas**:
  1. Seletor de Tileset (8x9 grid)
  2. Grid do Mapa (editável)
  3. Ferramentas e seletor de inimigos

- **Sistema de Tiles**:
  - Tileset: 64x72px
  - Tamanho do tile: 8x8px
  - Renderização pixelada
  - Background positioning preciso

### `PlayScreen.jsx`
- Seleção de mapa
- Seleção de personagens
- Sistema de turnos
- Cálculo de combate
- Gerenciamento de estado de jogo

### `AnimatedEnemySprite`
Componente reutilizável para exibição de sprites animados:
- Suporta personagens e inimigos
- Modo selecionável
- Exibição opcional de stats
- Animação de hover
- Integração com sistema de combate

## Sistema de Classes

### Guerreiro
- HP Base: 30 | ATK: 7 | SPD: 3 | AC: 16
- Tipo: Melee | Alcance: 1
- Sprite: `/sprites/knight.png`
- Tanque resistente com alta defesa

### Ladino
- HP Base: 22 | ATK: 5 | SPD: 6 | AC: 14
- Tipo: Ranged | Alcance: 3
- Sprite: `/sprites/rogue.png`
- Ágil com alcance médio

### Feiticeiro
- HP Base: 18 | ATK: 9 | SPD: 2 | AC: 10
- Tipo: Ranged | Alcance: 7
- Sprite: `/sprites/wizard.png`
- Alto dano mágico de longo alcance

## Sistema de Raças

Cada raça fornece bônus únicos de atributos e estatísticas:

### Humano
- **Bônus**: +1 STR, +1 DEX, +1 INT, +1 CHA
- **Stats**: SPD +4
- **Descrição**: Versátil e equilibrado

### Elfo
- **Bônus**: +2 DEX, +1 INT, +1 CHA
- **Stats**: -2 HP, SPD +5, AC +1
- **Descrição**: Ágil e perceptivo

### Orc
- **Bônus**: +2 STR, -1 INT, -1 CHA
- **Stats**: +3 HP, +2 ATK, SPD +3, AC -1
- **Descrição**: Forte e resistente

### Gigante
- **Bônus**: +3 STR, -2 DEX
- **Stats**: +5 HP, +1 ATK, SPD +2
- **Descrição**: Massivo e poderoso

### Ogro
- **Bônus**: +3 STR, -1 DEX, -2 INT, -2 CHA
- **Stats**: +4 HP, +2 ATK, SPD +2, AC +1
- **Descrição**: Brutal e intimidador

### Halfling
- **Bônus**: -1 STR, +2 DEX, +2 CHA
- **Stats**: -3 HP, SPD +6, AC +2
- **Descrição**: Pequeno e evasivo

### Gnomo
- **Bônus**: -1 STR, +1 DEX, +2 INT, +1 CHA
- **Stats**: -2 HP, SPD +5, AC +1
- **Descrição**: Inteligente e curioso

## Tipos de Inimigos

### Família Orc

#### Orc Básico
- HP: 18 | ATK: 5 | SPD: 2 | AC: 12
- Forte mas lento

#### Orc Guerreiro
- HP: 28 | ATK: 7 | SPD: 2 | AC: 15
- Tanque corpo a corpo, muito resistente

#### Orc Xamã
- HP: 14 | ATK: 6 | SPD: 3 | AC: 10
- Mago com alto dano, baixa defesa

#### Orc Arqueiro
- HP: 16 | ATK: 6 | SPD: 4 | AC: 11
- Rápido com alcance longo

### Família Esqueleto (Mortos-Vivos)

#### Esqueleto Básico
- HP: 12 | ATK: 4 | SPD: 3 | AC: 9
- Frágil mas ágil

#### Esqueleto Guerreiro
- HP: 15 | ATK: 5 | SPD: 3 | AC: 13
- Guerreiro equilibrado

#### Esqueleto Mago
- HP: 10 | ATK: 7 | SPD: 4 | AC: 8
- Glass cannon mágico (alto dano, baixa defesa)

#### Esqueleto Arqueiro
- HP: 11 | ATK: 5 | SPD: 6 | AC: 10
- Assassino muito rápido

