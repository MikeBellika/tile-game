"use client"
import {
  Board,
  BoardPoints,
  Position,
  copyBoard,
  generateBoard,
  useBoard,
} from "@/hooks/useBoard"
import {
  motion,
  AnimatePresence,
  Transition,
  useAnimate,
  AnimationSequence,
  PanInfo,
} from "framer-motion"
import { CapacitorGameConnect } from "@openforge/capacitor-game-connect"
import { Capacitor } from "@capacitor/core"
import { useEffect, useRef, useState } from "react"
import Tile from "./Tile"
import Tutorial from "./Tutorial"
import Settings from "./Settings"
import { AnimationSpeeds, useSettings } from "@/hooks/useSettings"
import {
  getGameState,
  getHighscore,
  saveGameState,
  setHighscore,
} from "@/utils/storedState"
import { boardContains2048Tile } from "@/utils/achievements"
import Button from "./Button"
import ShareButton from "./ShareButton"

export default function Game() {
  const {
    board: initialBoard,
    isAdjacent,
    swapTile,
    getPositionsThatAlmostMatch,
    isGameOver,
  } = useBoard(8)
  const [board, setBoard] = useState<Board>(initialBoard)
  const [points, setPoints] = useState(0)
  const [moves, setMoves] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initSavedState() {
      const gameState = await getGameState()
      if (!gameState || gameState.points == 0) {
        setLoading(false)
        return
      }
      setBoard(gameState.board)
      setPoints(gameState.points)
      setMoves(gameState.moves)
      setLoading(false)
    }
    initSavedState()
  }, [])
  const [animating, setAnimating] = useState(false)
  const [selectedFrom, setSelectedFrom] = useState<Position | undefined>(
    undefined,
  )
  const [boardsHistory, setBoardsHistory] = useState<BoardPoints[]>([
    { board, points: 0 },
  ])

  const [debug, _] = useState(false)

  const [gameOverClosed, closeGameOver] = useState(false)

  const [player, setPlayer] = useState<
    { player_name: string; player_id: string } | undefined
  >()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return
    }
    async function getPlayer() {
      const player = await CapacitorGameConnect.signIn()
      setPlayer(player)
    }
    getPlayer()
  }, [])

  const [highscore, initialiseHighscore] = useState<number>(0)
  useEffect(() => {
    async function initHighScore() {
      initialiseHighscore(await getHighscore())
    }
    initHighScore()
  }, [])

  const { animationSpeed, setAnimationSpeed, gamePosition, setGamePosition } =
    useSettings()
  const animationDuration = AnimationSpeeds[animationSpeed]

  const transition: Transition = { type: "spring", duration: animationDuration }

  async function onPanEnd(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    { x, y }: Position,
  ) {
    if (animating) {
      return
    }
    const offsetX = Math.abs(info.offset.x)
    const offsetY = Math.abs(info.offset.y)
    let swipeToPosition: undefined | Position = undefined
    if (offsetX > offsetY) {
      swipeToPosition = info.offset.x > 0 ? { x: x + 1, y } : { x: x - 1, y }
    } else {
      swipeToPosition = info.offset.y > 0 ? { y: y + 1, x } : { y: y - 1, x }
    }
    setSelectedFrom(undefined)
    await swapTiles({ x, y }, swipeToPosition)
  }

  async function swapTiles(a: Position, b: Position) {
    const boards = swapTile(a, b, board)
    setMoves((moves) => moves + 1)
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
    if (player && boardContains2048Tile(board)) {
      await CapacitorGameConnect.unlockAchievement({
        achievementID: "get2048Tile",
      })
    }

    setAnimating(false)
  }

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
    swapTiles(selectedFrom, position)
    setSelectedFrom(undefined)
  }

  useEffect(() => {
    saveGameState(board, points, moves)
    async function checkHighscore() {
      if (isGameOver(board) && !animating) {
        if (player && animationSpeed == "instant") {
          await CapacitorGameConnect.unlockAchievement({
            achievementID: "speedDemon",
          })
        }
        const highscore = await getHighscore()
        if (highscore < points) {
          setHighscore(points)
          initialiseHighscore(points)
        }
      }
    }
    checkHighscore()
  }, [board, points])

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
    const newBoard = generateBoard(8)
    saveGameState(newBoard, 0, 0)
    setPoints(0)
    setBoard(newBoard)
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
  const myDiv = useRef<HTMLDivElement>(null)
  if (loading) {
    return <div />
  }

  return (
    <div
      className={`flex pb-8 ${gamePosition == "top" ? "flex-col" : "flex-col-reverse "} items-center`}
      ref={myDiv}
    >
      <Tutorial />
      <motion.div
        layout
        className={`flex flex-1 transition ${gamePosition == "top" ? "flex-col justify-start" : "flex-col-reverse gap-8"}`}
      >
        <main
          className="relative grid w-screen grid-cols-8 grid-rows-8 items-center gap-0.5 p-1 sm:w-full sm:gap-2 sm:p-4"
          ref={grid}
        >
          <AnimatePresence>
            {isGameOver(board) && !animating && !gameOverClosed && (
              <motion.div
                className="absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <div className="flex flex-col rounded bg-white/80 px-6 pb-6 pt-2 dark:bg-black/80">
                  <button
                    className="self-end"
                    onClick={() => closeGameOver(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6 "
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <motion.h1 className="mb-6 text-5xl font-bold text-blue-100 [text-shadow:_3px_3px_0_#0a9396,_6px_6px_0_#ee9b00,_9px_9px_0_#005f73]">
                    Game Over
                  </motion.h1>
                  <ShareButton board={board} points={points} moves={moves} />
                  <Button
                    onClick={() => {
                      resetBoard()
                    }}
                    className="mt-2 flex justify-center gap-3"
                  >
                    New game
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="popLayout">
            {board.map((row, y) =>
              row.map((_, x) => (
                <motion.button
                  onPanEnd={(event, info) => onPanEnd(event, info, { x, y })}
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
                  className={`aspect-square w-full sm:size-12 md:size-14 ${
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
          <div className="flex flex-row justify-between ">
            <div className="flex flex-col items-center">
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
            <div className="flex flex-col items-center">
              <span className="text-lg">Highscore</span>
              <motion.span
                className="text-5xl font-medium"
                key={highscore > points ? highscore : points}
                animate={{
                  opacity: 1,
                  scale: [0.7, 1],
                }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {highscore > points
                  ? highscore.toLocaleString()
                  : points.toLocaleString()}
              </motion.span>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <button
              onClick={getHint}
              className="w-fit rounded-xl bg-gradient-to-bl from-indigo-500 to-indigo-600 px-6 py-2 text-lg font-medium text-white"
            >
              Get hint
            </button>
            <button
              onClick={() => {
                if (isGameOver(board) || confirm("Are you sure?")) {
                  resetBoard()
                }
              }}
              className="w-fit rounded-xl bg-gradient-to-bl from-rose-500 to-rose-600 px-6 py-2 text-lg font-medium text-white"
            >
              Reset
            </button>
          </div>
        </div>
      </motion.div>
      <div className="flex w-full items-center justify-end gap-6 px-4">
        {player && (
          <>
            <button
              onClick={async () => {
                await CapacitorGameConnect.showLeaderboard({
                  leaderboardID: "exponentile",
                })
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
                />
              </svg>
            </button>
            <button
              onClick={async () => {
                await CapacitorGameConnect.showAchievements()
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
                <path d="M11 12 5.12 2.2" />
                <path d="m13 12 5.88-9.8" />
                <path d="M8 7h8" />
                <circle cx="12" cy="17" r="5" />
                <path d="M12 18v-2h-.5" />
              </svg>
            </button>
          </>
        )}
        <Settings
          setAnimationSpeed={setAnimationSpeed}
          animationSpeed={animationSpeed}
          gamePosition={gamePosition}
          setGamePosition={setGamePosition}
        />
      </div>
    </div>
  )
}
