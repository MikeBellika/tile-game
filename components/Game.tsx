"use client"
import {
  Board,
  BoardChange,
  Position,
  copyBoard,
  positionToNumber,
  uniqueNewMatches,
  useBoard,
} from "@/hooks/useBoard"
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
  const [board, setBoard] = useState<BoardChange>([initialBoard, new Map()])
  const [animating, setAnimating] = useState(false)
  const [selectedFrom, setSelectedFrom] = useState<Position | undefined>(
    undefined,
  )
  const [boardsHistory, setBoardsHistory] = useState<BoardChange[]>([board])
  const [currentRevision, setCurrentRevision] = useState(0)

  async function clickTile(position: Position) {
    console.log(
      "clicked ",
      position,
      Math.pow(2, board[0][position.x][position.y].value),
      Math.pow(2, getTileValue(position, board[0]).value),
    )
    console.log(uniqueNewMatches(board[0]))
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
    const boards = swapTile(selectedFrom, position, board[0])
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

  function getExitTo(position: Position): Position | undefined {
    const exitMap = board[1]
    const positionToExitTo = exitMap.get(positionToNumber(position, board[0]))
    if (!positionToExitTo) {
      return
    }
    const { x, y } = positionToExitTo
    return { y: (position.y - y) * -80, x: (position.x - x) * -80 }
  }
  return (
    <div className="flex flex-col">
      <main className="grid w-fit grid-cols-8 grid-rows-8 items-center gap-4 ">
        <AnimatePresence mode="popLayout">
          {board[0].map((row, y) =>
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
                  const newBoard = copyBoard(board[0])
                  newBoard[x][y].value = newValue
                  setBoard([newBoard, new Map()])
                }}
                initial={{ y: -80 }}
                animate={{ y: 0 }}
                exit={{
                  y: getExitTo({ x, y })?.y ?? 0,
                  x: getExitTo({ x, y })?.x ?? 0,
                }}
                className={`${getExitTo({ x, y }) ? "z-0" : "z-10"}`}
                // drag
                // dragConstraints={{ top: 5, left: 5, right: 5, bottom: 5 }}
                key={board[0][x][y].id}
                onClick={(_) => clickTile({ x, y })}
              >
                <Tile
                  tile={board[0][x][y]}
                  selected={selectedFrom?.x == x && selectedFrom.y == y}
                  color={getTileColor(board[0][x][y])}
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
