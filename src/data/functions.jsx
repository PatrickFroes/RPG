import React, { useState, useEffect } from "react"

export default function AnimatedEnemySprite({
    enemy,
    isSelected,
    onClick,
    size = 32,
    showStats = false,
    showName = true,
    mainClass = `flex flex-col items-center p-2 border border-(--border-color) rounded cursor-pointer transition-all duration-200 hover:ring-blue-500 hover:brightness-150 ${
        isSelected ? "ring-4 ring-green-500" : "ring-2 ring-transparent"
    }`,
}) {
    const [currentFrame, setCurrentFrame] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev + 1) % 4)
        }, 150)
        return () => clearInterval(interval)
    }, [])

    return (
        <div
            className={mainClass}
            onClick={() => onClick && onClick(enemy)}
        >
            <div
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundImage: `url(${enemy.spriteUrl})`,
                    backgroundSize: `${size * 4}px ${size}px`,
                    backgroundPosition: `-${currentFrame * size}px 0px`,
                    imageRendering: "pixelated",
                }}
            />

            {showName && <span className="text-xs mt-1 font-medium">{enemy.name}</span>}
            {showStats && (
                <div className="text-xs text-gray-200 mb-1">
                    ❤️{enemy.stats?.hp || enemy.hp} ⚔️{enemy.stats?.atk || enemy.atk}
                </div>
            )}
        </div>
    )
}
