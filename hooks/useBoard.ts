import { useMemo } from "react"

export type Tile = { id: number; value: number; removed: boolean }
export type Board = Tile[][]
export type Position = { x: number; y: number }
type PositionToBeRemoved = number
type PositionToMergeTo = Position
export type RemovedTiles = Map<PositionToBeRemoved, PositionToMergeTo>
export type BoardChange = [Board, RemovedTiles]

function getRandomTileId(): number {
  return Math.random()
}

function getRandomTileValue(): number {
  return Math.floor(Math.random() * 4) + 1
}

export function getRandomTile(): Tile {
  return {
    id: getRandomTileId(),
    value: getRandomTileValue(),
    removed: false,
  }
}

/**
 * Turns a position into a unique number. Needs the board to get the length.
 */
export function positionToNumber({ x, y }: Position, board: Board): number {
  return y * board.length + x
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

export function copyBoard(board: Board): Board {
  return board.slice().map((column) => column.slice())
}

function isAdjacent(a: Position, b: Position): boolean {
  return (
    (a.x == b.x && Math.abs(a.y - b.y) == 1) ||
    (a.y == b.y && Math.abs(a.x - b.x) == 1)
  )
}

function isMoveValid(
  from: Position,
  to: Position,
  before: Board,
  after: Board,
): boolean {
  if (!isAdjacent(from, to)) {
    return false
  }
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
): { value: number; matchedTiles: Position[]; origin: Position } {
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
    return { value: tile.value, matchedTiles, origin: position }
  }
  return {
    value: tile.value + points - 1,
    matchedTiles: [...tilesUp, ...tilesDown, ...tilesRight, ...tilesLeft],
    origin: position,
  }
}

function addPositionsToMap(
  postionToMergeTo: PositionToMergeTo,
  positionsToRemove: PositionToBeRemoved[],
  map: Map<PositionToBeRemoved, PositionToMergeTo>,
): void {
  positionsToRemove.forEach((p) => {
    map.set(p, postionToMergeTo)
  })
}

/**
 * The main thing. Returns a list of boards to be animated through
 */
function swapTile(from: Position, to: Position, board: Board): BoardChange[] {
  const swappedBoard = copyBoard(board)
  swappedBoard[to.x][to.y] = board[from.x][from.y]
  swappedBoard[from.x][from.y] = board[to.x][to.y]
  if (!isMoveValid(from, to, board, swappedBoard)) {
    console.log("move not valid")
    // Animate to the swapped board, then back again
    return [
      [swappedBoard, new Map()],
      [board, new Map()],
    ]
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
  const matchedTilesMap = new Map()
  addPositionsToMap(
    from,
    fromNewValue.matchedTiles.map((p) => positionToNumber(p, board)),
    matchedTilesMap,
  )
  addPositionsToMap(
    to,
    toNewValue.matchedTiles.map((p) => positionToNumber(p, board)),
    matchedTilesMap,
  )

  const boardAfterGravity = moveTilesDown(matchedTiles, newBoard)
  const boardAfterCombos = findAndDoCombos(boardAfterGravity)

  return [
    [swappedBoard, new Map()],
    [newBoard, matchedTilesMap],
    [boardAfterGravity, new Map()],
    ...boardAfterCombos,
  ]
}

export function moveTilesDown(positions: Position[], board: Board): Board {
  const newBoard = copyBoard(board)

  for (let x = 0; x < board.length; x++) {
    let emptyTilesBelow = 0
    for (let y = board[x].length - 1; y >= 0; y--) {
      if (positions.find((p) => p.x == x && p.y == y)) {
        emptyTilesBelow += 1
        continue
      }
      newBoard[x][y + emptyTilesBelow] = board[x][y]
    }
    for (let y = 0; y < emptyTilesBelow; y++) {
      newBoard[x][y] = getRandomTile()
    }
  }

  return newBoard
}

function findAndDoCombos(board: Board): BoardChange[] {
  let result: BoardChange[] = []
  let matches = uniqueNewMatches(board)
  let i = 0
  let previousBoard = copyBoard(board)
  while (matches.length > 0) {
    const matchTileValues = matches.map((match) =>
      getTileValue(match, previousBoard),
    )
    const tilesToRemove = matchTileValues.map((mtv) => mtv.matchedTiles).flat()
    const newBoard = copyBoard(previousBoard)
    for (const { x, y } of matches) {
      newBoard[x][y] = {
        ...newBoard[x][y],
        value: getTileValue({ x, y }, previousBoard).value,
      }
    }
    const resultAfterGravity = moveTilesDown(tilesToRemove, newBoard)
    const newBoardMap = new Map()
    matchTileValues.forEach((mtv) =>
      addPositionsToMap(
        mtv.origin,
        mtv.matchedTiles.map((p) => positionToNumber(p, board)),
        newBoardMap,
      ),
    )
    result = [
      ...result,
      [newBoard, newBoardMap],
      [resultAfterGravity, new Map()],
    ]
    matches = uniqueNewMatches(resultAfterGravity)
    previousBoard = resultAfterGravity
    i++
    if (i > 100) {
      console.error("Infinite loop")
      break
    }
  }

  return result
}

/**
 * Returns a list of positions that are the highest value matches.
 * For example if there's a tile that matches 5 vertically and 2 horizontally, it will return that tile but not any of the other tiles of the match.
 */
export function uniqueNewMatches(board: Board): Position[] {
  const matchPositions = positionsWithMatches(board)
  const matchValues = matchPositions
    .map((position) => {
      return { position, ...getTileValue(position, board) }
    })
    .sort((a, b) => {
      return b.value - a.value
    })
  let seenPositions: Position[] = []
  let result: Position[] = []
  for (const matchValue of matchValues) {
    if (
      seenPositions.find(
        ({ x, y }) => x == matchValue.position.x && y == matchValue.position.y,
      )
    ) {
      continue
    }
    seenPositions = [...seenPositions, ...matchValue.matchedTiles]
    result = [...result, matchValue.position]
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
