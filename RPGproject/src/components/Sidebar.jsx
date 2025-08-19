import React from 'react';

export default function Sidebar({ setMode }) {
  return (
    <aside className="sidebar w-sidebar p-4 flex-col">
      <h1 className="sidebar-title">RPG Creator</h1>
      <button onClick={() => setMode("map")} className="btn btn-primary">Criar Mapa</button>
      <button onClick={() => setMode("char")} className="btn btn-secondary">Criar Personagem</button>
      <button onClick={() => setMode("play")} className="btn btn-success">Jogar</button>
    </aside>
  );
}