'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useGameSprites } from '@/hooks/game/use-game-sprites'
import { GAME_HEIGHT, GAME_WIDTH, HIGH_SCORE_KEY, SPRITE_PATHS } from '@/lib/game/constants'
import type { GameSprites, GameState } from '@/lib/game/types'
import { BakerGame } from './baker-game'
import { GameLoadingState } from './game-loading-state'
import { GameOverScreen } from './game-over-screen'

function StartScreen({ onStart, sprites }: { onStart: () => void; sprites: GameSprites }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [highScore, setHighScore] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem(HIGH_SCORE_KEY)
    if (stored) {
      setHighScore(Number.parseInt(stored, 10) || 0)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    ctx.drawImage(sprites.game_start, 0, 0, GAME_WIDTH, GAME_HEIGHT)

    if (highScore > 0) {
      ctx.font = 'bold 24px monospace'
      ctx.textAlign = 'center'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 4
      ctx.strokeText(`Rekord: ${highScore}`, GAME_WIDTH / 2, 50)
      ctx.fillStyle = '#fff'
      ctx.fillText(`Rekord: ${highScore}`, GAME_WIDTH / 2, 50)
    }
  }, [sprites, highScore])

  return (
    <div className="relative h-full w-full">
      <canvas
        className="h-full w-full"
        height={GAME_HEIGHT}
        ref={canvasRef}
        style={{ imageRendering: 'pixelated' }}
        width={GAME_WIDTH}
      />
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <Button className="gap-2" onClick={onStart} size="lg">
          <Play className="h-5 w-5" />
          Hrať
        </Button>
      </div>
    </div>
  )
}

export function GameCard() {
  const [open, setOpen] = useState(false)
  const [gameState, setGameState] = useState<GameState>('idle')
  const [finalScore, setFinalScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  const { sprites, loading, error } = useGameSprites()

  const handleStart = useCallback(() => {
    setGameState('playing')
  }, [])

  const handleGameOver = useCallback((score: number, newHighScore: number) => {
    setFinalScore(score)
    setHighScore(newHighScore)
    setGameState('gameover')
  }, [])

  const handleRestart = useCallback(() => {
    setResetKey(prev => prev + 1)
    setGameState('playing')
  }, [])

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setGameState('idle')
      setResetKey(prev => prev + 1)
    }
  }, [])

  const isPlaying = gameState === 'playing'

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <button
          className="group relative aspect-[8/5] w-full max-w-2xl overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
          type="button"
        >
          <Image
            alt="Pekáreň Kromka - Hra"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            src={SPRITE_PATHS.game_start}
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 transition-colors group-hover:bg-black/40">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
              <Play className="ml-1 size-7 text-amber-600" />
            </div>
            <span className="font-semibold text-sm text-white drop-shadow-md">
              Zahraj si hru
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent
        className="aspect-[8/5] max-h-[90dvh] w-full max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-5xl"
        onEscapeKeyDown={(e) => {
          if (isPlaying) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (isPlaying) e.preventDefault()
        }}
        showCloseButton={!isPlaying}
      >
        <DialogTitle className="sr-only">Pekáreň Kromka - Hra</DialogTitle>
        <DialogDescription className="sr-only">
          Chytaj padajúce pečivo a zbieraj body
        </DialogDescription>
        {loading && <GameLoadingState />}
        {error && (
          <div className="flex h-full items-center justify-center">
            <p className="text-destructive">Nepodarilo sa načítať hru</p>
          </div>
        )}
        {!loading && !error && gameState === 'idle' && sprites && (
          <StartScreen onStart={handleStart} sprites={sprites} />
        )}
        {!loading && !error && isPlaying && sprites && (
          <BakerGame key={resetKey} onGameOver={handleGameOver} sprites={sprites} />
        )}
        {!loading && !error && gameState === 'gameover' && sprites && (
          <GameOverScreen highScore={highScore} onRestart={handleRestart} score={finalScore} sprites={sprites} />
        )}
      </DialogContent>
    </Dialog>
  )
}
