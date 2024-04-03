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
  // Initial states are now functions to lazily evaluate the initial state
  // This prevents the code from running on server-side rendering
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(() => {
    if (typeof window === "undefined") {
      return "medium" // Default value for server-side rendering
    }
    return (
      (localStorage.getItem("animationSpeed") as AnimationSpeed) || "medium"
    )
  })

  const [gamePosition, setGamePosition] = useState<GamePosition>(() => {
    if (typeof window === "undefined") {
      return "top" // Default value for server-side rendering
    }
    return (localStorage.getItem("gamePosition") as GamePosition) || "top"
  })

  // Only update localStorage when values change, this will not
  // overwrite on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("animationSpeed", animationSpeed)
    }
  }, [animationSpeed])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gamePosition", gamePosition)
    }
  }, [gamePosition])

  return { animationSpeed, setAnimationSpeed, gamePosition, setGamePosition }
}
