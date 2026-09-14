'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'

const CARD_PAIRS = [
  { id: 1, emoji: '🐉', name: 'Dragon' },
  { id: 2, emoji: '🪄', name: 'Magic' },
  { id: 3, emoji: '🎭', name: 'Drama' },
  { id: 4, emoji: '⚡', name: 'Lightning' },
  { id: 5, emoji: '❄️', name: 'Frost' },
  { id: 6, emoji: '🔥', name: 'Fire' },
  { id: 7, emoji: '💎', name: 'Crystal' },
  { id: 8, emoji: '🌙', name: 'Moon' },
]

interface Card {
  id: number
  pairId: number
  emoji: string
  name: string
  flipped: boolean
  matched: boolean
}

function shuffleCards(): Card[] {
  const doubled = CARD_PAIRS.flatMap((card, idx) => [
    { ...card, id: idx * 2, pairId: idx },
    { ...card, id: idx * 2 + 1, pairId: idx },
  ])
  return doubled.sort(() => Math.random() - 0.5).map((card, idx) => ({
    ...card,
    id: idx,
    flipped: false,
    matched: false,
  }))
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCards(shuffleCards())
  }, [])

  useEffect(() => {
    if (!mounted || gameWon) return
    const interval = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [mounted, gameWon])

  useEffect(() => {
    if (flipped.length !== 2) return

    const [first, second] = flipped
    if (cards[first].pairId === cards[second].pairId) {
      setTimeout(() => {
        setCards(p => p.map((c, i) => 
          i === first || i === second ? { ...c, matched: true } : c
        ))
        setFlipped([])
      }, 300)
    } else {
      setTimeout(() => {
        setCards(p => p.map((c, i) =>
          i === first || i === second ? { ...c, flipped: false } : c
        ))
        setFlipped([])
      }, 800)
    }
  }, [flipped, cards])

  useEffect(() => {
    if (mounted && cards.length > 0 && cards.every(c => c.matched)) {
      setGameWon(true)
    }
  }, [cards, mounted])

  function toggleCard(idx: number) {
    if (!mounted) return
    if (flipped.length === 2) return
    if (cards[idx].flipped || cards[idx].matched) return

    setCards(p => p.map((c, i) => i === idx ? { ...c, flipped: true } : c))
    setFlipped(prev => [...prev, idx])
    if (flipped.length === 1) setMoves(m => m + 1)
  }

  function restart() {
    setCards(shuffleCards())
    setFlipped([])
    setMoves(0)
    setTime(0)
    setGameWon(false)
  }

  if (!mounted) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-slate-400">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Memory</h1>
          <p className="text-slate-500">Match the pairs</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-sm text-slate-500 mb-1">Moves</div>
            <div className="text-3xl font-bold text-slate-900">{moves}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500 mb-1">Time</div>
            <div className="text-3xl font-bold text-slate-900">{time}s</div>
          </div>
          <button
            onClick={restart}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
          >
            New Game
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {cards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => toggleCard(idx)}
              className={`
                aspect-square rounded-lg font-bold text-4xl
                transition-all duration-200 transform
                ${card.matched 
                  ? 'opacity-0 scale-0' 
                  : 'opacity-100 scale-100'
                }
                ${card.flipped || card.matched
                  ? 'bg-white shadow-md'
                  : 'bg-gradient-to-br from-slate-200 to-slate-300 hover:shadow-lg hover:scale-105 cursor-pointer'
                }
              `}
              disabled={card.matched}
            >
              {(card.flipped || card.matched) && card.emoji}
            </button>
          ))}
        </div>

        {/* Victory */}
        {gameWon && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">You Won!</h2>
              <p className="text-slate-500 mb-6">
                {moves} moves in {time} seconds
              </p>
              <button
                onClick={restart}
                className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
