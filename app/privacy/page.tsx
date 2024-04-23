"use client"
import Button from "@/components/Button"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import { useEffect } from "react"

export default function Home() {
  const { play } = useAudioPlayer(["/sounds/blop1.mp3", "/sounds/blop2.mp3"])
  return (
    <main className="flex flex-col items-center px-2">
      <Button onClick={() => play(0.5)}>Play</Button>
      <div className="flex flex-col">
        <h1 className="py-4 text-2xl font-bold">Privacy policy</h1>
        <p>We respect your privacy and do not collect any of your data.</p>
        <p>
          For questions about this privacy policy or anything else please
          contact{" "}
          <a
            href="mailto:exponentile@bellika.dk"
            className="font-medium underline"
          >
            exponentile@bellika.dk
          </a>
          .
        </p>
        <a
          className="pt-4 font-medium underline"
          href="https://www.bellika.dk/exponentile"
        >
          Back to the game
        </a>
      </div>
    </main>
  )
}
