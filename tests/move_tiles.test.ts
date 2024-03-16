import { expect, test, vi } from "vitest"
// import { type Board, type Tile, moveTilesDown, copyBoard } from "@/hooks/useBoard"
import * as useBoard from "../hooks/useBoard"

const testBoard: useBoard.Board = Array.from({ length: 3 }).map((_, x) => {
  return Array.from({ length: 3 }).map((_, y) => {
    return { id: 3 * y + x, value: y }
  })
})
test("move tile horizontals moves one", () => {
  const mock = vi
    .spyOn(useBoard, "getRandomTile")
    .mockReturnValue({ id: 100, value: 100 })
  const result = useBoard.moveTilesDown(
    [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    testBoard,
  )
  let expected = useBoard.copyBoard(testBoard)
  // expected[1][1] = testBoard[1][0]
  // expected[2][1] = testBoard[2][0]

  // expected[1][0] = { id: 100, value: 100 }
  // expected[2][0] = { id: 100, value: 100 }
  expected[0][0] = { id: 100, value: 100 }

  expect(result).toEqual(expected)

  mock.mockRestore()
})
