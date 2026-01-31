'use client'

import dynamic from 'next/dynamic'
import { GameLoadingState } from './game-loading-state'

const GameCard = dynamic(() => import('./game-card').then((mod) => mod.GameCard), {
  ssr: false,
  loading: () => <GameLoadingState />,
})

export function GameCardWrapper() {
  return <GameCard />
}
