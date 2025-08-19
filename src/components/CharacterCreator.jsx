import React, { useState } from 'react';

export default function CharacterCreator({ characters, setCharacters }) {
  const [name, setName] = useState("");
  const [cls, setCls] = useState("");
  const [hp, setHp] = useState(10);
  const [atk, setAtk] = useState(5);
  const [spd, setSpd] = useState(5);
  const [error, setError] = useState("");

  function handleInput(setter) {
    return e => setter(e.target.value);
  }

  function handleNumber(setter) {
    return e => setter(Number(e.target.value));
  }

  function addChar() {
    if (!name || !cls) {
      setError("Nome e Classe são obrigatórios!");
      return;
    }
    setCharacters([...characters, { name, cls, hp, atk, spd, currentHp: hp }]);
    setName(""); setCls(""); setHp(10); setAtk(5); setSpd(5);
    setError("");
  }

  function renderList() {
    return characters.map((c, i) =>
      <li key={i}>
        <span className="status-highlight">{c.name}</span> ({c.cls}) - <span style={{ color: "#22c55e" }}>HP:{c.hp}</span> / <span style={{ color: "#3b82f6" }}>ATK:{c.atk}</span> / <span style={{ color: "#a21caf" }}>SPD:{c.spd}</span>
      </li>
    );
  }

  return (
    <div className="flex-col" style={{ gap: "1rem" }}>
      <input
        placeholder="Nome"
        value={name}
        onChange={handleInput(setName)}
        className={`border p-1 w-full${error && !name ? " status-dead" : ""}`}
      />
      <input
        placeholder="Classe"
        value={cls}
        onChange={handleInput(setCls)}
        className={`border p-1 w-full${error && !cls ? " status-dead" : ""}`}
      />
      <div className="flex-row" style={{ gap: "0.5rem" }}>
        <input type="number" placeholder="HP" value={hp} min={1} max={999} onChange={handleNumber(setHp)} className="border p-1 w-40px" />
        <input type="number" placeholder="Atk" value={atk} min={1} max={999} onChange={handleNumber(setAtk)} className="border p-1 w-40px" />
        <input type="number" placeholder="Agilidade" value={spd} min={1} max={999} onChange={handleNumber(setSpd)} className="border p-1 w-40px" />
      </div>
      {error && <div className="status-dead" style={{ fontWeight: 500 }}>{error}</div>}
      <button onClick={addChar} className="btn btn-primary w-full">Adicionar Personagem</button>
      <ul className="list-disc pl-5 text-white">
        {renderList()}
      </ul>
    </div>
  );
}