import React, { useState } from 'react';

export default function MapEditor({ maps, setMaps, enemies }) {
  const [size, setSize] = useState(8);
  const [grid, setGrid] = useState([]);
  const [editing, setEditing] = useState(false);
  const [selectedType, setSelectedType] = useState('floor');
  const [selectedEnemyIdx, setSelectedEnemyIdx] = useState(null); // índice do inimigo selecionado

  function initGrid() {
    setGrid(Array(size).fill(null).map(() => Array(size).fill("floor")));
    setEditing(true);
  }

  function updateCell(row, col) {
    if (!editing) return;
    const newGrid = grid.map(r => [...r]);

    if (selectedType === 'enemy' && selectedEnemyIdx !== null) {
      // coloca o inimigo selecionado na célula
      newGrid[row][col] = { type: 'enemy', enemy: enemies[selectedEnemyIdx] };
    } else {
      newGrid[row][col] = selectedType;
    }

    setGrid(newGrid);
  }

  function saveMap() {
    setMaps([...maps, grid]);
    setGrid([]);
    setEditing(false);
  }

  function cellIcon(cell) {
    if (cell === 'wall') return '🧱';
    if (cell.type === 'enemy') return '🐲';
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
          className={`cell ${
            cell === 'wall' ? 'cell-wall' :
            cell === 'floor' ? 'cell-floor' :
            cell?.type === 'enemy' ? 'cell-enemy' : ''
          }`}
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
          <div className="flex-row" style={{ gap: "0.5rem", alignItems: "center" }}>
            {renderTypeButton('floor', 'Chão', 'btn-success')}
            {renderTypeButton('wall', 'Parede', 'btn-neutral')}
            {renderTypeButton('enemy', 'Inimigo', 'btn-danger')}

            {selectedType === 'enemy' && enemies.length > 0 && (
              <select
                value={selectedEnemyIdx ?? ""}
                onChange={e => setSelectedEnemyIdx(e.target.value !== "" ? Number(e.target.value) : null)}
                className="border p-1"
              >
                <option value="">Escolha o inimigo</option>
                {enemies.map((en, i) => <option key={i} value={i}>{en.name}</option>)}
              </select>
            )}
          </div>

          <div
            className="grid-map"
            style={{ gridTemplateColumns: `repeat(${size}, 40px)` }}
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
