import React, { useState } from 'react';

const CLASS_CONFIG = {
  Guerreiro: { hp: 30, atk: 7, attackType: 'Melee', range: 1 },
  Arqueiro: { hp: 20, atk: 5, attackType: 'Ranged', range: 8 },
  Mago: { hp: 18, atk: 6, attackType: 'Ranged', range: 6 },
  Ladino: { hp: 22, atk: 5, attackType: 'Ranged', range: 6 },
  Feiticeiro: { hp: 16, atk: 7, attackType: 'Ranged', range: 7 },
};

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
  const [ac, setAc] = useState(10);

  function handleInput(setter) {
    return e => setter(e.target.value);
  }

  // Classe define HP, ATK, tipo e alcance
  function handleClassChange(e) {
    const value = e.target.value;
    setCls(value);

    const cfg = CLASS_CONFIG[value];
    if (cfg) {
      setHp(cfg.hp);
      setAtk(cfg.atk);
      setAttackType(cfg.attackType);
      setRange(cfg.range);
    } else {
      setHp(10);
      setAtk(5);
      setAttackType("");
      setRange(1);
    }
  }

  // Raça define velocidade
  function handleRaceChange(e) {
    const value = e.target.value;
    setRace(value);
    if (["Humano", "Elfo", "Orc"].includes(value)) setSpd(4);
    else if (["Gigante", "Ogro"].includes(value)) setSpd(6);
    else if (["Halfling", "Gnomo"].includes(value)) setSpd(2);
    else setSpd(5);
  }

  function addChar() {
    if (!name || !cls || !race) {
      setError("Nome, Classe e Raça são obrigatórios!");
      return;
    }
    setCharacters([
      ...characters,
      {
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
      }
    ]);
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
  }

  function renderList() {
    return characters.map((c, i) => (
      <li key={i}>
        <span className="status-highlight">{c.name}</span> ({c.cls}, {c.race}) —
        <span style={{ color: "#22c55e" }}> HP:{c.hp}</span> /
        <span style={{ color: "#3b82f6" }}> ATK:{c.atk}</span> /
        <span style={{ color: "#a21caf" }}> SPD:{c.spd}</span> /
        <span style={{ color: "#f59e0b" }}>
          {" "}ATQ:{c.attackType}{c.attackType ? ` (alcance ${c.range})` : ""}
        </span> /
        <span> 💪FOR:{c.str} 🎯DES:{c.dex} 🧠INT:{c.int} 😎CAR:{c.cha} 🛡AC:{c.ac}</span>
      </li>
    ));
  }

  return (
    <div className="flex-col" style={{ gap: "1rem" }}>
      <input
        placeholder="Nome"
        value={name}
        onChange={handleInput(setName)}
        className={`border p-1 w-full${error && !name ? " status-dead" : ""}`}
      />

      {/* Raça */}
      <select
        value={race}
        onChange={handleRaceChange}
        className={`border p-1 w-full${error && !race ? " status-dead" : ""}`}
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

      {/* Classe */}
      <select
        value={cls}
        onChange={handleClassChange}
        className={`border p-1 w-full${error && !cls ? " status-dead" : ""}`}
      >
        <option value="">Selecione a Classe</option>
        <option value="Guerreiro">Guerreiro</option>
        <option value="Mago">Mago</option>
        <option value="Arqueiro">Arqueiro</option>
        <option value="Ladino">Ladino</option>
        <option value="Feiticeiro">Feiticeiro</option>
      </select>

      {/* Atributos principais */}
      <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center" }}>
        ❤️ HP:
        <input
          type="number"
          readOnly
          value={hp}
          onChange={handleInput(setHp)}
          className="border p-1 w-40px"
        />
        ⚔️ ATK:
        <input
          type="number"
          readOnly
          value={atk}
          onChange={handleInput(setAtk)}
          className="border p-1 w-40px"
        />
        🏃 SPD:
        <input
          readOnly
          type="number"
          value={spd}
          onChange={handleInput(setSpd)}
          className="border p-1 w-40px"
        />
      </div>

      {/* Atributos secundários */}
      <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        💪 Força:<input type="number" value={str} onChange={handleInput(setStr)} className="border p-1 w-20"/>
        🎯 Destreza:<input type="number" value={dex} onChange={handleInput(setDex)} className="border p-1 w-20"/>
        🧠 Inteligência:<input type="number" value={int} onChange={handleInput(setInt)} className="border p-1 w-20"/>
        😎 Carisma:<input type="number" value={cha} onChange={handleInput(setCha)} className="border p-1 w-20"/>
        🛡 CA:<input type="number" value={ac} onChange={handleInput(setAc)} className="border p-1 w-20"/>
      </div>

      {cls && (
        <div className="text-sm text-white/80">
          Ataque da classe: <b>{attackType || "—"}</b>
          {attackType && <> | Alcance: <b>{range}</b></>}
        </div>
      )}

      {error && <div className="status-dead" style={{ fontWeight: 500 }}>{error}</div>}

      <button onClick={addChar} className="btn btn-primary w-full">Adicionar Personagem</button>

      <ul className="list-disc pl-5 text-white">
        {renderList()}
      </ul>
    </div>
  );
}
