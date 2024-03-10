import dynamic from "next/dynamic";

export default function Home() {
  // To client side render the game
  const Game = dynamic(() => import("../components/Game"), {
    ssr: false,
  });
  return <Game />;
}
