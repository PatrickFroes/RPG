import { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar"
import MapEditor from "./components/MapEditor"
import CharacterCreator from "./components/CharacterCreator"
import EnemyCreator from "./components/EnemyCreator"
import PlayScreen from "./components/PlayScreen"
import Auth from "./components/Auth"
import { loadCharacters, loadEnemies, loadMaps } from "./api"
import "./App.css"

export default function App() {
	const [maps, setMaps] = useState([])
	const [characters, setCharacters] = useState([])
	const [enemies, setEnemies] = useState([]) // lista de inimigos criados
	const [mode, setMode] = useState("map")
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	// Verificar se usuário já está logado
	useEffect(() => {
		const userId = localStorage.getItem('userId')
		const username = localStorage.getItem('username')
		
		if (userId && username) {
			setUser({ userId, username })
			loadUserData()
		} else {
			setLoading(false)
		}
	}, [])

	// Carregar dados do usuário
	const loadUserData = async () => {
		try {
			const [charsData, enemiesData, mapsData] = await Promise.all([
				loadCharacters(),
				loadEnemies(),
				loadMaps()
			])
			
			setCharacters(charsData)
			setEnemies(enemiesData)
			setMaps(mapsData)
		} catch (error) {
			console.error('Erro ao carregar dados:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleLogin = (userData) => {
		setUser(userData)
		loadUserData()
	}

	const handleLogout = () => {
		localStorage.removeItem('userId')
		localStorage.removeItem('username')
		setUser(null)
		setCharacters([])
		setEnemies([])
		setMaps([])
	}

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-2xl text-gray-400">⏳ Carregando...</div>
			</div>
		)
	}

	if (!user) {
		return <Auth onLogin={handleLogin} />
	}

	function renderMain() {
		if (mode === "map")
			return (
				<MapEditor
					maps={maps}
					setMaps={setMaps}
					enemies={enemies}
				/>
			)
		if (mode === "char")
			return (
				<CharacterCreator
					characters={characters}
					setCharacters={setCharacters}
				/>
			)
		if (mode === "enemy")
			return (
				<EnemyCreator
					enemies={enemies}
					setEnemies={setEnemies}
				/>
			)
		if (mode === "play")
			return (
				<PlayScreen
					maps={maps}
					characters={characters}
					enemies={enemies}
				/>
			)
		return null
	}

	return (
		<div className="grid grid-cols-[300px_1fr] h-full shadow-[0_0_40px_#aaddff22]">
			<Sidebar setMode={setMode} user={user} onLogout={handleLogout} />
			<div className="flex flex-col overflow-y-auto  border border-(--border-color) border-l-0">
				<main className="flex-1 p-4">{renderMain()}</main>
			</div>
		</div>
	)
}
