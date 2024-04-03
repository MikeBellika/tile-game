import { useState, useEffect } from "react"

export const AnimationSpeeds = {
  instant: 0,
  fast: 0.2,
  medium: 0.4,
  slow: 0.7,
}

export type AnimationSpeed = keyof typeof AnimationSpeeds

export const GamePositions = ["top", "middle", "bottom"] as const
export type GamePosition = (typeof GamePositions)[number]

export function useSettings() {
  const localStorageAnimationSpeed = localStorage.getItem(
    "animationSpeed",
  ) as AnimationSpeed | null
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(
    localStorageAnimationSpeed || "medium",
  )

  const localStorageGamePosition = localStorage.getItem(
    "gamePosition",
  ) as GamePosition | null
  const [gamePosition, setGamePosition] = useState<GamePosition>(
    localStorageGamePosition || "middle",
  )

  useEffect(() => {
    localStorage.setItem("animationSpeed", animationSpeed)
  }, [animationSpeed])

  useEffect(() => {
    localStorage.setItem("gamePosition", gamePosition)
  }, [gamePosition])

  return { animationSpeed, setAnimationSpeed, gamePosition, setGamePosition }
}
