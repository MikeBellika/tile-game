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

// Helper function to convert SVG string to Blob
function svgStringToBlob(svgString: string): Blob {
  return new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
}

// Function to generate SVG string from Board data
export function generateSvgString(
  board: Board,
  tileSize: number,
  padding: number,
): string {
  const width = board.length * (tileSize + padding) - padding
  const height = board.length * (tileSize + padding) - padding
  const interDataUrl: string = `data:font/woff2;base64,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`
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <defs>
            <style type="text/css">
                @font-face {
                    font-family: 'InterSvg';
                    font-weight: bold; 
                    src: url(${interDataUrl}) format('woff2');
                }
            </style>
        </defs>`

  board.forEach((row, y) => {
    row.forEach((tile, x) => {
      const x1 = x * (tileSize + padding)
      const y1 = y * (tileSize + padding)
      const tileColor = getTileColor(tile)
      svgContent += `<g>
                <rect x="${x1}" y="${y1}" width="${tileSize}" height="${tileSize}" style="fill: ${tileColor}; ${tile.value > 9 ? "filter: drop-shadow(0px 0px 5px #ed8936) drop-shadow(2px 2px 3px gold)" : ""} " rx="3" />
                <text x="${x1 + tileSize / 2}" y="${y1 + tileSize / 2}" style="fill: ${getContrastTextColor(tileColor)}; text-anchor: middle; font-family: 'InterSvg'; font-weight: bold; dominant-baseline: middle;">
                    ${Math.pow(2, tile.value)}
                </text>
            </g>`
    })
  })

  svgContent += `</svg>`
  return svgContent
}

// Main function to convert Board to PNG File
export async function boardToPngFile(board: Board): Promise<File> {
  const tileSize: number = 44
  const padding: number = 2

  const svgString = generateSvgString(board, tileSize, padding)

  // Wait for font to load. Calling the font InterSvg because the regular font is called Inter, so that is already loaded
  // If this isn't done, the font doens't load on first share (Works when the button is clicked again)
  console.log("loading")
  await document.fonts.load("bold 16px InterSvg")
  console.log("loaded")

  await new Promise((r) => setTimeout(r, 100))

  const blob = svgStringToBlob(svgString)
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = function () {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "ExponenTile.png", {
              type: "image/png",
            })
            resolve(file)
          } else {
            reject(new Error("Canvas to Blob conversion failed"))
          }
        }, "image/png")
      } else {
        reject(new Error("Could not get canvas context"))
      }
    }
    img.onerror = reject
    img.src = url
  })
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

        // Determine text color based on tile color and draw text
        const textColor = getContrastTextColor(tileColor)
        ctx.fillStyle = textColor
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        // next/font outputs unpredictable font names. We could get it with inter.style.fontFamily but then we'd have to drill that down through the entire app from layout
        ctx.font = `bold 22px ${fontName}` // Customize the font as necessary
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
