import { type Tile } from "@/hooks/useBoard"
import { AnimationSequence, motion, useAnimate } from "framer-motion"
import { useEffect } from "react"
export default function Tile({ tile, color }: { tile: Tile; color: string }) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    const sequence: AnimationSequence = [
      [scope.current, { scale: 1.3, border: "20px solid white" }],
      [scope.current, { scale: 1, border: "none" }],
    ]
    animate(sequence)
  }, [color])
  return (
    <motion.div
      whileHover={{ scale: 1.2 }}
      transition={{ type: "spring", stiffness: 700, damping: 20 }}
      style={{ background: color }}
      className="flex size-16 text-2xl duration-500 transition-colors font-bold items-center justify-center rounded text-black"
      ref={scope}
    >
      {Math.pow(2, tile.value)}
    </motion.div>
  )
}
