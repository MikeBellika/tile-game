"use client"
import { Board, Position, useBoard } from "@/hooks/useBoard"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function Game() {
  const {
    board: initialBoard,
    swapTile,
    getTileColor,
    getTileValue,
  } = useBoard(8)
  const [board, setBoard] = useState<Board>(initialBoard)
  const [animating, setAnimating] = useState(false)
  const [selectedFrom, setSelectedFrom] = useState<Position | undefined>(
    undefined,
  )

  async function clickTile(position: Position) {
    if (animating) {
      return
    }
    if (!selectedFrom) {
      console.log(getTileValue(position, board))
      // return
      setSelectedFrom(position)
      return
    }
    const boards = swapTile(selectedFrom, position, board)
    setAnimating(true)
    for (const [index, newBoard] of boards.entries()) {
      setBoard(newBoard)
      if (index < boards.length - 1) {
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
    setSelectedFrom(undefined)
    setAnimating(false)
  }
  return (
    <main className="grid w-fit grid-cols-8 grid-rows-8 items-center gap-4 p-24">
      <AnimatePresence mode="popLayout">
        {board.map((row, x) =>
          row.map((tile, y) => (
            <motion.button
              layout
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 30,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              key={tile.id}
              onClick={(_) => clickTile({ x, y })}
              style={{ background: getTileColor(tile) }}
              className="flex size-16 text-2xl font-bold items-center justify-center rounded text-black"
            >
              {Math.pow(2, tile.value)}
            </motion.button>
          )),
        )}
      </AnimatePresence>
    </main>
  )
}
