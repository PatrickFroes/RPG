import React, { useState } from 'react';

// Adjacência (melee)
function isAdjacent(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

// Rola D20
function DiceRole(sides = 20) {
  return Math.floor(Math.random() * sides) + 1;
}

// Distância Manhattan (para ranged)
function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Verifica se jogador pode atacar alvo: melee (adjacente) ou ranged (≤ range)
function canPlayerAttackTarget(player, enemy) {
  if (!player || !enemy) return false;
  const type = (player.attackType || '').toLowerCase();
  if (type === 'ranged') {
    const r = Number(player.range || 0);
    return manhattanDistance(player, enemy) <= r;
  }
  // padrão: melee
  return isAdjacent(player, enemy);
}

// Atualiza vida e status
function updateHp(obj, damage) {
  const newHp = obj.currentHp !== undefined ? obj.currentHp - damage : obj.hp - damage;
  return {
    ...obj,
    currentHp: obj.currentHp !== undefined ? newHp : undefined,
    hp: obj.hp !== undefined ? newHp : undefined,
    alive: newHp > 0
  };
}

export default function PlayScreen({ maps, characters }) {
  const [step, setStep] = useState('pre'); // 'pre', 'selectMap', 'placePlayers', 'combat'
  const [selectedMap, setSelectedMap] = useState(null);
  const [mapGrid, setMapGrid] = useState([]);
  const [playerPositions, setPlayerPositions] = useState([]);
  const [enemyPositions, setEnemyPositions] = useState([]);
  const [log, setLog] = useState([]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [turnIdx, setTurnIdx] = useState(0);
  const [phase, setPhase] = useState('player'); // 'player' | 'enemy'
  const [selectedAction, setSelectedAction] = useState(null); // 'move' | 'attack' | 'pass'
  const [activeEnemyIdx, setActiveEnemyIdx] = useState(null);

  const handleStartCombat = () => {
    setStep('selectMap');
    setSelectedMap(null);
    setMapGrid([]);
    setPlayerPositions([]);
    setEnemyPositions([]);
    setLog([]);
    setTurnOrder([]);
    setTurnIdx(0);
    setPhase('player');
    setSelectedAction(null);
    setActiveEnemyIdx(null);
  };

  const handleSelectMap = (idx) => {
    const map = maps[idx];
    setSelectedMap(idx);
    setMapGrid(map);
    const enemies = [];
    map.forEach((row, i) => row.forEach((cell, j) => {
      if (cell === 'enemy') enemies.push({ x: j, y: i, hp: 10, atk: 3, spd: 3, ac: 12, name: `Monstro ${j},${i}`, alive: true });
    }));
    setEnemyPositions(enemies);
    setPlayerPositions(Array(characters.length).fill(null));
    setLog(["Posicione os jogadores clicando nas células livres."]);
    setStep('placePlayers');
  };

  // Posicionamento dos jogadores
  const handleCellClick = (i, j) => {
    if (step === 'placePlayers') {
      const idx = playerPositions.findIndex(p => !p);
      if (idx === -1) return;
      if (playerPositions.some(p => p && p.x === j && p.y === i)) return;
      if (mapGrid[i][j] === 'wall' || mapGrid[i][j] === 'enemy') return;
      const baseChar = characters[idx];
      const newPositions = [...playerPositions];
      newPositions[idx] = { x: j, y: i, ...baseChar, currentHp: baseChar.hp, alive: true };
      setPlayerPositions(newPositions);
      setLog(prev => [...prev, `${baseChar.name} posicionado em (${i},${j})`]);
      if (idx + 1 === characters.length) {
        const order = [
          ...newPositions.map((p, idx) => p && p.alive ? { type: 'player', idx, spd: p.spd } : null).filter(Boolean),
          ...enemyPositions.map((e, idx) => e && e.alive ? { type: 'enemy', idx, spd: e.spd } : null).filter(Boolean)
        ].sort((a, b) => b.spd - a.spd);
        setTurnOrder(order);
        setTurnIdx(0);
        setPhase(order[0].type);
        setLog(prev => [...prev, `Turno de ${order[0].type === 'player' ? newPositions[order[0].idx].name : enemyPositions[order[0].idx].name}.`]);
        setStep('combat');
      }
    } else if (step === 'combat' && phase === 'player' && selectedAction === 'move') {
      const active = turnOrder[turnIdx];
      if (!active || active.type !== 'player') return;
      const p = playerPositions[active.idx];
      if (!p || !p.alive) return;
      const dx = Math.abs(p.x - j);
      const dy = Math.abs(p.y - i);
      const isFree = !enemyPositions.some(e => e.alive && e.x === j && e.y === i)
        && !playerPositions.some((pl, idx) => idx !== active.idx && pl && pl.x === j && pl.y === i && pl.alive)
        && mapGrid[i][j] !== 'wall';
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        if (!isFree) return;
        const newPositions = [...playerPositions];
        newPositions[active.idx] = { ...p, x: j, y: i };
        setPlayerPositions(newPositions);
        setLog(prev => [...prev, `${p.name} moveu para (${i},${j})`]);
        setSelectedAction(null);
        endTurn();
      }
    } else if (step === 'combat' && phase === 'enemy' && selectedAction === 'move' && activeEnemyIdx !== null) {
      const e = enemyPositions[activeEnemyIdx];
      if (!e || !e.alive) return;
      const dx = Math.abs(e.x - j);
      const dy = Math.abs(e.y - i);
      const isFree = !enemyPositions.some((en, idx) => idx !== activeEnemyIdx && en && en.alive && en.x === j && en.y === i)
        && !playerPositions.some(p => p && p.alive && p.x === j && p.y === i)
        && mapGrid[i][j] !== 'wall';
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        if (!isFree) return;
        const newEnemies = [...enemyPositions];
        newEnemies[activeEnemyIdx] = { ...e, x: j, y: i };
        setEnemyPositions(newEnemies);
        setLog(prev => [...prev, `${e.name} moveu para (${i},${j})`]);
        setSelectedAction(null);
        setActiveEnemyIdx(null);
        endTurn();
      }
    }
  };

  const chooseAction = (action) => setSelectedAction(action);

  // Ataque do jogador (melee ou ranged)
  const attackEnemy = (enemyIdx) => {
    const active = turnOrder[turnIdx];
    if (!active || active.type !== 'player' || selectedAction !== 'attack') return;

    const player = playerPositions[active.idx];
    const enemy = enemyPositions[enemyIdx];
    if (!player || !enemy || !player.alive || !enemy.alive) return;
    if (!canPlayerAttackTarget(player, enemy)) return;

    const roll = DiceRole(20); // Rola o D20
    let damage = player.atk;
    let logs = [];

    if (roll === 1) {
      logs.push(`${player.name} errou o ataque!`);
    } else if (roll === 20) {
      logs.push(`${player.name} acertou um acerto crítico!`);
      damage *= 2;
    } else if (roll >= enemy.ac) {
      logs.push(`${player.name} atacou ${enemy.name} causando ${damage} de dano!`);
    } else {
      logs.push(`${player.name} errou o ataque!`);
      damage = 0;
    }

    // Aplica dano se houver
    if (damage > 0) {
      const newEnemies = [...enemyPositions];
      const newEnemy = updateHp(enemy, damage);
      newEnemies[enemyIdx] = newEnemy;
      if (!newEnemy.alive) logs.push(`${enemy.name} foi derrotado!`);
      setEnemyPositions(newEnemies);
    }

    setLog(prev => [...prev, ...logs]);
    setSelectedAction(null);
    endTurn();
  };


  const passTurn = () => {
    setLog(prev => [...prev, `${getActiveName()} passou o turno.`]);
    setSelectedAction(null);
    setActiveEnemyIdx(null);
    endTurn();
  };

  const endTurn = () => {
    let nextIdx = turnIdx + 1;
    let order = turnOrder;
    if (nextIdx >= order.length) {
      const newOrder = [
        ...playerPositions.map((p, idx) => p && p.alive ? { type: 'player', idx, spd: p.spd } : null).filter(Boolean),
        ...enemyPositions.map((e, idx) => e && e.alive ? { type: 'enemy', idx, spd: e.spd } : null).filter(Boolean)
      ].sort((a, b) => b.spd - a.spd);
      setTurnOrder(newOrder);
      nextIdx = 0;
      order = newOrder;
    }
    setTurnIdx(nextIdx);
    setSelectedAction(null);
    setActiveEnemyIdx(null);

    if (isCombatOver()) return;

    const next = order[nextIdx];
    if (next && next.type === 'player') {
      setPhase('player');
      setLog(prev => [...prev, `Turno de ${playerPositions[next.idx].name}.`]);
    } else if (next && next.type === 'enemy') {
      setPhase('enemy');
      setActiveEnemyIdx(next.idx);
      setLog(prev => [...prev, `Turno do Mestre: escolha o monstro e a ação.`]);
    }
  };

  // Mestre seleciona inimigo
  const selectEnemyToAct = (idx) => {
    setActiveEnemyIdx(idx);
    setSelectedAction(null);
  };

  // Ataque do inimigo (melee adjacente)
  const masterAttackPlayer = (playerIdx) => {
    if (activeEnemyIdx === null) return;
    const enemy = enemyPositions[activeEnemyIdx];
    const player = playerPositions[playerIdx];
    if (!enemy || !player || !enemy.alive || !player.alive) return;
    if (!isAdjacent(player, enemy)) return;
    const newPlayers = [...playerPositions];
    const newPlayer = updateHp(player, enemy.atk);
    newPlayers[playerIdx] = newPlayer;
    let logs = [`${enemy.name} atacou ${player.name} causando ${enemy.atk} de dano!`];
    if (!newPlayer.alive) logs.push(`${player.name} foi derrotado!`);
    setPlayerPositions(newPlayers);
    setLog(prev => [...prev, ...logs]);
    setSelectedAction(null);
    setActiveEnemyIdx(null);
    endTurn();
  };

  const masterPassEnemy = () => {
    setLog(prev => [...prev, `O mestre passou o turno do monstro.`]);
    setSelectedAction(null);
    setActiveEnemyIdx(null);
    endTurn();
  };

  const getActiveName = () => {
    const active = turnOrder[turnIdx];
    if (!active) return "";
    if (active.type === 'player') return playerPositions[active.idx]?.name || "";
    if (active.type === 'enemy') return enemyPositions[active.idx]?.name || "";
    return "";
  };

  const isCombatOver = () => {
    const playersAlive = playerPositions.some(p => p && p.alive);
    const enemiesAlive = enemyPositions.some(e => e.alive);
    return !playersAlive || !enemiesAlive;
  };

  // Render
  const active = turnOrder[turnIdx];
  const isPlayerTurn = active && active.type === 'player' && phase === 'player' && step === 'combat' && !isCombatOver();
  const isMasterTurn = active && active.type === 'enemy' && phase === 'enemy' && step === 'combat' && !isCombatOver();

  return (
    <div className="flex-col" style={{ gap: "1rem" }}>
      {step === 'pre' && (
        <div className="text-center mt-4">
          <button
            onClick={handleStartCombat}
            className="btn btn-success"
            disabled={maps.length === 0 || characters.length === 0}
            style={{
              opacity: maps.length === 0 || characters.length === 0 ? 0.5 : 1,
              cursor: maps.length === 0 || characters.length === 0 ? "not-allowed" : "pointer"
            }}
          >
            Iniciar Combate
          </button>
          <div className="mt-4">
            {maps.length === 0 && <div>Crie pelo menos um mapa para jogar.</div>}
            {characters.length === 0 && <div>Adicione pelo menos um personagem para jogar.</div>}
          </div>
        </div>
      )}

      {step === 'selectMap' && (
        <div>
          <h2 className="status-highlight" style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Selecione um mapa:</h2>
          <ul className="flex-row" style={{ gap: "1rem", flexWrap: "wrap" }}>
            {maps.map((m, idx) => (
              <li key={idx}>
                <button
                  onClick={() => handleSelectMap(idx)}
                  className="btn btn-primary"
                  style={{ border: "2px solid #3b82f6", fontWeight: 600, fontSize: "1rem" }}
                >
                  Mapa {idx + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(step === 'placePlayers' || step === 'combat') && (
        <div>
          <button onClick={handleStartCombat} className="btn btn-danger mb-4">Reiniciar Combate</button>

          <div className="grid-map mt-4" style={{ gridTemplateColumns: `repeat(${mapGrid[0]?.length || 0},40px)` }}>
            {mapGrid.map((row, i) => row.map((cell, j) => {
              const player = playerPositions.find((p, idx) => p && p.x === j && p.y === i && p.alive);
              const enemy = enemyPositions.find(e => e.x === j && e.y === i && e.alive);
              const isActive = isPlayerTurn && active.type === 'player' && player && active.idx === playerPositions.findIndex(p => p && p.x === j && p.y === i);
              return (
                <div
                  key={`${i}-${j}`}
                  onClick={() => handleCellClick(i, j)}
                  className={`cell ${cell === 'wall' ? 'cell-wall' : cell === 'floor' ? 'cell-floor' : 'cell-enemy'}
                    ${player ? 'cell-player' : ''}
                    ${isActive ? 'cell-active' : ''}
                    ${enemy ? 'cell-enemy' : ''}`}
                  title={`(${i},${j})`}
                  onClickCapture={() => {
                    if (step === 'combat' && isMasterTurn && selectedAction === 'move' && activeEnemyIdx !== null) {
                      handleCellClick(i, j);
                    }
                  }}
                >
                  {cell === 'wall'
                    ? <span style={{ width: "100%", height: "100%", display: "block", background: "#3f3f46", borderRadius: 4 }} />
                    : player ? '👤' : enemy ? '🐲' : ''}
                </div>
              );
            }))}
          </div>

          <div className="flex-row mt-4" style={{ gap: "2rem", justifyContent: "center" }}>
            <div>
              <h3 className="status-highlight" style={{ color: "#3b82f6" }}>Jogadores</h3>
              <ul>
                {playerPositions.map((p, i) => p &&
                  <li key={i} className={p.alive ? "status-alive" : "status-dead"} style={{ fontWeight: active && active.type === 'player' && active.idx === i ? 700 : 400 }}>
                    {p.name} ({p.cls}) HP: {p.currentHp} {p.alive ? "" : "💀"}
                    {p.attackType && ` • ${p.attackType} (alcance ${p.range || 1})`}
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="status-highlight" style={{ color: "#f87171" }}>Inimigos</h3>
              <ul>
                {enemyPositions.map((e, i) => e &&
                  <li key={i} className={e.alive ? "status-alive" : "status-dead"} style={{ fontWeight: active && active.type === 'enemy' && active.idx === i ? 700 : 400 }}>
                    {e.name} HP: {e.hp} {e.alive ? "" : "💀"}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {step === 'combat' && isPlayerTurn && (
            <div className="text-center mt-4">
              <span className="status-highlight">Ação de {playerPositions[active.idx].name}: </span>
              <button className={`btn btn-primary m-2${selectedAction === 'move' ? ' cell-active' : ''}`} onClick={() => chooseAction('move')}>Mover</button>
              <button className={`btn btn-danger m-2${selectedAction === 'attack' ? ' cell-active' : ''}`} onClick={() => chooseAction('attack')}>Atacar</button>
              <button className="btn btn-neutral m-2" onClick={passTurn}>Passar</button>
            </div>
          )}

          {step === 'combat' && isPlayerTurn && selectedAction === 'attack' && (
            <div className="text-center">
              {(() => {
                const p = playerPositions[active.idx];
                const isRanged = (p.attackType || '').toLowerCase() === 'ranged';
                return (
                  <>
                    <span>
                      {isRanged
                        ? `Escolha um inimigo até ${p.range} de distância.`
                        : 'Escolha um inimigo adjacente para atacar:'}
                    </span>
                    <div className="flex-row" style={{ gap: "1rem", justifyContent: "center", marginTop: "0.5rem" }}>
                      {enemyPositions.map((e, i) => {
                        if (!e.alive || !p) return null;
                        const canAttack = canPlayerAttackTarget(p, e);
                        return (
                          <button
                            key={i}
                            disabled={!canAttack}
                            onClick={() => attackEnemy(i)}
                            className="btn btn-danger"
                            style={{ opacity: canAttack ? 1 : 0.5, cursor: canAttack ? "pointer" : "not-allowed" }}
                            title={`Distância: ${manhattanDistance(p, e)}`}
                          >
                            {e.name} (HP: {e.hp})
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {step === 'combat' && isPlayerTurn && selectedAction === 'move' && (
            <div className="text-center">
              <span>Clique em uma célula adjacente livre para mover.</span>
            </div>
          )}

          {step === 'combat' && isMasterTurn && (
            <div className="text-center mt-4">
              <span className="status-highlight">Turno do Mestre: escolha o monstro para agir</span>
              <div className="flex-row" style={{ gap: "1rem", justifyContent: "center", margin: "1rem 0" }}>
                {enemyPositions.map((e, i) => (
                  <button
                    key={i}
                    disabled={!e.alive}
                    onClick={() => { setActiveEnemyIdx(i); setSelectedAction(null); }}
                    className={`btn btn-danger${activeEnemyIdx === i ? ' cell-active' : ''}`}
                    style={{ opacity: e.alive ? 1 : 0.5, cursor: e.alive ? "pointer" : "not-allowed" }}
                  >
                    {e.name} (HP: {e.hp})
                  </button>
                ))}
              </div>
              {activeEnemyIdx !== null && (
                <div>
                  <span>Ação do monstro {enemyPositions[activeEnemyIdx].name}:</span>
                  <div className="flex-row" style={{ gap: "1rem", justifyContent: "center", margin: "0.5rem 0" }}>
                    <button className={`btn btn-primary${selectedAction === 'move' ? ' cell-active' : ''}`} onClick={() => setSelectedAction('move')}>Mover</button>
                    <button className={`btn btn-danger${selectedAction === 'attack' ? ' cell-active' : ''}`} onClick={() => setSelectedAction('attack')}>Atacar</button>
                    <button className="btn btn-neutral" onClick={masterPassEnemy}>Passar</button>
                    <button className="btn btn-neutral" onClick={() => { setActiveEnemyIdx(null); setSelectedAction(null); }}>Cancelar</button>
                  </div>
                  {selectedAction === 'attack' && (
                    <div className="flex-row" style={{ gap: "1rem", justifyContent: "center", margin: "0.5rem 0" }}>
                      {playerPositions.map((p, i) => {
                        const e = enemyPositions[activeEnemyIdx];
                        if (!p || !p.alive || !e) return null;
                        const canAttack = isAdjacent(p, e); // inimigos ainda são melee
                        return (
                          <button
                            key={i}
                            disabled={!canAttack}
                            onClick={() => masterAttackPlayer(i)}
                            className="btn btn-primary"
                            style={{ opacity: canAttack ? 1 : 0.5, cursor: canAttack ? "pointer" : "not-allowed" }}
                          >
                            Atacar {p.name} (HP: {p.currentHp})
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {selectedAction === 'move' && (
                    <div className="mt-2"><span>Clique em uma célula adjacente livre no mapa para mover o monstro.</span></div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="log-box">
            <div className="status-highlight">
              {step === 'combat' && isCombatOver() && (
                <span style={{ color: "#22c55e" }}>
                  {playerPositions.some(p => p && p.alive) ? "Vitória dos jogadores!" : "Os monstros venceram!"}
                </span>
              )}
              {step === 'combat' && !isCombatOver() && <span>Turno de: <b>{getActiveName() || "Mestre"}</b></span>}
              {step === 'placePlayers' && <span>Posicione os jogadores no mapa.</span>}
            </div>
            {log.slice(-8).map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
