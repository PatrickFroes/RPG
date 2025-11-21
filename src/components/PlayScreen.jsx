import React, { useState } from "react"
import { Container } from "./Containers"
import { Button } from "./Inputs"
import AnimatedEnemySprite from "../data/functions.jsx"

// Adjacência (melee)
function isAdjacent(a, b) {
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1
}

// Rola D20
function DiceRole(sides = 20) {
	return Math.floor(Math.random() * sides) + 1
}

// Distância Manhattan (para ranged)
function manhattanDistance(a, b) {
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

// Identifica células do grid
const coordKey = (x, y) => `${x},${y}`

// Verifica se jogador pode atacar alvo: melee (adjacente) ou ranged (≤ range)
function canPlayerAttackTarget(player, enemy) {
	if (!player || !enemy) return false
	const type = (player.attackType || "").toLowerCase()
	if (type === "ranged") {
		const r = Number(player.range || 0)
		return manhattanDistance(player, enemy) <= r
	}
	// padrão: melee
	return isAdjacent(player, enemy)
}

// Atualiza vida e status
function updateHp(obj, damage) {
	const currentLife = obj.currentHp !== undefined ? obj.currentHp : obj.hp
	const newHp = currentLife - damage
	const clampedHp = Math.max(newHp, 0)
	return {
		...obj,
		currentHp: clampedHp,
		alive: clampedHp > 0,
	}
}

export default function PlayScreen({ maps, characters }) {
	const [step, setStep] = useState("pre") // 'pre', 'selectMap', 'placePlayers', 'combat'
	const [selectedMap, setSelectedMap] = useState(null)
	const [mapGrid, setMapGrid] = useState([])
	const [playerPositions, setPlayerPositions] = useState([])
	const [enemyPositions, setEnemyPositions] = useState([])
	const [log, setLog] = useState([])
	const [turnOrder, setTurnOrder] = useState([])
	const [turnIdx, setTurnIdx] = useState(0)
	const [phase, setPhase] = useState("player") // 'player' | 'enemy'
	const [selectedAction, setSelectedAction] = useState(null) // 'move' | 'attack' | 'pass'
	const [activeEnemyIdx, setActiveEnemyIdx] = useState(null)

	const handleStartCombat = () => {
		setStep("selectMap")
		setSelectedMap(null)
		setMapGrid([])
		setPlayerPositions([])
		setEnemyPositions([])
		setLog([])
		setTurnOrder([])
		setTurnIdx(0)
		setPhase("player")
		setSelectedAction(null)
		setActiveEnemyIdx(null)
	}

	const handleSelectMap = (idx) => {
		const mapData = maps[idx]
		const map = mapData.grid || mapData // Compatibilidade com mapas antigos e novos
		setSelectedMap(idx)
		setMapGrid(map)
		const enemies = []
		map.forEach((row, i) =>
			row.forEach((cell, j) => {
				if (cell?.enemy) {
					enemies.push({
						x: j,
						y: i,
						hp: cell.enemy.hp || cell.enemy.stats?.hp,
						atk: cell.enemy.atk || cell.enemy.stats?.atk,
						spd: cell.enemy.spd || cell.enemy.stats?.spd,
						ac: cell.enemy.ac || cell.enemy.stats?.ac,
						name: cell.enemy.name,
						spriteUrl: cell.enemy.spriteUrl,
						alive: true,
					})
				}
			})
		)
		setEnemyPositions(enemies)
		setPlayerPositions(Array(characters.length).fill(null))
		setLog(["Posicione os jogadores clicando nas células livres."])
		setStep("placePlayers")
	}

	// Posicionamento dos jogadores
	const handleCellClick = (i, j) => {
		if (step === "placePlayers") {
			const idx = playerPositions.findIndex((p) => !p)
			if (idx === -1) return
			if (playerPositions.some((p) => p && p.x === j && p.y === i)) return
			if (mapGrid[i]?.[j]?.enemy) return // Não pode posicionar onde já tem inimigo
			if (mapGrid[i]?.[j]?.hasCollision) return // Não pode posicionar em área de colisão
			const baseChar = characters[idx]
			const newPositions = [...playerPositions]
			newPositions[idx] = { x: j, y: i, ...baseChar, currentHp: baseChar.hp, alive: true }
			setPlayerPositions(newPositions)
			setLog((prev) => [...prev, `${baseChar.name} posicionado em (${i},${j})`])
			if (idx + 1 === characters.length) {
				const order = [
					...newPositions.map((p, idx) => (p && p.alive ? { type: "player", idx, spd: p.spd } : null)).filter(Boolean),
					...enemyPositions.map((e, idx) => (e && e.alive ? { type: "enemy", idx, spd: e.spd } : null)).filter(Boolean),
				].sort((a, b) => b.spd - a.spd)
				setTurnOrder(order)
				setTurnIdx(0)
				setPhase(order[0].type)
				setLog((prev) => [...prev, `Turno de ${order[0].type === "player" ? newPositions[order[0].idx].name : enemyPositions[order[0].idx].name}.`])
				setStep("combat")
			}
		} else if (step === "combat" && phase === "player" && selectedAction === "move") {
			const active = turnOrder[turnIdx]
			if (!active || active.type !== "player") return
			const p = playerPositions[active.idx]
			if (!p || !p.alive) return
			const dx = Math.abs(p.x - j)
			const dy = Math.abs(p.y - i)
			const isFree =
				!enemyPositions.some((e) => e.alive && e.x === j && e.y === i) &&
				!playerPositions.some((pl, idx) => idx !== active.idx && pl && pl.x === j && pl.y === i && pl.alive) &&
				!mapGrid[i]?.[j]?.hasCollision // Não pode mover para área de colisão
			if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
				if (!isFree) return
				const newPositions = [...playerPositions]
				newPositions[active.idx] = { ...p, x: j, y: i }
				setPlayerPositions(newPositions)
				setLog((prev) => [...prev, `${p.name} moveu para (${i},${j})`])
				setSelectedAction(null)
				endTurn()
			}
		} else if (step === "combat" && phase === "enemy" && selectedAction === "move" && activeEnemyIdx !== null) {
			const e = enemyPositions[activeEnemyIdx]
			if (!e || !e.alive) return
			const dx = Math.abs(e.x - j)
			const dy = Math.abs(e.y - i)
			const isFree =
				!enemyPositions.some((en, idx) => idx !== activeEnemyIdx && en && en.alive && en.x === j && en.y === i) &&
				!playerPositions.some((p) => p && p.alive && p.x === j && p.y === i) &&
				!mapGrid[i]?.[j]?.hasCollision // Não pode mover para área de colisão
			if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
				if (!isFree) return
				const newEnemies = [...enemyPositions]
				newEnemies[activeEnemyIdx] = { ...e, x: j, y: i }
				setEnemyPositions(newEnemies)
				setLog((prev) => [...prev, `${e.name} moveu para (${i},${j})`])
				setSelectedAction(null)
				setActiveEnemyIdx(null)
				endTurn()
			}
		}
	}

	const chooseAction = (action) => setSelectedAction(action)

	// Ataque do jogador (melee ou ranged)
	const attackEnemy = (enemyIdx) => {
		const active = turnOrder[turnIdx]
		if (!active || active.type !== "player" || selectedAction !== "attack") return

		const player = playerPositions[active.idx]
		const enemy = enemyPositions[enemyIdx]
		if (!player || !enemy || !player.alive || !enemy.alive) return
		if (!canPlayerAttackTarget(player, enemy)) return

		const roll = DiceRole(20) // Rola o D20
		let damage = player.atk
		let logs = []

		logs.push(`${player.name} ataca ${enemy.name}: Rolou ${roll}.`)

		if (roll === 1) {
			logs.push(`${player.name} errou o ataque!`)
		} else if (roll === 20) {
			logs.push(`${player.name} acertou um acerto crítico!`)
			damage *= 2
		} else if (roll >= enemy.ac) {
			logs.push(`${player.name} atacou ${enemy.name} causando ${damage} de dano!`)
		} else {
			logs.push(`${player.name} errou o ataque!`)
			damage = 0
		}

		// Aplica dano se houver
		if (damage > 0) {
			const newEnemies = [...enemyPositions]
			const newEnemy = updateHp(enemy, damage)
			newEnemies[enemyIdx] = newEnemy
			if (!newEnemy.alive) logs.push(`${enemy.name} foi derrotado!`)
			setEnemyPositions(newEnemies)
		}

		setLog((prev) => [...prev, ...logs])
		setSelectedAction(null)
		endTurn()
	}

	const passTurn = () => {
		setLog((prev) => [...prev, `${getActiveName()} passou o turno.`])
		setSelectedAction(null)
		setActiveEnemyIdx(null)
		endTurn()
	}

	const endTurn = () => {
		let nextIdx = turnIdx + 1
		let order = turnOrder
		if (nextIdx >= order.length) {
			const newOrder = [
				...playerPositions.map((p, idx) => (p && p.alive ? { type: "player", idx, spd: p.spd } : null)).filter(Boolean),
				...enemyPositions.map((e, idx) => (e && e.alive ? { type: "enemy", idx, spd: e.spd } : null)).filter(Boolean),
			].sort((a, b) => b.spd - a.spd)
			setTurnOrder(newOrder)
			nextIdx = 0
			order = newOrder
		}
		setTurnIdx(nextIdx)
		setSelectedAction(null)
		setActiveEnemyIdx(null)

		if (isCombatOver()) return

		const next = order[nextIdx]
		if (next && next.type === "player") {
			setPhase("player")
			setLog((prev) => [...prev, `Turno de ${playerPositions[next.idx].name}.`])
		} else if (next && next.type === "enemy") {
			setPhase("enemy")
			setActiveEnemyIdx(null)
			setLog((prev) => [...prev, "Turno do Mestre: escolha o monstro e a ação."])
		}
	}

	// Mestre seleciona inimigo
	const selectEnemyToAct = (idx) => {
		setActiveEnemyIdx(idx)
		setSelectedAction(null)
	}

	// Ataque do inimigo (mestre) - melee ou ranged
	const masterAttackPlayer = (playerIdx) => {
		if (activeEnemyIdx === null) return
		const enemy = enemyPositions[activeEnemyIdx]
		const player = playerPositions[playerIdx]
		if (!enemy || !player || !enemy.alive || !player.alive) return

		// Verifica se o alvo está no alcance
		const type = (enemy.attackType || "").toLowerCase()
		let inRange = false
		if (type === "ranged") {
			const r = Number(enemy.range || 0)
			inRange = manhattanDistance(enemy, player) <= r
		} else {
			inRange = isAdjacent(enemy, player)
		}
		if (!inRange) return

		const roll = DiceRole(20) // Rola D20
		let damage = enemy.atk
		let logs = []

		logs.push(`${enemy.name} ataca ${player.name}: Rolou ${roll}.`)

		if (roll === 1) {
			logs.push(`${enemy.name} errou o ataque!`)
			damage = 0
		} else if (roll === 20) {
			logs.push(`${enemy.name} acertou um crítico em ${player.name}!`)
			damage *= 2
		} else if (roll >= player.ac) {
			logs.push(`${enemy.name} atacou ${player.name} causando ${damage} de dano!`)
		} else {
			logs.push(`${enemy.name} errou o ataque!`)
			damage = 0
		}

		if (damage > 0) {
			const newPlayers = [...playerPositions]
			const newPlayer = updateHp(player, damage)
			newPlayers[playerIdx] = newPlayer
			if (!newPlayer.alive) logs.push(`${player.name} foi derrotado!`)
			setPlayerPositions(newPlayers)
		}

		setLog((prev) => [...prev, ...logs])
		setSelectedAction(null)
		setActiveEnemyIdx(null)
		endTurn()
	}

	const masterPassEnemy = () => {
		setLog((prev) => [...prev, `O mestre passou o turno do monstro.`])
		setSelectedAction(null)
		setActiveEnemyIdx(null)
		endTurn()
	}

	const getActiveName = () => {
		const active = turnOrder[turnIdx]
		if (!active) return ""
		if (active.type === "player") return playerPositions[active.idx]?.name || ""
		if (active.type === "enemy") return enemyPositions[active.idx]?.name || ""
		return ""
	}

	const isCombatOver = () => {
		const playersAlive = playerPositions.some((p) => p && p.alive)
		const enemiesAlive = enemyPositions.some((e) => e.alive)
		return !playersAlive || !enemiesAlive
	}

	// Render
	const active = turnOrder[turnIdx]
	const isPlayerTurn = active && active.type === "player" && phase === "player" && step === "combat" && !isCombatOver()
	const isMasterTurn = active && active.type === "enemy" && phase === "enemy" && step === "combat" && !isCombatOver()
	const cellSize = 48

	const playersByCoord = new Map()
	playerPositions.forEach((p, idx) => {
		if (p && p.alive) playersByCoord.set(coordKey(p.x, p.y), { entity: p, idx })
	})
	const enemiesByCoord = new Map()
	enemyPositions.forEach((e, idx) => {
		if (e && e.alive) enemiesByCoord.set(coordKey(e.x, e.y), { entity: e, idx })
	})

	return (
		<div className="p-4 space-y-4">
			<h2 className="text-4xl font-bold text-center mb-6">⚔️ Arena de Combate</h2>

			{step === "pre" && (
				<Container className="text-center py-12">
					<h3 className="text-2xl font-semibold mb-6">Prepare-se para a Batalha!</h3>
					<Button
						onClick={handleStartCombat}
						disabled={maps.length === 0 || characters.length === 0}
						variant="play"
						className="px-8 py-3 text-lg"
					>
						Iniciar Combate
					</Button>
					<div className="mt-8 space-y-2">
						{maps.length === 0 && <div className="text-red-400">⚠️ Crie pelo menos um mapa para jogar.</div>}
						{characters.length === 0 && <div className="text-red-400">⚠️ Adicione pelo menos um personagem para jogar.</div>}
						{maps.length > 0 && characters.length > 0 && <div className="text-green-400">✅ Tudo pronto! Clique para começar.</div>}
					</div>
				</Container>
			)}

			{step === "selectMap" && (
				<Container className="p-6">
					<h3 className="text-2xl font-semibold text-center mb-6">Selecione o Campo de Batalha</h3>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{maps.map((m, idx) => (
							<Button
								key={idx}
								onClick={() => handleSelectMap(idx)}
								variant="default"
								className="h-32 flex flex-col items-center justify-center gap-2"
							>
								<span className="text-4xl">🗺️</span>
								<span className="text-lg font-semibold">Mapa {idx + 1}</span>
								<span className="text-xs text-gray-400">
									{m.length}x{m[0]?.length}
								</span>
							</Button>
						))}
					</div>
				</Container>
			)}

			{(step === "placePlayers" || step === "combat") && (
				<>
					<div className="flex justify-between items-center">
						<h3 className="text-xl font-semibold">
							{step === "placePlayers" && "📍 Posicione seus Heróis"}
							{step === "combat" && !isCombatOver() && `⚔️ ${getActiveName()}`}
							{step === "combat" && isCombatOver() && (
								<span className={playerPositions.some((p) => p && p.alive) ? "text-green-400" : "text-red-400"}>{playerPositions.some((p) => p && p.alive) ? "🎉 Vitória!" : "💀 Derrota"}</span>
							)}
						</h3>
						<Button
							onClick={handleStartCombat}
							variant="default"
							className="text-sm"
						>
							🔄 Reiniciar
						</Button>
					</div>

					{/* Layout principal em grid - 2 linhas x 4 colunas */}
					<div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4">
						{/* Linha 1, Colunas 1-3: Mapa */}
						<div className="lg:col-span-3 lg:row-span-1">
							<Container className="p-4 h-full flex justify-center items-start">
								<div
									className="grid"
									style={{
									gridTemplate: `repeat(${mapGrid.length}, ${cellSize}px) / repeat(${mapGrid[0]?.length || 0}, ${cellSize}px)`,
									maxWidth: "fit-content",
								}}
							>
								{mapGrid.map((row, i) =>
									row.map((cell, j) => {
										const playerEntry = playersByCoord.get(coordKey(j, i))
										const enemyEntry = enemiesByCoord.get(coordKey(j, i))
										const player = playerEntry?.entity
										const enemy = enemyEntry?.entity
										const playerIdx = playerEntry?.idx ?? -1
										const enemyIdx = enemyEntry?.idx ?? -1
										const isActivePlayer = active && active.type === "player" && active.idx === playerIdx
										const isActiveEnemy = active && active.type === "enemy" && active.idx === enemyIdx
										const isTile = cell?.type === "tile"
										const isPlacingPlayers = step === "placePlayers"

										return (
											<div
												key={`${i}-${j}`}
												onClick={() => handleCellClick(i, j)}
												className={`
                        ${player ? "cell-player" : ""}
                        ${enemy ? "cell-enemy" : ""}
                        ${isPlacingPlayers ? "hover:border-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "hover:brightness-110"} 
                        transition-all cursor-pointer
                      `}
												style={{
													width: `${cellSize}px`,
													height: `${cellSize}px`,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													fontSize: "24px",
													backgroundImage: isTile ? `url(/tileset.png)` : "none",
													backgroundPosition: isTile ? `-${cell.x * 8 * (cellSize / 8)}px -${cell.y * 8 * (cellSize / 8)}px` : "0 0",
													backgroundSize: isTile ? `${8 * cellSize}px ${9 * cellSize}px` : "auto",
													imageRendering: "pixelated",
													backgroundColor: isTile ? "transparent" : "#1a1a1a",
													border: isActivePlayer ? "3px solid #3b82f6" : isActiveEnemy ? "3px solid #ef4444" : "1px solid #4b5563",
													boxShadow: isActivePlayer ? "0 0 10px #3b82f6" : isActiveEnemy ? "0 0 10px #ef4444" : "none",
												}}
												title={`(${i},${j})`}
											>
												{player && player.spriteUrl ? (
													<AnimatedEnemySprite
														enemy={player}
														size={cellSize - 8}
														showName={false}
														showStats={false}
														onClick={null}
														mainClass="border-none p-0"
													/>
												) : player ? (
													"🦸"
												) : null}
												{enemy && (
													<AnimatedEnemySprite
														enemy={enemy}
														size={cellSize - 8}
														showName={false}
														showStats={false}
														onClick={null}
														mainClass="border-none p-0"
													/>
												)}
											</div>
										)
									})
								)}
							</div>
							</Container>
						</div>

						{/* Linha 1, Coluna 4: Heróis */}
						<div className="lg:col-span-1 lg:row-span-1">
							<Container className="p-4 h-full">
								<h4 className="text-lg font-semibold mb-3 text-blue-400 flex items-center gap-2">
									<span>👥</span> Heróis
								</h4>
								<div className="space-y-2 overflow-y-auto" style={{maxHeight: 'calc(100% - 3rem)'}}>
									{playerPositions.map(
										(p, i) =>
											p && (
												<div
													key={i}
													className={`
                        p-2 rounded border
                        ${p.alive ? "border-blue-500 bg-blue-900/20" : "border-gray-600 bg-gray-800/20 opacity-50"}
                        ${active && active.type === "player" && active.idx === i ? "ring-2 ring-yellow-400" : ""}
                      `}
												>
													<div className="flex justify-between items-center">
														<span className="font-semibold">{p.name}</span>
														{!p.alive && <span>💀</span>}
													</div>
													<div className="text-xs text-gray-300 mt-1">
														<div>
															❤️ HP: {p.currentHp}/{p.hp}
														</div>
														<div>
															⚔️ {p.attackType} (alcance {p.range || 1})
														</div>
													</div>
												</div>
											)
									)}
								</div>
							</Container>
						</div>

						{/* Linha 1, Coluna 4: Inimigos (mobile logo abaixo dos heróis) */}
						<div className="lg:col-span-1 lg:row-span-1 lg:row-start-2 lg:col-start-4">
							<Container className="p-4 h-full">
								<h4 className="text-lg font-semibold mb-3 text-red-400 flex items-center gap-2">
									<span>🐲</span> Inimigos
								</h4>
								<div className="space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100% - 3rem)" }}>
									{enemyPositions.map(
										(e, i) =>
											e && (
												<div
													key={i}
													className={`
	                        p-2 rounded border
	                        ${e.alive ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-800/20 opacity-50"}
	                        ${active && active.type === "enemy" && active.idx === i ? "ring-2 ring-yellow-400" : ""}
	                      `}
												>
													<div className="flex justify-between items-center">
														<span className="font-semibold">{e.name}</span>
														{!e.alive && <span>💀</span>}
													</div>
													<div className="text-xs text-gray-300 mt-1">❤️ HP: {e.hp}</div>
												</div>
											)
									)}
								</div>
							</Container>
						</div>

						{/* Linha 2, Colunas 1-3: Ações/Log */}
						<div className="lg:col-span-3 lg:row-span-1 lg:row-start-2">
							{step === "combat" && (
								<div className="space-y-4">
									{/* Ações do Jogador */}
									{isPlayerTurn && active && playerPositions[active.idx] && (
										<Container className="p-4">
											<h4 className="text-lg font-semibold mb-3 text-center text-blue-400">⚔️ Turno do Jogador - {playerPositions[active.idx].name}</h4>
											<div className="flex justify-center gap-3 mb-4">
												<Button
													onClick={() => chooseAction("move")}
													variant={selectedAction === "move" ? "play" : "default"}
													className="flex items-center gap-2"
												>
													🏃 Mover
												</Button>
												<Button
													onClick={() => chooseAction("attack")}
													variant={selectedAction === "attack" ? "play" : "default"}
													className="flex items-center gap-2"
												>
													⚔️ Atacar
												</Button>
												<Button
													onClick={passTurn}
													variant="default"
													className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500"
												>
													⏭️ Passar
												</Button>
											</div>

											{selectedAction === "move" && (
												<div className="text-center text-gray-300">
													<p>📍 Clique em uma célula adjacente livre para mover</p>
												</div>
											)}

											{selectedAction === "attack" && active && playerPositions[active.idx] && (
												<div>
													{(() => {
														const p = playerPositions[active.idx]
														const isRanged = (p.attackType || "").toLowerCase() === "ranged"
														return (
															<>
																<p className="text-center mb-3 text-gray-300">{isRanged ? `🏹 Escolha um inimigo até ${p.range} de distância` : "⚔️ Escolha um inimigo adjacente para atacar"}</p>
																<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
																	{enemyPositions.map((e, i) => {
																		if (!e.alive || !p) return null
																		const canAttack = canPlayerAttackTarget(p, e)
																		const dist = manhattanDistance(p, e)
																		return (
																			<Button
																				key={i}
																				disabled={!canAttack}
																				onClick={() => attackEnemy(i)}
																				variant={canAttack ? "default" : "default"}
																				className={`${!canAttack ? "opacity-30" : ""}`}
																			>
																				<div className="text-left w-full">
																					<div className="font-semibold">{e.name}</div>
																					<div className="text-xs text-gray-400">
																						❤️ {e.hp} HP • 📏 Dist: {dist}
																					</div>
																				</div>
																			</Button>
																		)
																	})}
																</div>
															</>
														)
													})()}
												</div>
											)}
										</Container>
									)}

									{/* Ações do Mestre */}
									{isMasterTurn && (
										<Container className="p-4">
											<h4 className="text-lg font-semibold mb-3 text-center text-red-400">🎭 Turno do Mestre</h4>

											{activeEnemyIdx === null && (
												<div>
													<p className="text-center mb-3 text-gray-300">Selecione um monstro para agir:</p>
													<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
														{enemyPositions.map((e, i) => (
															<Button
																key={i}
																disabled={!e.alive}
																onClick={() => {
																	setActiveEnemyIdx(i)
																	setSelectedAction(null)
																}}
																variant={activeEnemyIdx === i ? "play" : "default"}
																className={`${!e.alive ? "opacity-30" : ""}`}
															>
																<div className="text-left w-full">
																	<div className="font-semibold">{e.name}</div>
																	<div className="text-xs text-gray-400">❤️ {e.hp} HP</div>
																</div>
															</Button>
														))}
													</div>
												</div>
											)}

											{activeEnemyIdx !== null && (
												<div className="space-y-4">
													<div className="text-center">
														<span className="text-lg font-semibold text-yellow-300">{enemyPositions[activeEnemyIdx].name}</span>
													</div>

													<div className="flex justify-center gap-3">
														<Button
															onClick={() => setSelectedAction("move")}
															variant={selectedAction === "move" ? "play" : "default"}
														>
															🏃 Mover
														</Button>
														<Button
															onClick={() => setSelectedAction("attack")}
															variant={selectedAction === "attack" ? "play" : "default"}
														>
															⚔️ Atacar
														</Button>
														<Button
															onClick={masterPassEnemy}
															variant="default"
															className="bg-gray-600 hover:bg-gray-500"
														>
															⏭ Passar
														</Button>
														<Button
															onClick={() => {
																setActiveEnemyIdx(null)
																setSelectedAction(null)
															}}
															variant="default"
															className="bg-yellow-600 hover:bg-yellow-500"
														>
															🔙 Voltar
														</Button>
													</div>

													{selectedAction === "move" && (
														<div className="text-center text-gray-300">
															<p>📍 Clique em uma célula adjacente para mover</p>
														</div>
													)}

													{selectedAction === "attack" && (
														<div>
															<p className="text-center mb-3 text-gray-300">🎯 Selecione um jogador para atacar:</p>
															<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
																{playerPositions.map((p, i) => {
																	const activeEnemy = enemyPositions[activeEnemyIdx]
																	const canAttack = activeEnemy && p && isAdjacent(activeEnemy, p) && p.alive
																	return (
																		<Button
																			key={i}
																			disabled={!canAttack}
																			onClick={() => masterAttackPlayer(i)}
																			variant="default"
																			className={`${!canAttack ? "opacity-30" : ""}`}
																		>
																			<div className="text-left w-full">
																				<div className="font-semibold">{p?.name || `Jogador ${i + 1}`}</div>
																				<div className="text-xs text-gray-400">❤️ {p?.currentHp !== undefined ? `${p.currentHp}/${p.hp}` : p?.hp} HP</div>
																			</div>
																		</Button>
																	)
																})}
															</div>
														</div>
													)}
												</div>
											)}
										</Container>
									)}
								</div>
							)}

							{/* Log de Combate */}
							{step === "combat" && (
								<Container className="p-4">
									<h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
										📜 Log de Combate
										{isCombatOver() && (
											<span className={`ml-auto text-xs ${playerPositions.some((p) => p && p.alive) ? "text-green-400" : "text-red-400"}`}>
												{playerPositions.some((p) => p && p.alive) ? "🎉 Vitória!" : "💀 Derrota!"}
											</span>
										)}
									</h4>
									<div className="bg-[#0a1a25] p-3 rounded h-48 overflow-y-auto space-y-1">
										{log.length === 0 ? (
											<div className="text-gray-500 text-center text-sm">Nenhuma ação registrada</div>
										) : (
											log.slice(-30).map((l, i) => (
												<div key={i} className="text-xs text-gray-300 border-b border-gray-700/30 pb-1">
													{l}
												</div>
											))
										)}
									</div>
								</Container>
							)}
						</div>

					</div>

		</>
	)}
</div>
)
}
