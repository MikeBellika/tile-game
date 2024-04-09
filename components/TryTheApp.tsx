"use client"
import { useState } from "react"
import Dialog from "./Dialog"

export default function TryTheApp() {
  var ua = navigator.userAgent.toLowerCase()
  if (!ua.includes("android") && false) {
    return <></>
  }
  const [open, setOpen] = useState(false)
  return (
    <>
      <Dialog open={open} setOpen={setOpen}>
        <h2 className="whitespace-nowrap text-lg font-semibold leading-none tracking-tight">
          Beta test the app
        </h2>
        <p className="mt-4">
          I need beta testers for the ExponenTile app in the Google Play Store.
          If you would like to test, please email me at{" "}
          <a
            href="mailto:exponentile@bellika.dk?subject=Beta testing Android app"
            className="font-medium underline"
          >
            exponentile@bellika.dk
          </a>
          .<br />
          <br />I will never send you any emails not related to the beta testing
          and you can opt out any time.
        </p>
      </Dialog>
      <button onClick={() => setOpen(true)}>Try the app</button>
    </>
  )
}
