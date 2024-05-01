import { Preferences } from "@capacitor/preferences"
import { getCookie, removeCookie } from "./cookies"
import {
  Board,
  GameState,
  getGameStateAsString,
  getStateFromString,
} from "@/hooks/useBoard"

export async function saveToPersistedState({
  key,
  value,
}: {
  key: string
  value: string
}) {
  await Preferences.set({
    key,
    value,
  })
}

export async function getFromPersistedState({
  key,
}: {
  key: string
}): Promise<string | undefined> {
  const cookieValue = getCookie(key)
  if (cookieValue) {
    // Migrating away from cookies. If there's a value, we'll move it to preferences (localStorage on web) and remove it from cookies.
    // Next time the value is requested, it will only exist in preferences.
    await saveToPersistedState({
      key,
      value: cookieValue,
    })
    removeCookie(key)
    return cookieValue
  }
  return (await Preferences.get({ key })).value ?? undefined
}

export async function setHighscore(highscore: number) {
  await saveToPersistedState({
    key: "highscore",
    value: highscore.toString(),
  })
}

export async function getHighscore(): Promise<number> {
  const highscoreString = await getFromPersistedState({ key: "highscore" })
  return parseInt(highscoreString ?? "0")
}

export async function isTutorialDone() {
  return Boolean(await getFromPersistedState({ key: "doneTutorial" }))
}

export async function finishedTutorial() {
  await saveToPersistedState({
    key: "doneTutorial",
    value: "true",
  })
}

export async function saveGameState(
  board: Board,
  points: number,
  moves: number,
) {
  const gameStateString = getGameStateAsString(board, points, moves)
  await saveToPersistedState({ key: "gameState", value: gameStateString })
}

export async function getGameState(): Promise<GameState | undefined> {
  const gameStateString = await getFromPersistedState({ key: "gameState" })
  if (!gameStateString) {
    return undefined
  }
  return getStateFromString(gameStateString)
}
