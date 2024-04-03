"use client"
import dynamic from "next/dynamic"

export default function Home() {
  const Game = dynamic(() => import("../../components/Game"), { ssr: false })

  return (
    <div className="flex h-full w-full justify-center">
      <Game />
    </div>
  )
}
