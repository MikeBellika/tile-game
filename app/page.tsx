import { redirect } from "next/navigation"
import dynamic from "next/dynamic"

export default function Home() {
  redirect("/exponentile")
  return <div></div>
}
