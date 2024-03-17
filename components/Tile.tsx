import { type Tile } from "@/hooks/useBoard"
import { AnimationSequence, motion, useAnimate } from "framer-motion"
import { useEffect, useRef } from "react"
function usePrevious<T>(value: T) {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
export default function Tile({
  tile,
  color,
  selected,
}: {
  tile: Tile
  color: string
  selected: boolean
}) {
  const [scope, animate] = useAnimate()
  const previousValue = usePrevious(tile.value)

  useEffect(() => {
    // We only want to animate when the tile changes value from a combo. Not when a new tile lands.
    if (previousValue == undefined) {
      return
    }
    const sequence: AnimationSequence = [
      [scope.current, { scale: 1.3, border: "10px solid white" }],
      [scope.current, { scale: 1, border: "none" }],
    ]
    animate(sequence)
  }, [tile.value])
  return (
    <motion.div
      whileHover={{ scale: 1.2 }}
      transition={{ type: "spring", stiffness: 700, damping: 20 }}
      style={{ background: color }}
      className={`flex size-16 text-2xl duration-700 transition-colors font-bold items-center justify-center rounded text-black ${
        selected ? "ring ring-yellow-400" : ""
      }`}
      ref={scope}
    >
      {Math.pow(2, tile.value)}
    </motion.div>
  )
}
