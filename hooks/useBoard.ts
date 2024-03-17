import { useMemo } from "react"

export type Tile =
  | { id: number; value: number; removed: false }
  | { id: number; value: number; removed: true; mergedTo: Position }
export type Board = Tile[][]
export type Position = { x: number; y: number }

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
  const initialBoard = Array.from({ length: size }).map((_) =>
    Array.from({ length: size }).map((__) => {
      return getRandomTile()
    }),
  )
  let matchesOnBoard = getMatchesOnBoard(initialBoard)
  while (matchesOnBoard.length > 0) {
    for (const match of matchesOnBoard) {
      const { x, y } = match.origin
      initialBoard[x][y] = {
        ...initialBoard[x][y],
        value: getRandomTileValue(),
      }
    }
    matchesOnBoard = getMatchesOnBoard(initialBoard)
  }
  return initialBoard
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

function isMoveValid(from: Position, to: Position, after: Board): boolean {
  if (!isAdjacent(from, to)) {
    return false
  }
  return getMatchedTile(from, after).match || getMatchedTile(to, after).match
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

type MatchedTile = {
  newValue: number
  matchedTiles: Position[]
  origin: Position
  match: true
}
function getMatchedTile(
  position: Position,
  board: Board,
): MatchedTile | { match: false } {
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
    return {
      match: false,
    }
  }
  return {
    newValue: tile.value + points - 1,
    matchedTiles: matchedTiles,
    origin: position,
    match: true,
  }
}

export type BoardPoints = { board: Board; points: number }

/**
 * The main thing. Returns a list of boards to be animated through
 */
function swapTile(from: Position, to: Position, board: Board): BoardPoints[] {
  const swappedBoard = copyBoard(board)
  swappedBoard[to.x][to.y] = board[from.x][from.y]
  swappedBoard[from.x][from.y] = board[to.x][to.y]
  if (!isMoveValid(from, to, swappedBoard)) {
    // Animate to the swapped board, then back again
    return [
      { board: swappedBoard, points: 0 },
      { board, points: 0 },
    ]
  }
  const newBoard = copyBoard(swappedBoard)
  const fromMatchedTile = getMatchedTile(from, newBoard)
  const toMatchedTile = getMatchedTile(to, newBoard)
  const matchedTiles = []

  if (fromMatchedTile.match) {
    newBoard[from.x][from.y] = {
      ...newBoard[from.x][from.y],
      value: fromMatchedTile.newValue,
    }
    matchedTiles.push(fromMatchedTile)
  }
  if (toMatchedTile.match) {
    newBoard[to.x][to.y] = {
      ...newBoard[to.x][to.y],
      value: toMatchedTile.newValue,
    }
    matchedTiles.push(toMatchedTile)
  }

  const boardAfterGravity = moveTilesDown(matchedTiles, newBoard)
  const boardAfterCombos = findAndDoCombos(boardAfterGravity[1])

  return [
    { board: swappedBoard, points: 0 },
    {
      board: newBoard,
      points: matchedTiles.reduce(
        (acc, matchedTile) => Math.pow(2, matchedTile.newValue) + acc,
        0,
      ),
    },
    ...boardAfterGravity.map((b) => {
      return { board: b, points: 0 }
    }),
    ...boardAfterCombos,
  ]
}

export function moveTilesDown(
  matchedTiles: MatchedTile[],
  board: Board,
): [Board, Board] {
  const boardWithRemovedTiles = copyBoard(board)
  for (const positionPairToRemove of matchedTiles) {
    for (const { x, y } of positionPairToRemove.matchedTiles) {
      boardWithRemovedTiles[x][y] = {
        ...boardWithRemovedTiles[x][y],
        removed: true,
        mergedTo: positionPairToRemove.origin,
      }
    }
  }
  const newBoard = copyBoard(board)

  for (let x = 0; x < board.length; x++) {
    let emptyTilesBelow = 0
    for (let y = board[x].length - 1; y >= 0; y--) {
      if (
        matchedTiles
          .map((p) => p.matchedTiles)
          .flat()
          .find((p) => p.x == x && p.y == y)
      ) {
        emptyTilesBelow += 1
        continue
      }
      newBoard[x][y + emptyTilesBelow] = board[x][y]
    }
    // Fill in from top
    for (let y = 0; y < emptyTilesBelow; y++) {
      newBoard[x][y] = getRandomTile()
    }
  }

  return [boardWithRemovedTiles, newBoard]
}

function findAndDoCombos(board: Board): BoardPoints[] {
  let result: BoardPoints[] = []
  let matches = uniqueNewMatches(board)

  let previousBoard = copyBoard(board)
  while (matches.length > 0) {
    const newBoard = copyBoard(previousBoard)
    for (const match of matches) {
      const { x, y } = match.origin
      newBoard[x][y] = {
        ...newBoard[x][y],
        value: match.newValue,
      }
    }
    const resultAfterGravity = moveTilesDown(matches, newBoard)
    result = [
      ...result,
      {
        board: newBoard,
        points: matches.reduce(
          (acc, match) => Math.pow(2, match.newValue) + acc,
          0,
        ),
      },
      ...resultAfterGravity.map((b) => {
        return { board: b, points: 0 }
      }),
    ]
    matches = uniqueNewMatches(resultAfterGravity[1])
    previousBoard = resultAfterGravity[1]
  }

  return result
}

/**
 * Returns a list of positions that are the highest value matches.
 * For example if there's a tile that matches 5 vertically and 2 horizontally, it will return that tile but not any of the other tiles of the match.
 */
export function uniqueNewMatches(board: Board): MatchedTile[] {
  const matchesOnBoard = getMatchesOnBoard(board)
  const matchValues = matchesOnBoard
    .map((match) => {
      return { position: match.origin, ...match }
    })
    .sort((a, b) => {
      return b.newValue - a.newValue
    })
  let seenPositions: Position[] = []
  let result: MatchedTile[] = []
  for (const matchValue of matchValues) {
    if (
      seenPositions.find(
        ({ x, y }) => x == matchValue.position.x && y == matchValue.position.y,
      )
    ) {
      continue
    }
    seenPositions = [...seenPositions, ...matchValue.matchedTiles]
    result = [...result, matchValue]
  }
  return result
}

function getMatchesOnBoard(board: Board): MatchedTile[] {
  return board
    .map((row, x) => {
      return row.map((_, y) => {
        const matchedTile = getMatchedTile({ x, y }, board)
        return matchedTile.match ? matchedTile : undefined
      })
    })
    .flat()
    .filter((x) => x != undefined) as MatchedTile[]
}
function isGameOver(board: Board): boolean {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      const position: Position = { x, y }

      const adjacentPositions: Position[] = [
        { x: x - 1, y }, // Left
        { x: x + 1, y }, // Right
        { x, y: y - 1 }, // Up
        { x, y: y + 1 }, // Down
      ]

      for (const adjPosition of adjacentPositions) {
        if (
          adjPosition.x < 0 ||
          adjPosition.x >= board.length ||
          adjPosition.y < 0 ||
          adjPosition.y >= board[x].length
        ) {
          continue
        }

        const tempBoard = copyBoard(board)
        const tempTile = tempBoard[x][y]
        tempBoard[x][y] = tempBoard[adjPosition.x][adjPosition.y]
        tempBoard[adjPosition.x][adjPosition.y] = tempTile

        if (
          getMatchedTile(position, tempBoard).match ||
          getMatchedTile(adjPosition, tempBoard).match
        ) {
          return false
        }
      }
    }
  }
  return true
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

  return {
    board,
    swapTile,
    getTileColor,
    isAdjacent,
    isGameOver,
    getTileValue: getMatchedTile,
  }
}
