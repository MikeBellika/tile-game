import dynamic from "next/dynamic"

export default function Home() {
  // To client side render the game
  const Game = dynamic(() => import("../../components/Game"), {
    ssr: false,
  })
  return (
    <div className="flex h-full w-full justify-center">
      <Game />
    </div>
  )
}
