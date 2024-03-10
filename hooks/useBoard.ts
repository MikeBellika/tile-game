export type Tile = { id: number; value: number };
export type Board = Tile[][];
export type Position = { x: number; y: number };

function getRandomTileId(): number {
  return Math.random();
}

function generateBoard(size: number): Board {
  return Array.from({ length: size }).map((_) =>
    Array.from({ length: size }).map((__) => {
      return {
        id: getRandomTileId(),
        value: Math.floor(Math.random() * 4) + 1,
      };
    }),
  );
}

function copyBoard(board: Board): Board {
  return board.slice().map((column) => column.slice());
}

function isMoveValid(
  from: Position,
  to: Position,
  before: Board,
  after: Board,
): boolean {
  const fromBefore = getTileValue(from, before);
  const fromAfter = getTileValue(from, after);
  const toBefore = getTileValue(to, before);
  const toAfter = getTileValue(to, after);
  // If either tile value changed between moves, it's a valid move
  return fromBefore != fromAfter || toBefore != toAfter;
}

function getAmountOfSameTilesUp(position: Position, board: Board): number {
  let result = 0;
  const tile = board[position.x][position.y];
  for (let y = position.y; y > 0; y--) {
    if (board[position.x][y].value != tile.value) {
      break;
    }
    result++;
  }
  return result >= 2 ? result : 0;
}
function getAmountOfSameTilesDown(position: Position, board: Board): number {
  let result = 0;
  const tile = board[position.x][position.y];
  for (let y = position.y; y < board[position.x].length; y++) {
    if (board[position.x][y].value != tile.value) {
      break;
    }
    result++;
  }
  return result >= 2 ? result : 0;
}
function getAmountOfSameTilesLeft(position: Position, board: Board): number {
  let result = 0;
  const tile = board[position.x][position.y];
  for (let x = position.x; x > 0; x--) {
    if (board[x][position.y].value != tile.value) {
      break;
    }
    result++;
  }
  return result >= 2 ? result : 0;
}
function getAmountOfSameTilesRight(position: Position, board: Board): number {
  let result = 0;
  const tile = board[position.x][position.y];
  for (let x = position.x; x < board.length; x++) {
    if (board[x][position.y].value != tile.value) {
      break;
    }
    result++;
  }
  return result >= 2 ? result : 0;
}

function getTileValue(position: Position, board: Board): number {
  const tile = board[position.x][position.y];

  const pointsUp = getAmountOfSameTilesUp(position, board);
  const pointsDown = getAmountOfSameTilesDown(position, board);
  const pointsLeft = getAmountOfSameTilesLeft(position, board);
  const pointsRight = getAmountOfSameTilesRight(position, board);
  const points = pointsUp + pointsDown + pointsLeft + pointsRight;
  if (points == 0) {
    return tile.value;
  }
  return tile.value * Math.pow(2, points - 1);
}

/**
 * The main thing. Returns a list of boards to be animated through
 */
function swapTile(from: Position, to: Position, board: Board): Board[] {
  const newBoard = copyBoard(board);
  newBoard[to.x][to.y] = board[from.x][from.y];
  newBoard[from.x][from.y] = board[to.x][to.y];
  if (true || !isMoveValid(from, to, board, newBoard)) {
    console.log("move not valid");
    // Animate to the swapped board, then back again
    return [newBoard, board];
  }
  const fromNewValue = getTileValue(from, board);
  const toNewValue = getTileValue(to, board);
  newBoard[from.x][from.y] = {
    ...newBoard[from.x][from.y],
    value: fromNewValue,
  };
  newBoard[to.x][to.y] = { ...newBoard[to.x][to.y], value: toNewValue };
  // TODO: Do this in a loop
  return [board, newBoard];
}

function getTileColor(tile: Tile) {
  if (tile.value > 11) {
    return "#000000";
  }
  return `hsl(${tile.value * 36} 100% 50%)`;
}

export function useBoard(size: number) {
  const board: Board = generateBoard(size);

  return { board, swapTile, getTileColor };
}
