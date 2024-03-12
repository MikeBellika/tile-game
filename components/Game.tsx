"use client"
import { Board, Position, useBoard } from "@/hooks/useBoard"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { useState } from "react"
import Tile from "./Tile"

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
  const [debugBoardIndex, setDebugBoardIndex] = useState(0)
  const [boardsHistory, setBoardsHistory] = useState<Board[]>([initialBoard])

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
    console.log(`Got ${boards.length} new boards`)
    setAnimating(true)
    setBoardsHistory([...boardsHistory, ...boards])
    for (const [index, newBoard] of boards.entries()) {
      setBoard(newBoard)
      setDebugBoardIndex(index)
      if (index < boards.length - 1) {
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
    setDebugBoardIndex(0)
    setSelectedFrom(undefined)
    setAnimating(false)
  }

  async function panTile(
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    position: Position,
  ) {
    console.log("panned", event, info, position)
  }

  function undo() {
    setBoard(boardsHistory[boardsHistory.length - 2])
    setBoardsHistory(boardsHistory.reverse().splice(1).reverse())
  }
  return (
    <div className="flex flex-col">
      Currently animating: {debugBoardIndex}, boards length
      {boardsHistory.length}
      <button disabled={boardsHistory.length == 1} onClick={() => undo()}>
        Undo
      </button>
      <main className="grid w-fit grid-cols-8 grid-rows-8 items-center gap-4 ">
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
                drag
                dragConstraints={{ top: 5, left: 5, right: 5, bottom: 5 }}
                key={tile.id}
                onClick={(_) => clickTile({ x, y })}
                onPan={(event, panInfo) => panTile(event, panInfo, { x, y })}
              >
                <Tile tile={tile} color={getTileColor(tile)} />
              </motion.button>
            )),
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
