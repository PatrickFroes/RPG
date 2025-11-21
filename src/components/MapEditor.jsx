import React, { useState, useEffect } from "react"
import { Button, InputNumber } from "./Inputs.jsx"
import { Container } from "./Containers"
import AnimatedEnemySprite from "../data/functions.jsx"
import { saveMap, removeMap, toggleMapFavorite, loadMaps, updateMap } from "../api"

export default function MapEditor({ maps, setMaps, enemies }) {
	const [size, setSize] = useState(8)
	const [grid, setGrid] = useState([])
	const [editing, setEditing] = useState(false)
	const [editingMapId, setEditingMapId] = useState(null)
	const [selectedType, setSelectedType] = useState("tile")
	const [selectedEnemyIdx, setSelectedEnemyIdx] = useState(null)
	const [mapName, setMapName] = useState("")
	const [selectedTile, setSelectedTile] = useState({ x: 0, y: 0 }) // Tile selecionado do tileset
	const [collisionMode, setCollisionMode] = useState(false) // Modo de edição de colisão
	const [tilesetPath, setTilesetPath] = useState("/tileset.png") // Caminho da imagem do tileset
	const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

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
		const currentCell = newGrid[row][col] || { type: "tile", x: 0, y: 0 }

		if (collisionMode) {
			// Modo de colisão: alterna o estado de colisão do tile
			newGrid[row][col] = {
				...currentCell,
				hasCollision: !currentCell.hasCollision
			}
		} else if (selectedType === "enemy") {
			// Só adiciona inimigo se houver um selecionado
			if (selectedEnemyIdx !== null) {
				newGrid[row][col] = { 
					...currentCell,
					enemy: enemies[selectedEnemyIdx] 
				}
			}
			// Se não há inimigo selecionado, não faz nada
		} else if (selectedType === "tile") {
			// Atualiza o tile mas mantém o inimigo e colisão se houver
			newGrid[row][col] = { 
				type: "tile", 
				x: selectedTile.x, 
				y: selectedTile.y,
				...(currentCell.enemy ? { enemy: currentCell.enemy } : {}),
				...(currentCell.hasCollision ? { hasCollision: currentCell.hasCollision } : {})
			}
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
			if (editingMapId) {
				// Atualizar mapa existente
				await updateMap(editingMapId, mapData)
				setMaps(maps.map(m => m.id === editingMapId ? { ...m, ...mapData } : m))
			} else {
				// Criar novo mapa
				await saveMap(mapData)
				setMaps([...maps, mapData])
			}
			
			setGrid([])
			setEditing(false)
			setEditingMapId(null)
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

	async function handleToggleFavorite(id, index) {
		try {
			await toggleMapFavorite(id)
			const updatedMaps = [...maps]
			updatedMaps[index] = { 
				...updatedMaps[index], 
				isFavorite: !updatedMaps[index].isFavorite 
			}
			setMaps(updatedMaps)
		} catch (error) {
			console.error("Erro ao marcar favorito:", error)
		}
	}

	function handleEditMap(map) {
		setMapName(map.name)
		setSize(map.rows || map.cols || 8)
		setGrid(map.grid || [])
		setEditing(true)
		setEditingMapId(map.id)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	function handleCancelEdit() {
		setEditingMapId(null)
		setEditing(false)
		setGrid([])
		setMapName("")
		setSize(8)
	}

	function exportMaps() {
		const dataStr = JSON.stringify(maps, null, 2)
		const dataBlob = new Blob([dataStr], { type: 'application/json' })
		const url = URL.createObjectURL(dataBlob)
		const link = document.createElement('a')
		link.href = url
		link.download = `mapas_${new Date().toISOString().split('T')[0]}.json`
		link.click()
		URL.revokeObjectURL(url)
	}

	function importMaps(event) {
		const file = event.target.files[0]
		if (!file) return
		
		const reader = new FileReader()
		reader.onload = async (e) => {
			try {
				const importedData = JSON.parse(e.target.result)
				if (!Array.isArray(importedData)) {
					alert('Formato de arquivo inválido')
					return
				}
				
				// Salvar cada mapa importado
				for (const map of importedData) {
					try {
						await saveMap({
							name: map.name,
							grid: map.grid,
							rows: map.rows,
							cols: map.cols
						})
					} catch (error) {
						console.error('Erro ao importar mapa:', map.name, error)
					}
				}
				
				// Recarregar a lista
				const updated = await loadMaps()
				setMaps(updated)
				alert(`${importedData.length} mapa(s) importado(s) com sucesso!`)
			} catch (error) {
				console.error('Erro ao importar:', error)
				alert('Erro ao importar arquivo JSON')
			}
		}
		reader.readAsText(file)
		event.target.value = '' // Reset input
	}

	function renderGrid() {
		return grid.map((row, i) =>
			row.map((cell, j) => {
				const isTile = cell?.type === "tile" || cell?.x !== undefined
				const hasEnemy = cell?.enemy !== undefined
				const hasCollision = cell?.hasCollision === true

				return (
					<div
						key={`${i}-${j}`}
						onClick={() => updateCell(i, j)}
						className={`cell border cursor-pointer hover:border-cyan-400 transition-colors relative ${
							hasEnemy ? "cell-enemy" : ""
						} ${
							hasCollision ? "border-yellow-500 border-2" : "border-gray-600"
						}`}
						title={`(${i},${j})${hasCollision ? " - Colisão" : ""}`}
						style={{
							width: `${cellSize}px`,
							height: `${cellSize}px`,
							backgroundImage: isTile ? `url(${tilesetPath})` : "none",
							backgroundPosition: isTile ? `-${(cell.x || 0) * tileSize * (cellSize / tileSize)}px -${(cell.y || 0) * tileSize * (cellSize / tileSize)}px` : "0 0",
							backgroundSize: isTile ? `${tilesetCols * cellSize}px ${tilesetRows * cellSize}px` : "auto",
							imageRendering: "pixelated",
							backgroundColor: isTile ? "transparent" : "#1a1a1a",
						}}
					>
						{hasCollision && (
							<div className="absolute inset-0 bg-yellow-500 opacity-30 pointer-events-none" />
						)}
						{hasEnemy && cell.enemy && (
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
							{editing ? "Editando Mapa..." : "Criar Novo Mapa"}
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

						{editingMapId && (
							<div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded text-yellow-200 text-sm text-center">
								⚠️ Editando mapa. Clique em "Cancelar Edição" para voltar ao modo de criação.
							</div>
						)}

						<div className="flex justify-center mt-6 gap-3">
							<Button
								onClick={saveCurrentMap}
								disabled={!editing}
								variant="play"
								className="px-8"
							>
								{editingMapId ? '✏️ Atualizar Mapa' : '✨ Salvar Mapa'}
							</Button>
							{editingMapId && (
								<Button
									onClick={handleCancelEdit}
									variant="default"
									className="px-6 bg-gray-600 hover:bg-gray-500"
								>
									Cancelar Edição
								</Button>
							)}
						</div>
						</div>							{/* Coluna Direita */}

							<Container>
								<div className="flex flex-col gap-4">
						<h3 className="text-lg font-semibold mb-4 text-center">Ferramentas</h3>
						<div className="flex flex-col gap-3">
							<Button
								onClick={() => {
									setSelectedType("tile")
									setCollisionMode(false)
								}}
								variant={selectedType === "tile" && !collisionMode ? "play" : "default"}
								className="w-full justify-center"
							>
								Tile
							</Button>
							<Button
								onClick={() => {
									setSelectedType("enemy")
									setCollisionMode(false)
								}}
								variant={selectedType === "enemy" && !collisionMode ? "play" : "default"}
								className="w-full justify-center"
							>
								Inimigo
							</Button>
							<Button
								onClick={() => {
									setCollisionMode(!collisionMode)
									if (!collisionMode) setSelectedType("tile")
								}}
								variant={collisionMode ? "play" : "default"}
								className="w-full justify-center"
							>
								Colisão
							</Button>
						</div>
						{collisionMode && (
							<div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500 rounded text-sm text-center">
								<p className="text-yellow-300 font-medium">Modo de Colisão Ativo</p>
								<p className="text-gray-400 text-xs mt-1">Clique nos tiles para marcar/desmarcar colisão</p>
							</div>
						)}
						<div className="mt-4 p-3 bg-[#0a1f2e] border border-gray-600 rounded text-sm">
							<p className="text-gray-300 font-medium mb-2">Legenda:</p>
							<div className="space-y-1 text-xs text-gray-400">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-yellow-500 bg-yellow-500 opacity-30"></div>
									<span>Tile com colisão</span>
								</div>
							</div>
						</div>									{/* Seleção de inimigos */}
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
				<div className="flex justify-between items-center mb-3">
					<h3 className="text-lg font-semibold">
						Mapas Salvos <span className={`${maps.length === 0 ? "text-gray-400" : "text-green-400"}`}>({maps.filter(m => !showOnlyFavorites || m.isFavorite).length})</span>:
					</h3>
					<div className="flex gap-2">
						<label className="px-3 py-1 rounded text-sm transition-colors bg-blue-700 text-white hover:bg-blue-600 cursor-pointer" title="Importar mapas de JSON">
							↑ Importar JSON
							<input type="file" accept=".json" onChange={importMaps} className="hidden" />
						</label>
						<button
							onClick={exportMaps}
							disabled={maps.length === 0}
							className="px-3 py-1 rounded text-sm transition-colors bg-green-700 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
							title="Exportar mapas em JSON"
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
				{maps.length === 0 ? (
					<Container className="text-center py-8">
						<div className="text-gray-400">Nenhum mapa salvo ainda</div>
						<p className="text-gray-500 text-sm mt-2">Crie e salve um mapa para vê-lo aqui!</p>
					</Container>
				) : (
					<Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{maps.filter(m => !showOnlyFavorites || m.isFavorite).map((map, i) => (
							<div
								key={i}
								className="border border-(--border-color) rounded p-4 relative"
							>
							<div className="absolute top-2 right-2 flex gap-1">
								<button
									onClick={() => handleEditMap(map)}
									className="w-8 h-8 flex items-center justify-center rounded bg-blue-600/80 hover:bg-blue-500 text-white transition-all hover:scale-110 shadow-lg"
									title="Editar mapa"
								>
									<span className="text-sm">✏️</span>
								</button>
								<button
									onClick={() => handleToggleFavorite(map.id, i)}
									className={`w-8 h-8 flex items-center justify-center rounded transition-all hover:scale-110 shadow-lg ${
										map.isFavorite 
											? 'bg-yellow-500/80 hover:bg-yellow-400 text-white' 
											: 'bg-gray-600/80 hover:bg-gray-500 text-gray-300'
									}`}
									title={map.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
								>
									<span className="text-sm">{map.isFavorite ? '★' : '☆'}</span>
								</button>
								<button
									onClick={() => handleDeleteMap(map.id, i)}
									className="w-8 h-8 flex items-center justify-center rounded bg-red-600/80 hover:bg-red-500 text-white transition-all hover:scale-110 shadow-lg"
									title="Deletar mapa"
								>
									<span className="text-lg font-bold">×</span>
								</button>
							</div>
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
									const isTile = cell?.type === "tile" || cell?.x !== undefined
									const hasEnemy = cell?.enemy !== undefined

									return (
										<div
											key={`${rowIdx}-${colIdx}`}
											style={{
												width: "16px",
												height: "16px",
												backgroundImage: isTile ? `url(${tilesetPath})` : "none",
												backgroundPosition: isTile ? `-${(cell.x || 0) * tileSize * 2}px -${(cell.y || 0) * tileSize * 2}px` : "0 0",
												backgroundSize: isTile ? `${tilesetCols * tileSize * 2}px ${tilesetRows * tileSize * 2}px` : "auto",
												imageRendering: "pixelated",
												backgroundColor: isTile ? "transparent" : "#1a1a1a",
												position: "relative"
											}}
										>
											{hasEnemy && (
												<div className="absolute inset-0 bg-red-500/50 border border-red-400" title="Inimigo"></div>
											)}
										</div>
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
