import React, { useState } from 'react';
import { CLASS_CONFIG, RACE_BONUS_CONFIG } from "../data/entityData.js"
import { Container } from "./Containers"
import { Button } from "./Inputs"
import AnimatedEnemySprite from "../data/functions.jsx"
import { saveCharacter, removeCharacter, toggleCharacterFavorite, loadCharacters, updateCharacter } from "../api"


export default function CharacterCreator({ characters, setCharacters }) {
  const [name, setName] = useState("");
  const [cls, setCls] = useState("");
  const [race, setRace] = useState("");
  const [hp, setHp] = useState(10);
  const [atk, setAtk] = useState(5);
  const [spd, setSpd] = useState(5);
  const [attackType, setAttackType] = useState("");
  const [range, setRange] = useState(1);
  const [error, setError] = useState("");

  // atributos
  const [str, setStr] = useState(0);
  const [dex, setDex] = useState(0);
  const [int, setInt] = useState(0);
  const [cha, setCha] = useState(0);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [ac, setAc] = useState(10);
  const [editingId, setEditingId] = useState(null);

  function handleInput(setter) {
    return e => setter(e.target.value);
  }

  // Classe define HP, ATK, tipo e alcance
  function handleClassChange(classValue) {
    setCls(classValue);

    const cfg = CLASS_CONFIG[classValue];
    const raceBonus = RACE_BONUS_CONFIG[race];
    
    if (cfg) {
      // Stats base da classe
      let finalHp = cfg.hp;
      let finalAtk = cfg.atk;
      let finalSpd = cfg.spd;
      let finalAc = cfg.ac;
      
      // Aplica bônus de raça se houver
      if (raceBonus) {
        finalHp += raceBonus.hp;
        finalAtk += raceBonus.atk;
        finalSpd += raceBonus.spd;
        finalAc += raceBonus.ac;
      }
      
      setHp(finalHp);
      setAtk(finalAtk);
      setSpd(finalSpd);
      setAc(finalAc);
      setAttackType(cfg.attackType);
      setRange(cfg.range);
    } else {
      setHp(10);
      setAtk(5);
      setSpd(5);
      setAc(10);
      setAttackType("");
      setRange(1);
    }
  }

  // Raça aplica bônus de stats
  function handleRaceChange(e) {
    const value = e.target.value;
    setRace(value);
    
    const raceBonus = RACE_BONUS_CONFIG[value];
    const classConfig = CLASS_CONFIG[cls];
    
    if (raceBonus && classConfig) {
      // Aplica bônus de raça sobre os stats base da classe
      setHp(classConfig.hp + raceBonus.hp);
      setAtk(classConfig.atk + raceBonus.atk);
      setSpd(classConfig.spd + raceBonus.spd);
      setAc(classConfig.ac + raceBonus.ac);
      
      // Aplica bônus de atributos
      setStr(raceBonus.str);
      setDex(raceBonus.dex);
      setInt(raceBonus.int);
      setCha(raceBonus.cha);
    } else if (raceBonus) {
      // Se não tem classe selecionada, aplica apenas velocidade base
      setSpd(raceBonus.spd);
      setStr(raceBonus.str);
      setDex(raceBonus.dex);
      setInt(raceBonus.int);
      setCha(raceBonus.cha);
    }
  }

  async function addChar() {
    if (!name || !cls || !race) {
      setError("Nome, Classe e Raça são obrigatórios!");
      return;
    }
    
    const cfg = CLASS_CONFIG[cls];
    const newCharacter = {
      name,
      cls,
      race,
      hp,
      atk,
      spd,
      currentHp: hp,
      attackType,
      range,
      str,
      dex,
      int,
      cha,
      ac,
      spriteUrl: cfg?.spriteUrl || null,
      alive: true
    };

    try {
      if (editingId) {
        // Modo de edição
        await updateCharacter(editingId, newCharacter);
        const updatedCharacters = characters.map(c => 
          c.id === editingId ? { ...newCharacter, id: editingId } : c
        );
        setCharacters(updatedCharacters);
        setEditingId(null);
      } else {
        // Modo de criação
        await saveCharacter(newCharacter);
        setCharacters([...characters, newCharacter]);
      }
      
      // Limpar formulário
      setName("");
      setCls("");
      setRace("");
      setHp(10);
      setAtk(5);
      setSpd(5);
      setAttackType("");
      setRange(1);
      setStr(0);
      setDex(0);
      setInt(0);
      setCha(0);
      setAc(10);
      setError("");
    } catch (error) {
      setError("Erro ao salvar personagem: " + error.message);
    }
  }

  async function handleDeleteCharacter(id, index) {
    try {
      if (id) {
        await removeCharacter(id);
      }
      setCharacters(characters.filter((_, i) => i !== index));
    } catch (error) {
      setError("Erro ao deletar personagem: " + error.message);
    }
  }

  const handleToggleFavorite = async (characterId, idx) => {
    try {
      await toggleCharacterFavorite(characterId);
      const updatedCharacters = [...characters];
      updatedCharacters[idx] = { 
        ...updatedCharacters[idx], 
        isFavorite: !updatedCharacters[idx].isFavorite 
      };
      setCharacters(updatedCharacters);
    } catch (error) {
      console.error('Erro ao marcar favorito:', error);
    }
  };

  const handleEditCharacter = (character) => {
    setEditingId(character.id);
    setName(character.name);
    setCls(character.cls);
    setRace(character.race);
    setHp(character.hp);
    setAtk(character.atk);
    setSpd(character.spd);
    setAc(character.ac);
    setAttackType(character.attackType);
    setRange(character.range);
    setStr(character.str || 0);
    setDex(character.dex || 0);
    setInt(character.int || 0);
    setCha(character.cha || 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setCls("");
    setRace("");
    setHp(10);
    setAtk(5);
    setSpd(5);
    setAttackType("");
    setRange(1);
    setStr(0);
    setDex(0);
    setInt(0);
    setCha(0);
    setAc(10);
    setError("");
  };

  const exportCharacters = () => {
    const dataStr = JSON.stringify(characters, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personagens_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCharacters = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (!Array.isArray(importedData)) {
          alert('Formato de arquivo inválido');
          return;
        }
        
        // Salvar cada personagem importado
        for (const char of importedData) {
          try {
            await saveCharacter(char);
          } catch (error) {
            console.error('Erro ao importar personagem:', char.name, error);
          }
        }
        
        // Recarregar a lista
        const updated = await loadCharacters();
        setCharacters(updated);
        alert(`${importedData.length} personagem(ns) importado(s) com sucesso!`);
      } catch (error) {
        console.error('Erro ao importar:', error);
        alert('Erro ao importar arquivo JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-4xl font-bold text-center mb-6">Criador de Personagens</h2>

      {/* Seleção Visual de Classes */}
      <div>
        <h3 className="text-lg font-semibold p-4 text-gray-400">Selecionar Classe</h3>
        <Container className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4">
          {Object.entries(CLASS_CONFIG).map(([className, config]) => (
            <AnimatedEnemySprite
              key={className}
              enemy={{
                id: className,
                name: className,
                spriteUrl: config.spriteUrl,
                stats: {
                  hp: config.hp,
                  atk: config.atk,
                  spd: config.spd,
                  ac: config.ac
                }
              }}
              isSelected={cls === className}
              onClick={() => handleClassChange(className)}
              size={64}
            />
          ))}
        </Container>
      </div>

      {/* Stats principais */}
      <Container className="p-4">
         <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome:</label>
            <input
              placeholder="Nome do personagem"
              value={name}
              onChange={handleInput(setName)}
              className={`w-full bg-[#123240] text-white border ${error && !name ? "border-red-500" : "border-gray-500"} rounded px-2 py-1 focus:border-cyan-300 focus:outline-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Raça:</label>
            <select
              value={race}
              onChange={handleRaceChange}
              className={`w-full bg-[#123240] text-white border ${error && !race ? "border-red-500" : "border-gray-500"} rounded px-2 py-1 focus:border-cyan-300 focus:outline-none`}
            >
              <option value="">Selecione a Raça</option>
              <option value="Humano">Humano</option>
              <option value="Elfo">Elfo</option>
              <option value="Orc">Orc</option>
              <option value="Gigante">Gigante</option>
              <option value="Ogro">Ogro</option>
              <option value="Halfling">Halfling</option>
              <option value="Gnomo">Gnomo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Classe:</label>
            <input
              type="text"
              value={cls}
              readOnly
              placeholder="Selecione acima"
              className="w-full bg-[#0a1f2e] text-white border border-gray-500 rounded px-2 py-1 cursor-not-allowed"
            />
          </div>
        </div>

        {cls && (
          <div className="mt-3 text-sm text-gray-300 bg-[#1a3a47] p-2 rounded">
            <strong>Ataque da classe:</strong> {attackType || "—"} 
            {attackType && <> | <strong>Alcance:</strong> {range}</>}
          </div>
        )}
        
        {race && (
          <div className="mt-3 text-sm text-gray-300 bg-[#1a3a47] p-2 rounded">
            <strong>Raça:</strong> {race} - {RACE_BONUS_CONFIG[race]?.description}
            <div className="mt-1 text-xs">
              <strong>Bônus:</strong> {' '}
              {RACE_BONUS_CONFIG[race]?.hp !== 0 && `HP ${RACE_BONUS_CONFIG[race]?.hp > 0 ? '+' : ''}${RACE_BONUS_CONFIG[race]?.hp} `}
              {RACE_BONUS_CONFIG[race]?.atk !== 0 && `ATK ${RACE_BONUS_CONFIG[race]?.atk > 0 ? '+' : ''}${RACE_BONUS_CONFIG[race]?.atk} `}
              {RACE_BONUS_CONFIG[race]?.spd !== 0 && `SPD ${RACE_BONUS_CONFIG[race]?.spd > 0 ? '+' : ''}${RACE_BONUS_CONFIG[race]?.spd} `}
              {RACE_BONUS_CONFIG[race]?.ac !== 0 && `AC ${RACE_BONUS_CONFIG[race]?.ac > 0 ? '+' : ''}${RACE_BONUS_CONFIG[race]?.ac}`}
            </div>
          </div>
        )}
      </Container>

      {/* Stats principais */}
      <Container className="p-4">
        <h3 className="text-lg font-semibold mb-4">Atributos Principais</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 border border-red-700 rounded">
            <label className="block text-xs text-gray-300 mb-1">❤️ HP</label>
            <input
              type="number"
              readOnly
              value={hp}
              className="w-full bg-transparent text-center text-2xl font-bold border-none focus:outline-none"
            />
          </div>
          <div className="text-center p-3 border border-yellow-700 rounded">
            <label className="block text-xs text-gray-300 mb-1">⚔️ ATK</label>
            <input
              type="number"
              readOnly
              value={atk}
              className="w-full bg-transparent text-center text-2xl font-bold border-none focus:outline-none"
            />
          </div>
          <div className="text-center p-3 border border-blue-700 rounded">
            <label className="block text-xs text-gray-300 mb-1">🏃 SPD</label>
            <input
              type="number"
              readOnly
              value={spd}
              className="w-full bg-transparent text-center text-2xl font-bold border-none focus:outline-none"
            />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-4">Atributos Secundários</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">💪 Força:</label>
            <input
              type="number"
              value={str}
              onChange={handleInput(setStr)}
              className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">🎯 Destreza:</label>
            <input
              type="number"
              value={dex}
              onChange={handleInput(setDex)}
              className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">🧠 Inteligência:</label>
            <input
              type="number"
              value={int}
              onChange={handleInput(setInt)}
              className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">😎 Carisma:</label>
            <input
              type="number"
              value={cha}
              onChange={handleInput(setCha)}
              className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">🛡 CA:</label>
            <input
              type="number"
              value={ac}
              onChange={handleInput(setAc)}
              className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none text-center"
            />
          </div>
        </div>
      </Container>


      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded text-center font-medium">
          {error}
        </div>
      )}

      {editingId && (
        <div className="bg-yellow-900/20 border border-yellow-600 p-3 rounded text-center">
          <p className="text-yellow-400">Editando personagem. Clique em "Atualizar" para salvar as alterações.</p>
          <Button onClick={handleCancelEdit} variant="default" className="mt-2">
            Cancelar Edição
          </Button>
        </div>
      )}

      <Button
        onClick={addChar}
        className="w-full"
        variant="play"
      >
        {editingId ? '✏️ Atualizar Personagem' : '✨ Adicionar Personagem'}
      </Button>

      {/* Lista de personagens criados */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            Personagens Criados <span className={`${characters.length === 0 ? "text-gray-400" : "text-green-400"}`}>({characters.filter(c => !showOnlyFavorites || c.isFavorite).length})</span>:
          </h3>
          <div className="flex gap-2">
            <label className="px-3 py-1 rounded text-sm transition-colors bg-blue-700 text-white hover:bg-blue-600 cursor-pointer" title="Importar personagens de JSON">
              ↑ Importar JSON
              <input type="file" accept=".json" onChange={importCharacters} className="hidden" />
            </label>
            <button
              onClick={exportCharacters}
              disabled={characters.length === 0}
              className="px-3 py-1 rounded text-sm transition-colors bg-green-700 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Exportar personagens em JSON"
            >
              ↓ Exportar JSON
            </button>
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                showOnlyFavorites 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-500' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {showOnlyFavorites ? '★ Apenas Favoritos' : '☆ Mostrar Favoritos'}
            </button>
          </div>
        </div>
        {characters.length === 0 ? (
          <Container className="text-center py-8">
            <div className="text-gray-400">Nenhum personagem criado ainda</div>
            <p className="text-gray-500 text-sm mt-2">Preencha os campos acima para criar seu primeiro personagem!</p>
          </Container>
        ) : (
          <Container className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.filter(c => !showOnlyFavorites || c.isFavorite).map((c, i) => (
              <div key={i} className="p-4 border border-gray-500 rounded bg-[#0a1f2e]">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {c.spriteUrl && (
                      <div className="shrink-0">
                        <AnimatedEnemySprite 
                          enemy={{ spriteUrl: c.spriteUrl, name: c.name }} 
                          showName={false}
                          size={32}
                          mainClass="border-0 p-0 ring-0 cursor-default hover:brightness-100"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-2xl text-cyan-400">{c.name}</h4>
                      <p className="text-sm text-gray-400">{c.race} • {c.cls}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditCharacter(c)}
                    className="w-8 h-8 flex items-center justify-center rounded bg-blue-600/80 hover:bg-blue-500 text-white transition-all hover:scale-110 shadow-lg"
                    title="Editar personagem"
                  >
                    <span className="text-sm">✏️</span>
                  </button>
                  <button
                    onClick={() => handleToggleFavorite(c.id, i)}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-all hover:scale-110 shadow-lg ${
                      c.isFavorite 
                        ? 'bg-yellow-500/80 hover:bg-yellow-400 text-white' 
                        : 'bg-gray-600/80 hover:bg-gray-500 text-gray-300'
                    }`}
                    title={c.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <span className="text-sm">{c.isFavorite ? '★' : '☆'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCharacter(c.id, i)}
                    className="w-8 h-8 flex items-center justify-center rounded bg-red-600/80 hover:bg-red-500 text-white transition-all hover:scale-110 shadow-lg"
                    title="Deletar personagem"
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                </div>
              </div>                {/* Stats principais */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-red-900/20 border border-red-700/50 rounded">
                    <div className="text-sm font-bold">❤️ {c.hp}</div>
                    <div className="text-xs text-gray-400">HP</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-900/20 border border-yellow-700/50 rounded">
                    <div className="text-sm font-bold">⚔️ {c.atk}</div>
                    <div className="text-xs text-gray-400">ATK</div>
                  </div>
                  <div className="text-center p-2 bg-blue-900/20 border border-blue-700/50 rounded">
                    <div className="text-sm font-bold">🏃 {c.spd}</div>
                    <div className="text-xs text-gray-400">SPD</div>
                  </div>
                </div>

                {/* Atributos secundários */}
                <div className="text-xs text-gray-300 space-y-1">
                  <div className="flex justify-between">
                    <span>💪 Força: <strong>{c.str}</strong></span>
                    <span>🎯 Destreza: <strong>{c.dex}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>🧠 Inteligência: <strong>{c.int}</strong></span>
                    <span>😎 Carisma: <strong>{c.cha}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>🛡 CA: <strong>{c.ac}</strong></span>
                    <span>⚔️ Ataque: <strong>{c.attackType} ({c.range})</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </Container>
        )}
      </div>
    </div>
  );
}
