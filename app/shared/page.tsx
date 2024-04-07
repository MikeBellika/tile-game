"use client"
import { decodeStateFromURL } from "@/utils/sharing"
import dynamic from "next/dynamic"

export default function Home() {
  if (typeof window == "undefined") {
    return <div>Loading</div>
  }
  const sharedState = decodeStateFromURL(window.location.search)

  const SvgGrid = dynamic(() => import("../../components/SvgGrid"), {
    ssr: false,
  })

  return (
    <div className="flex h-full w-full justify-center">
      {sharedState && <SvgGrid board={sharedState?.board} />}
    </div>
  )
}
