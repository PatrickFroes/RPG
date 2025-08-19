import React, { useState } from 'react';

export default function MapEditor({ maps, setMaps }) {
  const [size, setSize] = useState(8);
  const [grid, setGrid] = useState([]);
  const [editing, setEditing] = useState(false);
  const [selectedType, setSelectedType] = useState('floor');

  function initGrid() {
    setGrid(Array(size).fill(null).map(() => Array(size).fill("floor")));
    setEditing(true);
  }

  function updateCell(row, col) {
    if (!editing) return;
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = selectedType;
    setGrid(newGrid);
  }

  function saveMap() {
    setMaps([...maps, grid]);
    setGrid([]);
    setEditing(false);
  }

  function cellIcon(cell) {
    if (cell === 'wall') return '🧱';
    if (cell === 'enemy') return '🐲';
    return '';
  }

  function renderTypeButton(type, label, btnClass) {
    return (
      <button
        className={`btn ${btnClass} ${selectedType === type ? 'status-highlight' : ''}`}
        onClick={() => setSelectedType(type)}
        type="button"
      >{label}</button>
    );
  }

  function renderGrid() {
    return grid.map((row, i) =>
      row.map((cell, j) => (
        <div
          key={`${i}-${j}`}
          onClick={() => updateCell(i, j)}
          className={`cell ${cell === 'wall' ? 'cell-wall' : cell === 'floor' ? 'cell-floor' : 'cell-enemy'}`}
          title={`(${i},${j})`}
        >
          {cell === 'wall'
            ? <span style={{ width: "100%", height: "100%", display: "block", background: "#3f3f46", borderRadius: 4 }} />
            : cellIcon(cell)
          }
        </div>
      ))
    );
  }

  return (
    <div>
      <div className="flex-row" style={{ gap: "0.5rem" }}>
        <button onClick={initGrid} className="btn btn-primary">Iniciar Grid</button>
        <input
          type="number"
          min="5"
          max="20"
          value={size}
          onChange={e => setSize(Number(e.target.value))}
          className="border p-1 w-40px"
          disabled={editing}
        />
        <span>tamanho do mapa</span>
      </div>
      {grid.length > 0 && (
        <div className="flex-col mt-4" style={{ gap: "1rem" }}>
          <div className="flex-row" style={{ gap: "0.5rem" }}>
            {renderTypeButton('floor', 'Chão', 'btn-success')}
            {renderTypeButton('wall', 'Parede', 'btn-neutral')}
            {renderTypeButton('enemy', 'Inimigo', 'btn-danger')}
          </div>
          <div
            className="grid-map"
            style={{
              gridTemplateColumns: `repeat(${size}, 40px)`
            }}
          >
            {renderGrid()}
          </div>
          <button
            onClick={saveMap}
            className="btn btn-primary"
            disabled={!editing}
          >
            Salvar Mapa
          </button>
        </div>
      )}
    </div>
  );
}