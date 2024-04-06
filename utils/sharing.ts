import { Board, getRandomTile } from "@/hooks/useBoard"

export function encodeStateInURL(board: Board, points: number): string {
  const boardNumbers = board.flat().map((tile) => tile.value)
  const sharingString = numbersToUrlSafeString(boardNumbers)
  return `b=${sharingString}&p=${points}&s=${board.length}`
}

export function decodeStateFromURL(
  urlString: string,
): { board: Board; points: number } | undefined {
  const params = new URLSearchParams(urlString)
  const boardString = params.get("b")
  const pointsString = params.get("p")
  const sizeString = params.get("s")

  if (boardString === null || pointsString === null || sizeString === null) {
    return undefined
  }

  const points = parseInt(pointsString)
  const size = parseInt(sizeString)
  const boardNumbers = urlSafeStringToNumbers(boardString)

  if (isNaN(points) || isNaN(size) || boardNumbers.some(isNaN)) {
    return undefined
  }

  const board: Board = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      const index = y * size + x
      return {
        ...getRandomTile(),
        value: boardNumbers[index],
      }
    }),
  )

  return { board, points }
}

function numbersToUrlSafeString(numbers: number[]): string {
  // Assuming numbers are 1-16, decrement to make them 0-15 for bitwise operations
  const adjustedNumbers = numbers.map((n) => n - 1)
  let binaryString = ""

  // Pack numbers into a binary string
  adjustedNumbers.forEach((n) => {
    binaryString += n.toString(2).padStart(4, "0")
  })

  // Convert binary string to bytes
  const byteArray = new Uint8Array(binaryString.length / 8)
  for (let i = 0; i < byteArray.length; i++) {
    byteArray[i] = parseInt(binaryString.slice(i * 8, (i + 1) * 8), 2)
  }

  // Convert bytes to Base64 URL Safe String
  const base64String = Buffer.from(byteArray)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "") // Trim padding

  return base64String
}
function urlSafeStringToNumbers(encodedString: string): number[] {
  // Convert Base64 URL Safe string back to Base64
  const base64String =
    encodedString.replace(/-/g, "+").replace(/_/g, "/") +
    // Optionally add padding back if required by your decoding method
    "==".substring(0, (3 * encodedString.length) % 4)

  // Decode from Base64 to bytes
  const bytes = Buffer.from(base64String, "base64")

  // Convert bytes back to a binary string
  let binaryString = ""
  bytes.forEach((byte) => {
    binaryString += byte.toString(2).padStart(8, "0")
  })

  // Unpack binary string into numbers
  const numbers = []
  for (let i = 0; i < binaryString.length; i += 4) {
    // Parse each 4-bit segment into a number, adjust back to 1-16 range
    numbers.push(parseInt(binaryString.slice(i, i + 4), 2) + 1)
  }

  return numbers
}
