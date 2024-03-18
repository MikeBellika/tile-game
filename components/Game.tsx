"use client"
import {
  Board,
  BoardPoints,
  Position,
  copyBoard,
  getSavedGameState,
  saveGameStateToCookie,
  useBoard,
} from "@/hooks/useBoard"
import {
  motion,
  AnimatePresence,
  Transition,
  TargetAndTransition,
} from "framer-motion"
import { useEffect, useRef, useState } from "react"
import Tile from "./Tile"

export default function Game() {
  const savedState = getSavedGameState()
  const {
    board: initialBoard,
    isAdjacent,
    swapTile,
    getTileColor,
    getPositionsThatAlmostMatch,
    isGameOver,
  } = useBoard(8)
  const [board, setBoard] = useState<Board>(savedState?.board ?? initialBoard)
  const [animating, setAnimating] = useState(false)
  const [selectedFrom, setSelectedFrom] = useState<Position | undefined>(
    undefined,
  )
  const [boardsHistory, setBoardsHistory] = useState<BoardPoints[]>([
    { board, points: 0 },
  ])
  const [currentRevision, setCurrentRevision] = useState(0)

  const [points, setPoints] = useState(savedState?.points ?? 0)

  const [debug, _] = useState(false)

  const animationDuration = 0.4
  const transition: Transition = { type: "spring", duration: animationDuration }

  async function clickTile(position: Position) {
    if (animating) {
      return
    }
    if (!selectedFrom) {
      setSelectedFrom(position)
      return
    }
    if (
      (selectedFrom.x == position.x && selectedFrom.y == position.y) ||
      !isAdjacent(selectedFrom, position)
    ) {
      setSelectedFrom(undefined)
      return
    }
    setSelectedFrom(undefined)
    const boards = swapTile(selectedFrom, position, board)
    setAnimating(true)
    const newBoardsHistory = [...boardsHistory, ...boards]
    setBoardsHistory(newBoardsHistory)
    for (const [index, newBoard] of boards.entries()) {
      setBoard(newBoard.board)
      setPoints((currentPoints) => currentPoints + newBoard.points)
      if (index < boards.length - 1) {
        await new Promise((r) => setTimeout(r, animationDuration * 1000 + 100))
      }
    }

    setCurrentRevision(newBoardsHistory.length - 1)
    setAnimating(false)
  }
  useEffect(() => {
    saveGameStateToCookie(board, points)
  }, [board, points])

  function undo() {
    setCurrentRevision(currentRevision - 1)
    setBoard(boardsHistory[currentRevision - 1].board)
  }
  function redo() {
    setCurrentRevision(currentRevision + 1)
    setBoard(boardsHistory[currentRevision + 1].board)
  }

  function getExitTo({ x, y }: Position): Position | undefined {
    const tile = board[x][y]
    if (!grid.current) {
      return
    }
    const gridGap = parseInt(
      getComputedStyle(grid.current).gap.replace("px", ""),
    )
    const tileWidth = parseInt(
      getComputedStyle(grid.current.children[0]).width.replace("px", ""),
    )
    const size = gridGap + tileWidth
    if (!tile.removed) {
      return undefined
    }
    return {
      x: (x - tile.mergedTo.x) * -size,
      y: (y - tile.mergedTo.y) * -size,
    }
  }
  const grid = useRef<HTMLDivElement>(null)

  const [hintPositions, setHintPositions] = useState<
    [Position, Position] | undefined
  >(undefined)
  function getHint(): void {
    setHintPositions(getPositionsThatAlmostMatch(board))
  }

  function getAnimation(position: Position): TargetAndTransition {
    const { x, y } = position
    if (hintPositions?.find((p) => p.x == x && p.y == y)) {
      return { scale: [1.4, 1.5, 1.4, 1], y: 0 }
    }
    const exitTo = getExitTo(position)
    if (exitTo) {
      return exitTo
    }
    return { y: 0 }
  }

  return (
    <div className="flex flex-col">
      <main
        className="grid w-screen p-1 sm:p-4 sm:w-full grid-cols-8 grid-rows-8 items-center gap-0.5 sm:gap-2 md:gap-3"
        ref={grid}
      >
        <AnimatePresence mode="popLayout">
          {board.map((row, y) =>
            row.map((_, x) => (
              <motion.button
                disabled={animating}
                layout
                transition={transition}
                onContextMenu={(event) => {
                  event.preventDefault()
                  const newValue = parseInt(prompt("Enter new value") ?? "0")
                  const newBoard = copyBoard(board)
                  newBoard[x][y].value = newValue
                  setBoard(newBoard)
                }}
                initial={{ y: -80 }}
                animate={getExitTo({ x, y }) ?? { y: 0 }}
                className={`w-full sm:size-12 md:size-14 aspect-square ${
                  getExitTo({ x, y }) ? "z-0" : "z-10"
                }`}
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
      Points: {points}
      <button onClick={getHint}>Get hint</button>
      {!animating && isGameOver(board) ? "Game over!" : ""}
      {debug ? (
        <>
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
        </>
      ) : (
        ""
      )}
    </div>
  )
}
