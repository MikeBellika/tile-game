import { useState, useEffect, useRef } from "react"

type UseAudioPlayerHook = {
  play: (pitch?: number) => void
  pause: () => void
  isPlaying: boolean
}

export const useAudioPlayer = (urls: string[]): UseAudioPlayerHook => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const [audioBuffers, setAudioBuffers] = useState<AudioBuffer[]>([])

  // Initialize AudioContext
  useEffect(() => {
    const audioContext = new window.AudioContext()
    audioContextRef.current = audioContext

    return () => {
      audioContext.close()
    }
  }, [])

  // Load audio files into buffer
  const loadAudioFiles = async (): Promise<AudioBuffer[]> => {
    const buffers = await Promise.all(
      urls.map((url) =>
        fetch(url)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => {
            if (audioContextRef.current) {
              return audioContextRef.current.decodeAudioData(arrayBuffer)
            }
            throw new Error("AudioContext not initialized")
          }),
      ),
    )
    return buffers
  }

  useEffect(() => {
    loadAudioFiles().then((buffers) => {
      setAudioBuffers(buffers)
      setLoaded(true)
    })
  }, [urls])

  // Play a random audio with optional pitch adjustment
  const play = (pitch: number = 1.0): void => {
    if (!loaded || !audioContextRef.current) return

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop()
    }

    const bufferIndex = Math.floor(Math.random() * audioBuffers.length)
    const sourceNode = audioContextRef.current.createBufferSource()
    sourceNode.buffer = audioBuffers[bufferIndex]
    sourceNode.playbackRate.value = pitch
    sourceNode.connect(audioContextRef.current.destination)
    sourceNode.start()
    setIsPlaying(true)

    sourceNode.onended = () => {
      setIsPlaying(false)
    }

    sourceNodeRef.current = sourceNode
  }

  // Pause the currently playing audio
  const pause = (): void => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop()
      setIsPlaying(false)
    }
  }

  return { play, pause, isPlaying }
}
