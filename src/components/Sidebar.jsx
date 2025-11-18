import React from "react"
import { Button } from "./Inputs"
import { Container } from "./Containers"

const SIDEBAR_BUTTONS = [
	{ mode: "map", label: "Criar Mapa", variant: "default" },
	{ mode: "char", label: "Criar Personagem", variant: "default" },
	{ mode: "enemy", label: "Criar Inimigo", variant: "default" },
	{ mode: "play", label: "Jogar", variant: "play" },
]

export default function Sidebar({ setMode, user, onLogout }) {
	return (
		<aside>
			<Container className="p-4 flex-col gap-2 text-center flex bg-(--bg-transparent) text-(--text-primary) border border-(--border-color)">
				<div
					className="w-65 h-55 mx-auto mb-4 bg-cover bg-center bg-no-repeat rounded-lg"
					style={{ backgroundImage: "url(/logo.png)" }}
				></div>

				{user && (
					<div className="mb-4 p-3 bg-[#123240] border border-gray-500 rounded">
						<div className="text-sm text-gray-400">Logado como</div>
						<div className="font-bold text-cyan-400">{user.username}</div>
					</div>
				)}

				{SIDEBAR_BUTTONS.map((button) => (
					<Button
						key={button.mode}
						onClick={() => setMode(button.mode)}
						variant={button.variant}
					>
						{button.label}
					</Button>
				))}

				{user && (
					<Button
						onClick={onLogout}
						className="mt-4 bg-red-900/30 hover:bg-red-900/50 border-red-700"
					>
						Sair
					</Button>
				)}
			</Container>
		</aside>
	)
}
