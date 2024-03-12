import { useMemo } from "react"

export type Tile = { id: number; value: number }
export type Board = Tile[][]
export type Position = { x: number; y: number }

function getRandomTileId(): number {
  return Math.random()
}

function getRandomTileValue(): number {
  return Math.floor(Math.random() * 4) + 1
}

function getRandomTile(): Tile {
  return {
    id: getRandomTileId(),
    value: getRandomTileValue(),
  }
}

function generateBoard(size: number): Board {
  const iniialBoard = Array.from({ length: size }).map((_) =>
    Array.from({ length: size }).map((__) => {
      return getRandomTile()
    }),
  )
  let changedValue = true
  while (changedValue) {
    changedValue = false
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const tileValue = getTileValue({ x, y }, iniialBoard).value
        if (tileValue != iniialBoard[x][y].value) {
          iniialBoard[x][y] = {
            ...iniialBoard[x][y],
            value: getRandomTileValue(),
          }
          changedValue = true
        }
      }
    }
  }
  return iniialBoard
}

function copyBoard(board: Board): Board {
  return board.slice().map((column) => column.slice())
}

function isMoveValid(
  from: Position,
  to: Position,
  before: Board,
  after: Board,
): boolean {
  const fromBefore = getTileValue(from, before).value
  const fromAfter = getTileValue(to, after).value
  const toBefore = getTileValue(to, before).value
  const toAfter = getTileValue(from, after).value
  // If either tile value changed between moves, it's a valid move
  return fromBefore != fromAfter || toBefore != toAfter
}

function getSameTilesUp(position: Position, board: Board): Array<Position> {
  let result: Array<Position> = []
  const tile = board[position.x][position.y]
  for (let y = position.y - 1; y >= 0; y--) {
    if (board[position.x][y].value != tile.value) {
      break
    }
    result = [...result, { x: position.x, y }]
  }
  return result
}
function getSameTilesDown(position: Position, board: Board): Array<Position> {
  let result: Array<Position> = []
  const tile = board[position.x][position.y]
  for (let y = position.y + 1; y < board[position.x].length; y++) {
    if (board[position.x][y].value != tile.value) {
      break
    }
    result = [...result, { x: position.x, y }]
  }
  return result
}

function getSameTilesLeft(position: Position, board: Board): Array<Position> {
  let result: Array<Position> = []
  const tile = board[position.x][position.y]
  for (let x = position.x - 1; x >= 0; x--) {
    // Adjust boundary check to >= 0
    if (board[x][position.y].value != tile.value) {
      break
    }
    result = [...result, { x, y: position.y }]
  }
  return result
}

function getSameTilesRight(position: Position, board: Board): Array<Position> {
  let result: Array<Position> = []
  const tile = board[position.x][position.y]
  for (let x = position.x + 1; x < board.length; x++) {
    if (board[x][position.y].value != tile.value) {
      break
    }
    result = [...result, { x, y: position.y }]
  }
  return result
}

function getTileValue(
  position: Position,
  board: Board,
): { value: number; matchedTiles: Array<Position> } {
  const tile = board[position.x][position.y]

  const tilesUp = getSameTilesUp(position, board)
  const tilesDown = getSameTilesDown(position, board)
  const tilesLeft = getSameTilesLeft(position, board)
  const tilesRight = getSameTilesRight(position, board)

  const tilesVertical = tilesUp.length + tilesDown.length
  const tilesHorizontal = tilesLeft.length + tilesRight.length
  let matchedTiles: Position[] = []

  // Match only counts if there are at least 3 in a row
  // If there's a match with 2 vertical and 1 horizontal, only the vertical should count
  if (tilesVertical >= 2) {
    matchedTiles = [...matchedTiles, ...tilesUp, ...tilesDown]
  }
  if (tilesHorizontal >= 2) {
    matchedTiles = [...matchedTiles, ...tilesRight, ...tilesLeft]
  }
  const points = matchedTiles.length
  if (points == 0) {
    return { value: tile.value, matchedTiles }
  }
  return {
    value: tile.value + points - 1,
    matchedTiles: [...tilesUp, ...tilesDown, ...tilesRight, ...tilesLeft],
  }
}

/**
 * The main thing. Returns a list of boards to be animated through
 */
function swapTile(from: Position, to: Position, board: Board): Board[] {
  const swappedBoard = copyBoard(board)
  swappedBoard[to.x][to.y] = board[from.x][from.y]
  swappedBoard[from.x][from.y] = board[to.x][to.y]
  if (!isMoveValid(from, to, board, swappedBoard)) {
    console.log("move not valid")
    // Animate to the swapped board, then back again
    return [swappedBoard, board]
  }
  const newBoard = copyBoard(swappedBoard)
  const fromNewValue = getTileValue(from, newBoard)
  const toNewValue = getTileValue(to, newBoard)
  newBoard[from.x][from.y] = {
    ...newBoard[from.x][from.y],
    value: fromNewValue.value,
  }
  newBoard[to.x][to.y] = { ...newBoard[to.x][to.y], value: toNewValue.value }

  const matchedTiles = [
    ...fromNewValue.matchedTiles,
    ...toNewValue.matchedTiles,
  ]
  const newBoardsFromMatchedTiles = boardFromMatchedTiles(
    matchedTiles,
    newBoard,
  )
  return [swappedBoard, ...newBoardsFromMatchedTiles]
}

function boardFromMatchedTiles(
  matchedTiles: Position[],
  board: Board,
): Board[] {
  let result = [board]

  let positions: Position[] = [...positionsWithMatches(board), ...matchedTiles]
  positions.sort((a, b) => {
    const valueA = board[a.x][a.y].value
    const valueB = board[b.x][b.y].value
    return valueA - valueB
  })

  while (positions.length > 0) {
    const copiedBoard = copyBoard(board)
    const donePositions: Set<Position> = new Set()
    for (const position of positions) {
      if (donePositions.has(position)) {
        continue
      }
      donePositions.add(position)
      const tileValue = getTileValue(position, copiedBoard)
      copiedBoard[position.x][position.y] =
        tileValue.matchedTiles.length > 0
          ? { ...copiedBoard[position.x][position.y], value: tileValue.value }
          : getRandomTile()
    }
    result = [...result, copiedBoard]
    positions = positionsWithMatches(copiedBoard)
  }
  return result
}

function positionsWithMatches(board: Board): Position[] {
  return board
    .map((row, x) => {
      return row.map((_, y) => {
        return getTileValue({ x, y }, board).matchedTiles.length > 0
          ? { x, y }
          : undefined
      })
    })
    .flat()
    .filter((x) => x != undefined) as Position[]
}

function getTileColor(tile: Tile) {
  if (tile.value > 11) {
    return "#000000"
  }
  return `hsl(${tile.value * 36} 100% 50%)`
}

export function useBoard(size: number) {
  // Memoize board to prevent regeneration on every rerender,
  // regenerate only if `size` changes
  const board: Board = useMemo(() => generateBoard(size), [size])

  return { board, swapTile, getTileColor, getTileValue }
}
