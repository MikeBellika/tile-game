import { getCookie, setCookie } from "@/utils/cookies"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

export default function Tutorial() {
  const doneTutorial = getCookie("doneTutorial") != undefined
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(!doneTutorial)
  const variants = {
    initial: { x: 300, opacity: 0 },
    enter: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  }

  function exitTutorial() {
    setOpen(false)
    setCookie("doneTutorial", 1, 1000)
  }
  const steps = [
    <motion.div
      key={0}
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <div className="border w-full border-white rounded p-2 w-full h-max">
        <img src="/tutorial1.jpg" className="w-full h-full" />
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <span>
          Swap tiles to make a combination of three or more identical tiles.
        </span>
        <button
          onClick={() => setStep(1)}
          className="border py-1 rounded dark:border-white border-black"
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
      <div className="border border-white rounded p-2 w-full h-max">
        <img src="/tutorial2.jpg" className="w-full h-full" />
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <span>
          The more tiles in the match, the higher the resulting tile will be. In
          this case the result will be 16.
        </span>
        <button
          onClick={exitTutorial}
          className="border py-1 rounded dark:border-white border-black"
        >
          Close
        </button>
      </div>
    </motion.div>,
  ]
  return (
    <dialog
      className="fixed text-black dark:text-white p-8 z-50 w-full sm:w-1/2 h-min bg-transparent"
      open={open}
    >
      <div className="bg-white justify-center dark:bg-black/90 p-8 shadow-md dark:shadow-gray-500 rounded flex overflow-hidden">
        <AnimatePresence mode="popLayout">{steps[step]}</AnimatePresence>
      </div>
    </dialog>
  )
}
