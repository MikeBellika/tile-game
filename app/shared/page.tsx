"use client"
import Button from "@/components/Button"
import { useBoard } from "@/hooks/useBoard"
import { getGameState, saveGameState } from "@/utils/storedState"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  if (typeof window == "undefined") {
    return <div>Loading</div>
  }
  const sharedState = new URLSearchParams(window.location.search)
  const seed = sharedState.get("s") ?? undefined
  if (seed == undefined) {
    redirect("/exponentile")
  }
  const { board: initialBoard, rng } = useBoard(8, seed)

  const [loading, setLoading] = useState(true)

  async function setStateFromSeed() {
    const state = rng.state()
    console.log("state:", state.j, state.i, state.S[0], state.S[1])
    await saveGameState(initialBoard, 0, 0, rng.state())
    window.location.href = "/exponentile"
  }

  useEffect(() => {
    async function setBoard() {
      const existingState = await getGameState()
      // We don't want to overwrite the existing game
      if (!existingState || existingState.moves == 0) {
        await setStateFromSeed()
      } else {
        setLoading(false)
      }
    }
    setBoard()
  }, [])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4">
      {!loading && (
        <div className="flex w-full flex-col items-center gap-6 sm:w-1/2">
          You already have an ongoing game. Do you want to overwrite it and
          start from scratch?
          <Button onClick={() => setStateFromSeed()}>Ok</Button>
        </div>
      )}
    </div>
  )
}
