import { Preferences } from "@capacitor/preferences"
import { Capacitor } from "@capacitor/core"
import { getCookie, setCookie } from "./cookies"
import { CapacitorGameConnect } from "@openforge/capacitor-game-connect"

export async function setHighscore(highscore: number) {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({
      key: "highscore",
      value: highscore.toString(),
    })
    if (Capacitor.getPlatform() == "ios") {
      await CapacitorGameConnect.submitScore({
        leaderboardID: "exponentile",
        totalScoreAmount: highscore,
      })
    }
  } else {
    setCookie("highscore", highscore, 1000)
  }
}

export async function getHighscore(): Promise<number> {
  if (Capacitor.isNativePlatform()) {
    const highscoreString = await Preferences.get({ key: "highscore" })
    return parseInt(highscoreString.value ?? "0")
  } else {
    return parseInt(getCookie("highscore") ?? "0")
  }
}

export async function isTutorialDone() {
  if (Capacitor.isNativePlatform()) {
    return Boolean((await Preferences.get({ key: "doneTutorial" })).value)
  } else {
    return getCookie("doneTutorial") != undefined
  }
}

export async function finishedTutorial() {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({
      key: "doneTutorial",
      value: "true",
    })
  } else {
    setCookie("doneTutorial", 1, 1000)
  }
}
