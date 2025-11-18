import React, { useState, useEffect } from "react"
import { Button, InputNumber } from "./Inputs.jsx"
import { Container } from "./Containers"
import AnimatedEnemySprite from "../data/functions.jsx"
import { saveMap, removeMap } from "../api"

export default function MapEditor({ maps, setMaps, enemies }) {
	const [size, setSize] = useState(8)
	const [grid, setGrid] = useState([])
	const [editing, setEditing] = useState(false)
	const [selectedType, setSelectedType] = useState("tile")
	const [selectedEnemyIdx, setSelectedEnemyIdx] = useState(null)
	const [mapName, setMapName] = useState("")
	const [selectedTile, setSelectedTile] = useState({ x: 0, y: 0 }) // Tile selecionado do tileset
	const [tilesetPath, setTilesetPath] = useState("/tileset.png") // Caminho da imagem do tileset

	const cellSize = 60
	const tileSize = 8 // Tamanho de cada tile no tileset
	const tilesetCols = 8 // 64px / 8px = 8 colunas
	const tilesetRows = 9 // 72px / 8px = 9 linhas

	function initGrid() {
		setGrid(
			Array(size)
				.fill(null)
				.map(() => Array(size).fill({ type: "tile", x: 0, y: 0 }))
		)
		setEditing(true)
		setMapName("")
	}

	function updateCell(row, col) {
		if (!editing) return
		const newGrid = grid.map((r) => [...r])

		if (selectedType === "enemy" && selectedEnemyIdx !== null) {
			newGrid[row][col] = { type: "enemy", enemy: enemies[selectedEnemyIdx] }
		} else if (selectedType === "tile") {
			newGrid[row][col] = { type: "tile", x: selectedTile.x, y: selectedTile.y }
		} else {
			newGrid[row][col] = selectedType
		}

		setGrid(newGrid)
	}

	function handleTileSelect(tileX, tileY) {
		setSelectedTile({ x: tileX, y: tileY })
		setSelectedType("tile")
	}

	async function saveCurrentMap() {
		if (!mapName.trim()) {
			alert("Digite um nome para o mapa!")
			return
		}

		const mapData = {
			name: mapName,
			grid: grid,
			rows: size,
			cols: size,
		}

		try {
			await saveMap(mapData)
			setMaps([...maps, mapData])
			setGrid([])
			setEditing(false)
			setMapName("")
		} catch (error) {
			console.error("Erro ao salvar mapa:", error)
			alert("Erro ao salvar mapa!")
		}
	}

	async function handleDeleteMap(id, index) {
		try {
			if (id) {
				await removeMap(id)
			}
			setMaps(maps.filter((_, i) => i !== index))
		} catch (error) {
			console.error("Erro ao deletar mapa:", error)
		}
	}

	function renderGrid() {
		return grid.map((row, i) =>
			row.map((cell, j) => {
				const isTile = cell?.type === "tile"
				const isEnemy = cell?.type === "enemy"

				return (
					<div
						key={`${i}-${j}`}
						onClick={() => updateCell(i, j)}
						className={`cell border border-gray-600 cursor-pointer hover:border-cyan-400 transition-colors ${isEnemy ? "cell-enemy" : ""}`}
						title={`(${i},${j})`}
						style={{
							width: `${cellSize}px`,
							height: `${cellSize}px`,
							backgroundImage: isTile ? `url(${tilesetPath})` : "none",
							backgroundPosition: isTile ? `-${cell.x * tileSize * (cellSize / tileSize)}px -${cell.y * tileSize * (cellSize / tileSize)}px` : "0 0",
							backgroundSize: isTile ? `${tilesetCols * cellSize}px ${tilesetRows * cellSize}px` : "auto",
							imageRendering: "pixelated",
							backgroundColor: isTile ? "transparent" : "#1a1a1a",
						}}
					>
						{isEnemy && cell.enemy && (
							<AnimatedEnemySprite
								enemy={cell.enemy}
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
		)
	}

	return (
		<div className="p-4 space-y-4">
			<h2 className="text-4xl font-bold text-center mb-6">Editor de Mapas</h2>
			
			{/* Container de Configuração */}
			<Container className="p-6">
				<h3 className="text-xl font-semibold mb-6 text-center">Configuração do Mapa</h3>
				<div className="flex flex-col md:flex-row gap-6 items-center justify-center">
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-gray-300">Tamanho do Grid:</label>
						<InputNumber
							value={size}
							onChange={(e) => setSize(Number(e.target.value))}
							className="w-24 text-center"
							disabled={editing}
						/>
					</div>
					<div className="flex items-end">
						<Button
							onClick={initGrid}
							variant={editing ? "default" : "play"}
							disabled={editing}
							className="px-8 py-2"
						>
							{editing ? "✏️ Editando Mapa..." : "Criar Novo Mapa"}
						</Button>
					</div>
				</div>
			</Container>

			{grid.length > 0 && (
				<>
					<Container className="p-6">
						{/* Nome e descrição no topo */}
						<div className="mb-6">
							<h3 className="text-2xl font-bold text-center mb-3">
								Mapa ({size}x{size})
							</h3>
							<div className="max-w-md mx-auto">
								<label className="block text-sm font-medium mb-2">Nome do Mapa:</label>
								<input
									type="text"
									value={mapName}
									onChange={(e) => setMapName(e.target.value)}
									className="w-full bg-[#123240] text-white border border-gray-500 rounded px-3 py-2 focus:border-cyan-300 focus:outline-none"
									placeholder="Digite um nome para o mapa..."
								/>
							</div>
						</div>

						<div
							className="grid gap-6 items-start"
							style={{ gridTemplateColumns: "1fr auto 1fr" }}
						>
							{/* Coluna Esquerda */}

							{/* Preview do tile selecionado */}
							<Container className="rounded">
								<div className="flex flex-col items-center gap-4">
									<p className="text-sm font-medium">Tile Selecionado:</p>
									<div
										className="border-4 border-green-400 rounded"
										style={{
											width: `${tileSize * 8}px`,
											height: `${tileSize * 8}px`,
											backgroundImage: `url(${tilesetPath})`,
											backgroundPosition: `-${selectedTile.x * tileSize * 8}px -${selectedTile.y * tileSize * 8}px`,
											backgroundSize: `${tilesetCols * tileSize * 8}px ${tilesetRows * tileSize * 8}px`,
											imageRendering: "pixelated",
										}}
									/>
									<p className="text-xs text-gray-400">
										Posição: ({selectedTile.x}, {selectedTile.y})
									</p>
								</div>
								{/* Seletor de Tileset */}
								<div className="">
									<p className="text-sm text-gray-400 mb-2 text-center">Clique para selecionar:</p>
									<div
										className="inline-grid gap-0 border-2 border-cyan-400"
										style={{
											gridTemplateColumns: `repeat(${tilesetCols}, ${tileSize * 4}px)`,
											backgroundImage: `url(${tilesetPath})`,
											backgroundSize: `${tilesetCols * tileSize * 4}px ${tilesetRows * tileSize * 4}px`,
											imageRendering: "pixelated",
										}}
									>
										{Array.from({ length: tilesetRows }).map((_, row) =>
											Array.from({ length: tilesetCols }).map((_, col) => (
												<div
													key={`${row}-${col}`}
													onClick={() => handleTileSelect(col, row)}
													className={`cursor-pointer border border-gray-700 hover:border-yellow-400 transition-colors ${
														selectedTile.x === col && selectedTile.y === row ? "ring-4 ring-green-400" : ""
													}`}
													style={{
														width: `${tileSize * 4}px`,
														height: `${tileSize * 4}px`,
													}}
													title={`Tile (${col}, ${row})`}
												/>
											))
										)}
									</div>
								</div>
							</Container>

							{/* Coluna Central */}
							<div className="flex flex-col items-center">
								<div
									className="grid gap-0 mx-auto"
									style={{
										gridTemplate: `repeat(${size}, ${cellSize}px) / repeat(${size}, ${cellSize}px)`,
									}}
								>
									{renderGrid()}
								</div>

								<div className="flex justify-center mt-6">
									<Button
										onClick={saveCurrentMap}
										disabled={!editing}
										variant="play"
										className="px-8"
									>
										💾 Salvar Mapa
									</Button>
								</div>
							</div>

							{/* Coluna Direita */}

							<Container>
								<div className="flex flex-col gap-4">
									<h3 className="text-lg font-semibold mb-4 text-center">Ferramentas</h3>
									<div className="flex flex-col gap-3">
										<Button
											onClick={() => setSelectedType("enemy")}
											variant={selectedType === "enemy" ? "play" : "default"}
											className="w-full justify-center"
										>
											Inimigo
										</Button>
									</div>

									{/* Seleção de inimigos */}
									{selectedType === "enemy" && (
										<div className="mt-4">
											<h4 className="text-sm font-semibold mb-3 text-center">Selecionar Inimigo:</h4>
											{enemies.length === 0 ? (
												<div className="text-gray-400 text-center py-4 text-xs">Nenhum inimigo criado ainda.</div>
											) : (
												<div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
													{enemies.map((enemy, i) => (
														<AnimatedEnemySprite
															key={i}
															enemy={enemy}
															isSelected={selectedEnemyIdx === i}
															onClick={() => setSelectedEnemyIdx(i)}
															size={40}
															showStats={false}
															mainClass={`flex flex-col items-center p-2 border border-(--border-color) rounded cursor-pointer transition-all duration-200 hover:ring-blue-500 hover:brightness-150 ${
																selectedEnemyIdx === i ? "ring-4 ring-green-500" : "ring-2 ring-transparent"
															}`}
														/>
													))}
												</div>
											)}
										</div>
									)}
								</div>
							</Container>
						</div>
					</Container>
				</>
			)}{" "}
			{/* Mapas salvos */}
			<div>
				<h3 className="text-lg font-semibold mb-3">
					Mapas Salvos <span className={`${maps.length === 0 ? "text-gray-400" : "text-green-400"}`}>({maps.length})</span>:
				</h3>
				{maps.length === 0 ? (
					<Container className="text-center py-8">
						<div className="text-gray-400">Nenhum mapa salvo ainda</div>
						<p className="text-gray-500 text-sm mt-2">Crie e salve um mapa para vê-lo aqui!</p>
					</Container>
				) : (
					<Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{maps.map((map, i) => (
							<div
								key={i}
								className="border border-(--border-color) rounded p-4 relative"
							>
								<button
									onClick={() => handleDeleteMap(map.id, i)}
									className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors"
									title="Deletar mapa"
								>
									🗑️
								</button>
								<h4 className="font-semibold text-center mb-2">{map.name || `Mapa #${i + 1}`}</h4>
								<p className="text-xs text-gray-400 text-center mb-3">
									{map.rows || map.length}x{map.cols || map[0]?.length}
								</p>
								<div
									className="grid gap-0 mx-auto mb-3 border border-gray-500"
									style={{
										gridTemplate: `repeat(${map.rows || map.length}, 16px) / repeat(${map.cols || map[0]?.length}, 16px)`,
										maxWidth: "128px",
										// backgroundImage: `url(${tilesetPath})`,
										// backgroundSize: `${tilesetCols * 16}px ${tilesetRows * 16}px`,
										// imageRendering: "pixelated",
									}}
								>
									{(map.grid || map).map((row, rowIdx) =>
										row.map((cell, colIdx) => {
											const isTile = cell?.type === "tile"
											const isEnemy = cell?.type === "enemy"

											return (
												<div
													key={`${rowIdx}-${colIdx}`}
													className={isEnemy ? "bg-red-500/40" : ""}
													style={{
														width: "16px",
														height: "16px",
														backgroundImage: isTile ? `url(${tilesetPath})` : "none",
														backgroundPosition: isTile ? `-${cell.x * 16}px -${cell.y * 16}px` : "0 0",
														backgroundSize: isTile ? `${tilesetCols * 16}px ${tilesetRows * 16}px` : "auto",
														imageRendering: "pixelated",
													}}
												></div>
											)
										})
									)}
								</div>
							</div>
						))}
					</Container>
				)}
			</div>
		</div>
	)
}
