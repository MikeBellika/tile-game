"use client"
const GridComponent = () => {
  const data = [
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
  ] as const
  // Function to handle the click event, taking x and y coordinates as arguments
  const handleClick = (x: number, y: number) => {
    console.log(
      `Clicked on cell at x: ${x}, y: ${y} with a value of ${data[x][y]}`,
    )
  }

  return (
    <div className="grid grid-cols-8 gap-1">
      {data.map((row, rowIndex) =>
        row.map((cell, cellIndex) => (
          <div
            key={`${rowIndex}-${cellIndex}`}
            className="border border-gray-400 p-2 flex justify-center items-center cursor-pointer"
            onClick={() => handleClick(rowIndex, cellIndex)} // Pass cellIndex as x and rowIndex as y
          >
            {cell}
          </div>
        )),
      )}
    </div>
  )
}

export default GridComponent
