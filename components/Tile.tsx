import { getContrastTextColor, getTileColor, type Tile } from "@/hooks/useBoard"
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
  selected,
}: {
  tile: Tile
  selected: boolean
}) {
  const [scope, animate] = useAnimate()
  const previousValue = usePrevious(tile.value)
  const color = getTileColor(tile)

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
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 700, damping: 20 }}
      style={{ background: color, color: getContrastTextColor(color) }}
      className={`flex h-full w-full select-none items-center justify-center rounded font-bold text-black transition-colors duration-700 ${
        selected ? "ring ring-yellow-400" : ""
      } ${tile.value > 9 ? "text-sm md:text-xl" : "text-xl md:text-2xl"} ${tile.value > 10 && "text-base shadow-[0px_0px_20px_10px_#ed8936] md:text-xl"}`}
      ref={scope}
    >
      {Math.pow(2, tile.value)}
    </motion.div>
  )
}
