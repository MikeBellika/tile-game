"use client"
import { useState } from "react"
import Dialog from "./Dialog"
import { Capacitor } from "@capacitor/core"
import Button from "./Button"

export default function TryTheApp() {
  const [open, setOpen] = useState(false)
  if (Capacitor.getPlatform() != "web") {
    return <></>
  }
  return (
    <>
      <Dialog open={open} setOpen={setOpen}>
        <h2 className="whitespace-nowrap text-lg font-semibold leading-none tracking-tight">
          Beta test the app
        </h2>
        <p className="mt-4">
          I am developing an app for Android. If you are interested in beta
          testing this app before its release, please email me at{" "}
          <a
            href="mailto:exponentile@bellika.dk?subject=Beta testing the app"
            className="font-medium underline"
          >
            exponentile@bellika.dk
          </a>
          .<br />
          <br />
          I will never send you any emails unrelated to the beta testing, and
          you can opt out of the beta at any time.
          <br />
          Your help will be greatly appreciated 🙂
        </p>
      </Dialog>
      <Button onClick={() => setOpen(true)}>Beta test the app</Button>
    </>
  )
}
