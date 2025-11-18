import React, { useState, useEffect } from "react"
import { Container } from "./Containers"
import { Button } from "./Inputs.jsx"
import AnimatedEnemySprite from "../data/functions.jsx"
import { ENEMY_TYPES } from "../data/entityData.js"
import { saveEnemy, removeEnemy } from "../api"
// Tipos de inimigos disponíveis



export default function EnemyCreator({ enemies, setEnemies }) {
	const [selectedEnemy, setSelectedEnemy] = useState(null)
	const [customStats, setCustomStats] = useState({
		name: "",
		hp: 10,
		atk: 3,
		spd: 3,
		ac: 12,
		attackType: "melee",
		range: 1,
	})

	const handleEnemySelect = (enemy) => {
		setSelectedEnemy(enemy)
		setCustomStats({
			name: enemy.name,
			...enemy.stats,
			attackType: enemy.attackType,
			range: enemy.range,
		})
	}

	const handleAddEnemy = async () => {
		if (!customStats.name || !selectedEnemy) return

		const newEnemy = {
			name: customStats.name,
			type: selectedEnemy.type,
			hp: customStats.hp,
			atk: customStats.atk,
			spd: customStats.spd,
			spriteUrl: selectedEnemy.spriteUrl,
		}

		try {
			await saveEnemy(newEnemy)
			
			setEnemies([
				...enemies,
				{
					...selectedEnemy,
					name: customStats.name,
					stats: {
						hp: customStats.hp,
						atk: customStats.atk,
						spd: customStats.spd,
						ac: customStats.ac,
					},
					attackType: customStats.attackType,
					range: customStats.range,
					currentHp: customStats.hp,
					alive: true,
				},
			])

			// Reset
			setCustomStats({
				name: "",
				hp: 10,
				atk: 3,
				spd: 3,
				ac: 12,
				attackType: "melee",
				range: 1,
			})
			setSelectedEnemy(null)
		} catch (error) {
			console.error("Erro ao salvar inimigo:", error)
		}
	}

	const handleDeleteEnemy = async (id, index) => {
		try {
			if (id) {
				await removeEnemy(id)
			}
			setEnemies(enemies.filter((_, i) => i !== index))
		} catch (error) {
			console.error("Erro ao deletar inimigo:", error)
		}
	}

	return (
		<div className="p-4 space-y-4">
			<h2 className="text-4xl font-bold text-center mb-6">Criador de Inimigos</h2>

			<div>
				<h3 className="text-lg font-semibold p-4 text-gray-400">Selecionar Tipo de Inimigo</h3>
				<Container className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 ">
					{ENEMY_TYPES.map((enemy) => (
						<AnimatedEnemySprite
							key={enemy.id}
							enemy={enemy}
							isSelected={selectedEnemy?.id === enemy.id}
							onClick={handleEnemySelect}
							size={64}
						/>
					))}
				</Container>
			</div>

			{/* Customização de stats */}
			{selectedEnemy && (
				<Container>
					<h4 className="font-semibold mb-3">Customizar {selectedEnemy.name}</h4>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						<div>
							<label className="block text-sm font-medium mb-1">Nome:</label>
							<input
								type="text"
								value={customStats.name}
								onChange={(e) => setCustomStats((prev) => ({ ...prev, name: e.target.value }))}
								className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none"
								placeholder={selectedEnemy.name}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">❤️ HP:</label>
							<input
								type="number"
								value={customStats.hp}
								onChange={(e) => setCustomStats((prev) => ({ ...prev, hp: Number(e.target.value) }))}
								className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">⚔️ ATK:</label>
							<input
								type="number"
								value={customStats.atk}
								onChange={(e) => setCustomStats((prev) => ({ ...prev, atk: Number(e.target.value) }))}
								className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">🛡 CA:</label>
							<input
								type="number"
								value={customStats.ac}
								onChange={(e) => setCustomStats((prev) => ({ ...prev, ac: Number(e.target.value) }))}
								className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">🏃 SPD:</label>
							<input
								type="number"
								value={customStats.spd}
								onChange={(e) => setCustomStats((prev) => ({ ...prev, spd: Number(e.target.value) }))}
								className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Tipo:</label>
							<select
								value={customStats.attackType}
								onChange={(e) => setCustomStats((prev) => ({ ...prev, attackType: e.target.value }))}
								className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none"
							>
								<option value="melee">Melee</option>
								<option value="ranged">Ranged</option>
							</select>
						</div>
						{customStats.attackType === "ranged" && (
							<div>
								<label className="block text-sm font-medium mb-1">Alcance:</label>
								<input
									type="number"
									value={customStats.range}
									onChange={(e) => setCustomStats((prev) => ({ ...prev, range: Number(e.target.value) }))}
									className="w-full bg-[#123240] text-white border border-gray-500 rounded px-2 py-1 focus:border-cyan-300 focus:outline-none"
								/>
							</div>
						)}
					</div>

					{/* Preview do inimigo sendo criado */}
					<Container className="mt-4">
						<h5 className="font-semibold mb-4 text-center">{customStats.name || "Novo Inimigo"}</h5>

						<div className="flex flex-col md:flex-row items-center gap-6">
							{/* Sprite animado */}
							<div className="text-center">
								<AnimatedEnemySprite
									enemy={{
										...selectedEnemy,
										name: customStats.name || selectedEnemy.name,
									}}
									isSelected={false}
									onClick={() => {}}
									size={96}
									showStats={false}
								/>
							</div>
							{/* Stats detalhados */}
							<div className="flex-1">
								<div className="grid grid-cols-2 gap-3">
									<div className="text-center p-2 border border-red-700 rounded">
										<div className="text-xl font-bold">❤️ {customStats.hp}</div>
										<div className="text-xs text-gray-300">HP</div>
									</div>
									<div className="text-center p-2 border border-yellow-700 rounded">
										<div className="text-xl font-bold">⚔️ {customStats.atk}</div>
										<div className="text-xs text-gray-300">ATK</div>
									</div>
									<div className="text-center p-2 border border-blue-700 rounded">
										<div className="text-xl font-bold">🏃 {customStats.spd}</div>
										<div className="text-xs text-gray-300">SPD</div>
									</div>
									<div className="text-center p-2 border border-green-700 rounded">
										<div className="text-xl font-bold">🛡 {customStats.ac}</div>
										<div className="text-xs text-gray-300">AC</div>
									</div>
								</div>
							</div>
						</div>
					</Container>

					<Button
						onClick={handleAddEnemy}
						className="mt-4 w-full"
						disabled={!customStats.name}
					>
						Adicionar Inimigo
					</Button>
				</Container>
			)}

			{/* Lista de inimigos criados */}
			<div>
				<h3 className="text-lg font-semibold mb-3">Inimigos Criados <span className={`${enemies.length === 0 ? "text-gray-400" : "text-green-400"}`}>({enemies.length})</span>:</h3>
				{enemies.length === 0 ? (
					<Container className="text-center py-8">
						<div className="text-gray-400">Nenhum inimigo criado ainda</div>
						<p className="text-gray-500 text-sm mt-2">Selecione um tipo acima e customize para começar!</p>
					</Container>
				) : (
					<Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{enemies.map((enemy, i) => (
							<div
								key={i}
								className="p-3 border border-gray-500 rounded relative"
							>
								<button
									onClick={() => handleDeleteEnemy(enemy.id, i)}
									className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors"
									title="Deletar inimigo"
								>
									🗑️
								</button>
								<AnimatedEnemySprite
									enemy={enemy}
									isSelected={false}
									onClick={() => {}}
									size={64}
									showStats={false}
									showName={false}
									mainClass="flex flex-col items-center border-none text-center mb-2"
								/>
								<div className="flex justify-center">
									<h4 className="font-semibold text-2xl text-rose-400 text-shadow-10 text-shadow-red-600">{enemy.name}</h4>
								</div>
								<div>
									<span className="text-xs text-gray-500">#{i + 1}</span>
								</div>

								{/* Stats em linha */}
								<div className="text-xs text-center space-y-1">
									<div>
										❤️{enemy.stats?.hp || enemy.hp} ⚔️{enemy.stats?.atk || enemy.atk} 🏃{enemy.stats?.spd || enemy.spd} 🛡{enemy.stats?.ac || enemy.ac}
									</div>
									<div className="text-gray-400">{enemy.attackType === "ranged" ? `Ranged (${enemy.range})` : "Melee"}</div>
								</div>
							</div>
						))}
					</Container>
				)}
			</div>
		</div>
	)
}
