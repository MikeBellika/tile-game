"use client"
import {
  AnimationSpeeds,
  AnimationSpeed,
  GamePositions,
  GamePosition,
} from "@/hooks/useSettings"
import { useEffect, useState } from "react"
import Button from "./Button"
import { AnimatePresence, motion } from "framer-motion"
import { useToast } from "./ui/use-toast"

export default function Settings({
  animationSpeed,
  setAnimationSpeed,
  gamePosition,
  setGamePosition,
  setDebug,
}: {
  animationSpeed: AnimationSpeed
  setAnimationSpeed: Function
  gamePosition: GamePosition
  setGamePosition: Function
  setDebug: Function
}) {
  const [open, setOpen] = useState(false)
  const [settingsPressed, setSettingsPressed] = useState<string[]>([])
  const { toast } = useToast()
  useEffect(() => {
    const lastFive = settingsPressed.slice(-5)
    const sequence = ["bottom", "top", "slow", "fast", "instant"]
    console.log({ lastFive })
    if (
      lastFive.length === sequence.length &&
      lastFive.every((value, index) => value === sequence[index])
    ) {
      setDebug(true)
      toast({ description: "Debug mode enabled" })
    }
  }, [settingsPressed])
  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed bottom-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 100 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-opacity-75 backdrop-blur-sm transition-opacity"
            />
            <motion.dialog
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "-100%", opacity: 100 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "tween", duration: 0.15 }}
              open={open}
              className="fixed z-50 h-min w-full rounded-lg border bg-white p-8 text-black sm:w-1/2 dark:bg-black  dark:text-white"
            >
              <h2 className="whitespace-nowrap text-lg font-semibold leading-none tracking-tight">
                Settings
              </h2>
              <span className="text-muted-foreground mt-2 text-sm">
                Control animation speed
              </span>

              <div className="mt-4 grid gap-1">
                <h3 className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Animation speed
                </h3>
                {Object.keys(AnimationSpeeds).map((speed) => (
                  <div key={speed}>
                    <input
                      type="radio"
                      name="speed"
                      id={`speed-${speed}`}
                      className="peer hidden"
                      checked={speed == animationSpeed}
                      value={speed}
                      onChange={() => {
                        setAnimationSpeed(speed as AnimationSpeed)
                        setSettingsPressed([...settingsPressed, speed])
                      }}
                    />

                    <label
                      htmlFor={`speed-${speed}`}
                      className="flex items-center gap-2 rounded border px-4 py-2 capitalize peer-checked:border-blue-500 peer-checked:bg-slate-200 peer-checked:dark:bg-slate-600"
                    >
                      {speed}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-1">
                <h3 className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Game position
                </h3>
                {GamePositions.map((_gamePosition) => (
                  <div key={_gamePosition}>
                    <input
                      type="radio"
                      name="gamePosition"
                      id={`gamePosition-${_gamePosition}`}
                      className="peer hidden"
                      checked={_gamePosition == gamePosition}
                      value={_gamePosition}
                      onChange={() => {
                        setGamePosition(_gamePosition as GamePosition)
                        setSettingsPressed([...settingsPressed, _gamePosition])
                      }}
                    />

                    <label
                      htmlFor={`gamePosition-${_gamePosition}`}
                      className="flex items-center gap-2 rounded border px-4 py-2 capitalize peer-checked:border-blue-500 peer-checked:bg-slate-200 peer-checked:dark:bg-slate-600"
                    >
                      {_gamePosition}
                    </label>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
                Close
              </Button>
            </motion.dialog>
          </div>
        )}
      </AnimatePresence>

      <button className="py-2" onClick={() => setOpen(true)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-settings"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </>
  )
}
