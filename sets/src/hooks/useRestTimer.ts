import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { restTimerAtom } from '../store/atoms'

export function useRestTimer() {
  const [timer, setTimer] = useAtom(restTimerAtom)

  useEffect(() => {
    if (!timer.isActive || timer.remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setTimer(prev => {
        if (!prev.isActive) return prev
        if (prev.remainingSeconds <= 1) {
          navigator.vibrate?.([100, 50, 100])
          return { ...prev, remainingSeconds: 0, isActive: false }
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timer.isActive, setTimer])

  function start(totalSeconds: number, exerciseName: string) {
    setTimer({
      isActive: true,
      isMinimized: false,
      totalSeconds,
      remainingSeconds: totalSeconds,
      exerciseName,
    })
  }

  function skip() {
    setTimer(prev => ({ ...prev, isActive: false, remainingSeconds: 0 }))
  }

  function adjust(deltaSecs: number) {
    setTimer(prev => ({
      ...prev,
      remainingSeconds: Math.max(0, Math.min(prev.totalSeconds + 120, prev.remainingSeconds + deltaSecs)),
    }))
  }

  function minimize() {
    setTimer(prev => ({ ...prev, isMinimized: true }))
  }

  function expand() {
    setTimer(prev => ({ ...prev, isMinimized: false }))
  }

  return { timer, start, skip, adjust, minimize, expand }
}
