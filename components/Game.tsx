"use client"
import {
  Board,
  Position,
  copyBoard,
  uniqueNewMatches,
  useBoard,
} from "@/hooks/useBoard"
import { motion, AnimatePresence } from "framer-motion"
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
  const [boardsHistory, setBoardsHistory] = useState<Board[]>([board])
  const [currentRevision, setCurrentRevision] = useState(0)

  async function clickTile(position: Position) {
    console.log(
      "clicked ",
      position,
      Math.pow(2, board[position.x][position.y].value),
      Math.pow(2, getTileValue(position, board).value),
    )
    console.log(uniqueNewMatches(board))
    if (animating) {
      return
    }
    if (!selectedFrom) {
      // return
      setSelectedFrom(position)
      return
    }
    if (selectedFrom.x == position.x && selectedFrom.y == position.y) {
      setSelectedFrom(undefined)
      return
    }
    const boards = swapTile(selectedFrom, position, board)
    console.log(`Got ${boards.length} new boards`)
    setAnimating(true)
    const newBoardsHistory = [...boardsHistory, ...boards]
    setBoardsHistory(newBoardsHistory)
    for (const [index, newBoard] of boards.entries()) {
      setBoard(newBoard)
      if (index < boards.length - 1) {
        await new Promise((r) => setTimeout(r, 2000))
      }
    }
    setCurrentRevision(newBoardsHistory.length - 1)
    setSelectedFrom(undefined)
    setAnimating(false)
  }

  function undo() {
    setCurrentRevision(currentRevision - 1)
    setBoard(boardsHistory[currentRevision - 1])
  }
  function redo() {
    setCurrentRevision(currentRevision + 1)
    setBoard(boardsHistory[currentRevision + 1])
  }

  function getExitTo({ x, y }: Position): Position | undefined {
    const tile = board[x][y]
    if (!tile.removed) {
      return undefined
    }
    return { x: (x - tile.mergedTo.x) * -80, y: (y - tile.mergedTo.y) * -80 }
  }
  return (
    <div className="flex flex-col">
      <main className="grid w-fit grid-cols-8 grid-rows-8 items-center gap-4 ">
        <AnimatePresence mode="popLayout">
          {board.map((row, y) =>
            row.map((_, x) => (
              <motion.button
                disabled={animating}
                layout
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 30,
                }}
                onContextMenu={(event) => {
                  event.preventDefault()
                  const newValue = parseInt(prompt("Enter new value") ?? "0")
                  const newBoard = copyBoard(board)
                  newBoard[x][y].value = newValue
                  setBoard(newBoard)
                }}
                initial={{ y: -80 }}
                animate={getExitTo({ x, y }) ?? { y: 0 }}
                className={`${getExitTo({ x, y }) ? "z-0" : "z-10"}`}
                // drag
                // dragConstraints={{ top: 5, left: 5, right: 5, bottom: 5 }}
                key={board[x][y].id}
                onClick={(_) => clickTile({ x, y })}
              >
                <Tile
                  tile={board[x][y]}
                  selected={selectedFrom?.x == x && selectedFrom.y == y}
                  color={getTileColor(board[x][y])}
                />
              </motion.button>
            )),
          )}
        </AnimatePresence>
      </main>
      boards history length {boardsHistory.length}
      <button disabled={currentRevision == 0} onClick={() => undo()}>
        Undo
      </button>
      <button
        disabled={currentRevision == boardsHistory.length - 1}
        onClick={() => redo()}
      >
        Redo
      </button>
      <span>Current revision: {currentRevision}</span>
    </div>
  )
}
