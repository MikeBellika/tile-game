import {
  Board,
  getContrastTextColor,
  getRandomTile,
  getTileColor,
} from "@/hooks/useBoard"

export function encodeStateInURL(board: Board, points: number): string {
  const boardNumbers = board.flat().map((tile) => tile.value)
  const sharingString = numbersToUrlSafeString(boardNumbers)
  return `b=${sharingString}&p=${points}&s=${board.length}`
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

export function drawBoardToPNG(
  board: Board,
  moves: number,
  score: number,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const tileSize = 64
    const gap = 3
    const footerFontSize = 16
    const boardSize = board.length // Assuming 8x8 board, adjust according to your actual board size
    const footerSize = gap * boardSize + footerFontSize
    canvas.width = boardSize * (tileSize + gap) - gap // Adjust canvas size as necessary
    canvas.height = boardSize * (tileSize + gap) - gap + footerSize // Adjust canvas size as necessary
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    // next/font outputs unpredictable font names. We could get it with inter.style.fontFamily but then we'd have to drill that down through the entire app from layout
    const fontName = window.getComputedStyle(document.body, null).fontFamily
    // Drawing logic
    board.forEach((row, x) => {
      row.forEach((tile, y) => {
        const xPos = x * (tileSize + gap)
        const yPos = y * (tileSize + gap)
        const tileColor = getTileColor(tile)

        // Draw rounded rectangle tile
        const path = new Path2D()
        path.roundRect(xPos, yPos, tileSize, tileSize, 7)
        ctx.fillStyle = tileColor
        ctx.fill(path)

        const textColor = getContrastTextColor(tileColor)
        ctx.fillStyle = textColor
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = `bold 22px ${fontName}`
        ctx.fillText(
          Math.pow(2, tile.value).toString(),
          xPos + tileSize / 2,
          yPos + tileSize / 2,
        )
      })
    })
    ctx.font = `bold 64px ${fontName}`
    ctx.shadowColor = "black"
    ctx.shadowBlur = 2
    ctx.fillText(
      score.toLocaleString("en-US"),
      (canvas.height - footerSize) / 2,
      canvas.width / 2,
    )
    ctx.font = `bold ${footerFontSize}px ${fontName}`

    ctx.fillStyle = "white"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText(
      `Moves: ${moves.toLocaleString("en-US")}`,
      gap,
      (boardSize + 0) * (tileSize + gap) + 4 * gap,
    )

    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillText(
      `ExponenTile`,
      boardSize * (tileSize + gap) - gap,
      (boardSize + 0) * (tileSize + gap) + 4 * gap,
    )

    // Convert canvas to Blob, then to File
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "ExponenTile.png", { type: "image/png" })
        resolve(file)
      } else {
        reject(new Error("Canvas to Blob conversion failed"))
      }
    }, "image/png")
  })
}
