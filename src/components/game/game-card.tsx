'use client'

import { Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGameSprites } from '@/hooks/game/use-game-sprites'
import { GAME_HEIGHT, GAME_WIDTH, HIGH_SCORE_KEY } from '@/lib/game/constants'
import type { GameSprites, GameState } from '@/lib/game/types'
import { BakerGame, type BakerGameRef } from './baker-game'
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

    // Draw background image
    ctx.drawImage(sprites.game_start, 0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Draw high score text with outline for visibility
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
          Hrat
        </Button>
      </div>
    </div>
  )
}

export function GameCard() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [finalScore, setFinalScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const gameRef = useRef<BakerGameRef>(null)
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
    gameRef.current?.reset()
    setGameState('playing')
  }, [])

  if (error) {
    return (
      <Card className="aspect-8/5 w-full max-w-5xl">
        <CardContent className="flex h-full items-center justify-center p-6">
          <p className="text-destructive">Nepodarilo sa nacitat hru</p>
        </CardContent>
      </Card>
    )
  }

  const renderContent = () => {
    if (loading) {
      return <GameLoadingState />
    }

    if (gameState === 'idle' && sprites) {
      return <StartScreen onStart={handleStart} sprites={sprites} />
    }

    if (gameState === 'playing' && sprites) {
      return <BakerGame onGameOver={handleGameOver} ref={gameRef} sprites={sprites} />
    }

    if (gameState === 'gameover') {
      return <GameOverScreen highScore={highScore} onRestart={handleRestart} score={finalScore} />
    }

    return null
  }

  return (
    <Card className="aspect-8/5 w-full max-w-5xl overflow-hidden">
      <CardContent className="relative h-full p-0">{renderContent()}</CardContent>
    </Card>
  )
}
