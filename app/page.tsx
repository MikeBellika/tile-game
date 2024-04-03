"use client"
import Game from "@/components/Game"
import Settings from "@/components/Settings"
import { AnimationSpeeds, useSettings } from "@/hooks/useSettings"

export default function Home() {
  const { animationSpeed, setAnimationSpeed, gamePosition, setGamePosition } =
    useSettings()
  const animationDuration = AnimationSpeeds[animationSpeed]

  let justify = undefined
  if (gamePosition == "top") {
    justify = "justify-start"
  } else if (gamePosition == "middle") {
    justify = "justify-center"
  } else {
    justify = "justify-end"
  }

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className={`flex flex-1 flex-col items-center ${justify}`}>
        <Game animationDuration={animationDuration} />
      </div>
      <Settings
        setAnimationSpeed={setAnimationSpeed}
        animationSpeed={animationSpeed}
        gamePosition={gamePosition}
        setGamePosition={setGamePosition}
      />
    </div>
  )
}
