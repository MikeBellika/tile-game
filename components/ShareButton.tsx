import { drawBoardToPNG } from "@/utils/sharing"
import Button from "./Button"
import { Board } from "@/hooks/useBoard"
import { useToast } from "./ui/use-toast"

export default function ShareButton({
  board,
  moves,
  points,
}: {
  board: Board
  moves: number
  points: number
}) {
  // Sharing and clipboard only works on https and localhost. Sometimes sharing files doesn't work in either, so we share to clipboard instead
  const canShareFile =
    navigator.canShare && navigator.canShare({ text: "test" })
  const canShareClipboard = navigator.clipboard != undefined

  const { toast } = useToast()
  if (!canShareFile && !canShareClipboard) {
    return <></>
  }
  return (
    <Button
      onClick={async () => {
        const file = await drawBoardToPNG(board, moves, points)
        try {
          if (canShareFile) {
            navigator.share({
              files: [file],
            })
          } else {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": file,
              }),
            ])
            toast({ description: "Copied image to clipboard!" })
          }
        } catch (e) {
          console.error(e)
          toast({ description: "Sharing failed.", variant: "destructive" })
        }
      }}
      className="flex justify-center gap-3"
    >
      Share
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
        />
      </svg>
    </Button>
  )
}
