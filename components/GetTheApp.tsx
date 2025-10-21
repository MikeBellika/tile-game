"use client"

import { useState } from "react"
import { Capacitor } from "@capacitor/core"
import Dialog from "./Dialog"

const APP_STORE_URL = "https://apps.apple.com/us/app/exponentile/id6483929210"
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=dk.bellika.exponentile"

export default function GetTheApp() {
  const [open, setOpen] = useState(false)

  if (Capacitor.isNativePlatform()) {
    return null
  }

  return (
    <>
      <Dialog open={open} setOpen={setOpen}>
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Get the app
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Play ExponenTile on the go by downloading the app for your device.
        </p>
        <div className="mt-4 flex flex-row justify-center gap-3">
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
            <img
              src="/ios_appstore_badge.svg"
              alt="Download on the App Store"
              className="h-12 w-auto"
            />
          </a>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
            <img
              src="/android_playstore_badge.svg"
              alt="Get it on Google Play"
              className="h-12 w-auto"
            />
          </a>
        </div>
      </Dialog>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-slate-500 underline decoration-dotted underline-offset-4 transition-colors hover:text-slate-700 dark:text-slate-300 hover:dark:text-white"
      >
        Get the app
      </button>
    </>
  )
}
