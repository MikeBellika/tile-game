import { getCookie, setCookie } from "@/utils/cookies"
import { finishedTutorial, isTutorialDone } from "@/utils/storedState"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

export default function Tutorial() {
  const doneTutorial = isTutorialDone()
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(!doneTutorial)
  const variants = {
    initial: { x: 300, opacity: 0 },
    enter: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  }

  function exitTutorial() {
    setOpen(false)
    finishedTutorial()
  }
  const steps = [
    <motion.div
      key={0}
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <div className="h-max w-full rounded border border-white p-2">
        <img src="/tutorial1.jpg" className="h-full w-full" />
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <span>
          Swap tiles to make a combination of three or more identical tiles.
        </span>
        <button
          onClick={() => setStep(1)}
          className="rounded border border-black py-1 dark:border-white"
        >
          Next
        </button>
      </div>
    </motion.div>,
    <motion.div
      key={1}
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <div className="h-max w-full rounded border border-white p-2">
        <img src="/tutorial2.jpg" className="h-full w-full" />
      </div>
      <div className="mt-4 flex flex-col gap-4">
        <span>
          The more tiles in the match, the higher the resulting tile will be. In
          this case the result will be 16.
        </span>
        <button
          onClick={exitTutorial}
          className="rounded border border-black py-1 dark:border-white"
        >
          Close
        </button>
      </div>
    </motion.div>,
  ]
  return (
    <dialog
      className="fixed z-50 h-min w-full bg-transparent p-8 text-black sm:w-1/2 dark:text-white"
      open={open}
    >
      <div className="flex justify-center overflow-hidden rounded bg-white p-8 shadow-md dark:bg-black/90 dark:shadow-gray-500">
        <AnimatePresence mode="popLayout">{steps[step]}</AnimatePresence>
      </div>
    </dialog>
  )
}
