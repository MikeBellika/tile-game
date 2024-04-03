import { MouseEventHandler } from "react"

export default function Button({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick: MouseEventHandler<HTMLButtonElement>
  className?: string
}) {
  return (
    <button
      className={`rounded border border-black px-4 py-2 transition-colors hover:bg-slate-100 dark:border-white hover:dark:bg-slate-600 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
