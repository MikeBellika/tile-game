import { Board } from "@/hooks/useBoard"

export function boardContains2048Tile(board: Board): boolean {
  return board.some((column) => column.some((tile) => tile.value == 11))
}
