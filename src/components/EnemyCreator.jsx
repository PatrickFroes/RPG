import React, { useState } from 'react';

export default function EnemyCreator({ enemies, setEnemies }) {
  const [name, setName] = useState("");
  const [cls, setCls] = useState("Monstro");
  const [attackType, setAttackType] = useState("melee");
  const [range, setRange] = useState(1);

  // Atributos principais
  const [hp, setHp] = useState(10);
  const [atk, setAtk] = useState(3);
  const [spd, setSpd] = useState(3);

  // Atributos secundários
  const [str, setStr] = useState(3);
  const [dex, setDex] = useState(3);
  const [int, setInt] = useState(3);
  const [cha, setCha] = useState(3);
  const [ac, setAc] = useState(12);

  const handleInput = setter => e => setter(Number(e.target.value));

  const addEnemy = () => {
    if (!name) return;
    setEnemies([...enemies, {
      name, cls, attackType, range,
      hp, atk, spd, str, dex, int, cha, ac,
      currentHp: hp,
      alive: true
    }]);
    // reset
    setName("");
    setCls("Monstro");
    setAttackType("melee");
    setRange(1);
    setHp(10); setAtk(3); setSpd(3);
    setStr(3); setDex(3); setInt(3); setCha(3); setAc(12);
  };

  return (
    <div className="flex-col" style={{ gap: "1rem" }}>
      <h2>Criador de Inimigos</h2>
      <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center" }}>
        Nome:<input type="text" value={name} onChange={e => setName(e.target.value)} className="border p-1 w-40"/>
        Classe:<input type="text" value={cls} onChange={e => setCls(e.target.value)} className="border p-1 w-40"/>
        Tipo:<select value={attackType} onChange={e => setAttackType(e.target.value)} className="border p-1">
          <option value="melee">Melee</option>
          <option value="ranged">Ranged</option>
        </select>
        {attackType === 'ranged' && <span>Alcance: <input type="number" value={range} onChange={e => setRange(Number(e.target.value))} className="border p-1 w-20" /></span>}
      </div>

      {/* Atributos principais */}
      <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center" }}>
        ❤️ HP:<input type="number" value={hp} onChange={handleInput(setHp)} className="border p-1 w-40"/>
        ⚔️ ATK:<input type="number" value={atk} onChange={handleInput(setAtk)} className="border p-1 w-40"/>
        🏃 SPD:<input type="number" value={spd} onChange={handleInput(setSpd)} className="border p-1 w-40"/>
      </div>

      {/* Atributos secundários */}
      <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        💪 Força:<input type="number" value={str} onChange={handleInput(setStr)} className="border p-1 w-20"/>
        🎯 Destreza:<input type="number" value={dex} onChange={handleInput(setDex)} className="border p-1 w-20"/>
        🧠 Inteligência:<input type="number" value={int} onChange={handleInput(setInt)} className="border p-1 w-20"/>
        😎 Carisma:<input type="number" value={cha} onChange={handleInput(setCha)} className="border p-1 w-20"/>
        🛡 CA:<input type="number" value={ac} onChange={handleInput(setAc)} className="border p-1 w-20"/>
      </div>

      <button className="btn btn-primary" onClick={addEnemy}>Adicionar Inimigo</button>

      <h3>Inimigos Criados:</h3>
      <ul>
        {enemies.map((e, i) => (
          <li key={i}>
            {e.name} ({e.cls}) ❤️{e.hp} ⚔️{e.atk} 🏃{e.spd} 🛡{e.ac} {e.attackType === 'ranged' ? `• Alcance ${e.range}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
