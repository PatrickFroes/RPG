
export const RACE_BONUS_CONFIG = {
	Humano: { 
		hp: 0, 
		atk: 0,
		spd: 4,
		ac: 0,
		str: 1,
		dex: 1,
		int: 1,
		cha: 1,
		description: "Versátil e equilibrado"
	},
	Elfo: { 
		hp: -2,
		atk: 0,
		spd: 5,
		ac: 1,
		str: 0,
		dex: 2,
		int: 1,
		cha: 1,
		description: "Ágil e perceptivo"
	},
	Orc: { 
		hp: 3,
		atk: 2,
		spd: 3,
		ac: -1,
		str: 2,
		dex: 0,
		int: -1,
		cha: -1,
		description: "Forte e resistente"
	},
	Gigante: { 
		hp: 5,
		atk: 1,
		spd: 2,
		ac: 0,
		str: 3,
		dex: -2,
		int: 0,
		cha: 0,
		description: "Massivo e poderoso"
	},
	Ogro: { 
		hp: 4,
		atk: 2,
		spd: 2,
		ac: 1,
		str: 3,
		dex: -1,
		int: -2,
		cha: -2,
		description: "Brutal e intimidador"
	},
	Halfling: { 
		hp: -3,
		atk: 0,
		spd: 6,
		ac: 2,
		str: -1,
		dex: 2,
		int: 0,
		cha: 2,
		description: "Pequeno e evasivo"
	},
	Gnomo: { 
		hp: -2,
		atk: 0,
		spd: 5,
		ac: 1,
		str: -1,
		dex: 1,
		int: 2,
		cha: 1,
		description: "Inteligente e curioso"
	},
}

export const CLASS_CONFIG = {
	Guerreiro: { 
		hp: 30, 
		atk: 7, 
		spd: 3, 
		ac: 16, 
		attackType: "Melee", 
		range: 1,
		spriteUrl: "/sprites/knight.png"
	},
	Ladino: { 
		hp: 22, 
		atk: 5, 
		spd: 6, 
		ac: 14, 
		attackType: "Ranged", 
		range: 3,
		spriteUrl: "/sprites/rogue.png"
	},
	Feiticeiro: { 
		hp: 18, 
		atk: 9, 
		spd: 2, 
		ac: 10, 
		attackType: "Ranged", 
		range: 7,
		spriteUrl: "/sprites/wizard.png"
	},
}
export const ENEMY_TYPES = [
	{
		id: "orc",
		name: "Orc",
		spriteUrl: "/sprites/orc.png",
		stats: { hp: 18, atk: 5, spd: 2, ac: 12 },
		description: "Orc básico - Forte mas lento",
	},
	{
		id: "orc-warrior",
		name: "Orc Guerreiro",
		spriteUrl: "/sprites/orc-warrior.png",
		stats: { hp: 28, atk: 7, spd: 2, ac: 15 },
		description: "Tanque corpo a corpo - Muito resistente",
	},
	{
		id: "orc-shaman",
		name: "Orc Xamã",
		spriteUrl: "/sprites/orc-shaman.png",
		stats: { hp: 14, atk: 6, spd: 3, ac: 10 },
		description: "Mago - Alto dano mágico, baixa defesa",
	},
	{
		id: "orc-ranged",
		name: "Orc Arqueiro",
		spriteUrl: "/sprites/orc-ranged.png",
		stats: { hp: 16, atk: 6, spd: 4, ac: 11 },
		description: "Arqueiro - Rápido e alcance longo",
	},
	{
		id: "skeleton",
		name: "Esqueleto",
		spriteUrl: "/sprites/skeleton.png",
		stats: { hp: 12, atk: 4, spd: 3, ac: 9 },
		description: "Morto-vivo básico - Frágil mas ágil",
	},
	{
		id: "skeleton-warrior",
		name: "Esqueleto Guerreiro",
		spriteUrl: "/sprites/skeleton-warrior.png",
		stats: { hp: 15, atk: 5, spd: 3, ac: 13 },
		description: "Guerreiro morto-vivo - Equilibrado",
	},
	{
		id: "skeleton-mage",
		name: "Esqueleto Mago",
		spriteUrl: "/sprites/skeleton-mage.png",
		stats: { hp: 10, atk: 7, spd: 4, ac: 8 },
		description: "Necromante - Glass cannon mágico",
	},
	{
		id: "skeleton-rogue",
		name: "Esqueleto Arqueiro",
		spriteUrl: "/sprites/skeleton-rogue.png",
		stats: { hp: 11, atk: 5, spd: 6, ac: 10 },
		description: "Assassino - Muito rápido, dano médio",
	},
]
