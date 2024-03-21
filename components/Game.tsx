"use client"
import {
  Board,
  BoardPoints,
  Position,
  copyBoard,
  generateBoard,
  getSavedGameState,
  saveGameStateToCookie,
  useBoard,
} from "@/hooks/useBoard"
import {
  motion,
  AnimatePresence,
  Transition,
  useAnimate,
  AnimationSequence,
} from "framer-motion"
import { useEffect, useState } from "react"
import Tile from "./Tile"

export default function Game() {
  const savedState = getSavedGameState()
  const {
    board: initialBoard,
    isAdjacent,
    swapTile,
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
  const [grid, animate] = useAnimate()

  function resetBoard(): void {
    if (confirm("Are you sure?")) {
      saveGameStateToCookie(generateBoard(8), 0)
      window.location.reload()
    }
  }

  function getHint(): void {
    const hintPositions = getPositionsThatAlmostMatch(board)
    if (!hintPositions) {
      return
    }
    const { x: x1, y: y1 } = hintPositions[0]
    const { x: x2, y: y2 } = hintPositions[1]
    const sequence1: AnimationSequence = [
      [
        `[data-pos="${x1}${y1}"]`,
        { scale: 1.2, x: (x2 - x1) * 10, y: (y2 - y1) * 10 },
      ],
      [`[data-pos="${x1}${y1}"]`, { scale: 1, x: 0, y: 0 }],
    ]
    const sequence2: AnimationSequence = [
      [
        `[data-pos="${x2}${y2}"]`,
        { scale: 0.8, x: (x2 - x1) * -10, y: (y2 - y1) * -10 },
      ],
      [`[data-pos="${x2}${y2}"]`, { scale: 1, x: 0, y: 0 }],
    ]

    animate(sequence1)
    animate(sequence2)
  }

  return (
    <div className="flex flex-col">
      <main
        className="grid w-screen p-1 sm:p-4 sm:w-full grid-cols-8 grid-rows-8 items-center gap-0.5 sm:gap-2"
        ref={grid}
      >
        <AnimatePresence>
          {isGameOver(board) && !animating && (
            <motion.div
              className="absolute top-0 left-0 w-full h-1/2 flex items-center justify-center z-20"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <div className="">
                <motion.h1 className="text-blue-100 text-5xl font-bold [text-shadow:_3px_3px_0_#0a9396,_6px_6px_0_#ee9b00,_9px_9px_0_#005f73]">
                  Game Over
                </motion.h1>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="popLayout">
          {board.map((row, y) =>
            row.map((_, x) => (
              <motion.button
                transition={transition}
                disabled={animating}
                layout
                data-pos={`${x}${y}`}
                onContextMenu={(event) => {
                  if (!debug) {
                    return
                  }
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
                />
              </motion.button>
            )),
          )}
        </AnimatePresence>
      </main>
      <div className="flex flex-col gap-6 p-2 sm:p-4">
        <div className="flex flex-col justify-center items-center ">
          <span className="text-lg">Score</span>
          <motion.span
            className="text-5xl font-medium"
            key={points}
            animate={{
              opacity: 1,
              scale: [0.7, 1],
            }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {points.toLocaleString()}
          </motion.span>
        </div>
        <div className="flex flex-row justify-between">
          <button
            onClick={getHint}
            className="bg-gradient-to-bl from-indigo-500 to-indigo-600 w-fit text-white rounded-xl text-lg font-medium px-6 py-2"
          >
            Get hint
          </button>
          <button
            onClick={resetBoard}
            className="bg-gradient-to-bl from-rose-500 to-rose-600 w-fit text-white rounded-xl text-lg font-medium px-6 py-2"
          >
            Reset
          </button>
        </div>
      </div>
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
