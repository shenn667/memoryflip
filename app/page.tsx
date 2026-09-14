'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'

const CARDS_DATA = [
  { id: 1, title: 'Blue Eyes', color: 'from-blue-400 to-blue-600', emoji: '🐉' },
  { id: 2, title: 'Dark Magician', color: 'from-purple-400 to-purple-600', emoji: '🪄' },
  { id: 3, title: 'Exodia', color: 'from-red-400 to-red-600', emoji: '👁️' },
  { id: 4, title: 'Red Eyes', color: 'from-orange-400 to-orange-600', emoji: '🔥' },
  { id: 5, title: 'Kuriboh', color: 'from-pink-400 to-pink-600', emoji: '🐹' },
  { id: 6, title: 'Pot of Greed', color: 'from-yellow-400 to-yellow-600', emoji: '🎁' },
  { id: 7, title: 'Mirror Force', color: 'from-indigo-400 to-indigo-600', emoji: '✨' },
  { id: 8, title: 'Celtic Guardian', color: 'from-green-400 to-green-600', emoji: '⚔️' },
]

interface Card {
  index: number
  pairId: number
  title: string
  color: string
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

function createGameCards(): Card[] {
  const doubled = CARDS_DATA.flatMap((card, idx) => [
    { index: idx * 2, pairId: idx, title: card.title, color: card.color, emoji: card.emoji, isFlipped: false, isMatched: false },
    { index: idx * 2 + 1, pairId: idx, title: card.title, color: card.color, emoji: card.emoji, isFlipped: false, isMatched: false },
  ])
  return doubled.sort(() => Math.random() - 0.5)
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [won, setWon] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize
  useEffect(() => {
    setMounted(true)
    setCards(createGameCards())
  }, [])

  // Timer
  useEffect(() => {
    if (!mounted || won) return
    const timer = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [mounted, won])

  // Check for match
  useEffect(() => {
    if (flipped.length !== 2) return

    const [first, second] = flipped
    const isMatch = cards[first].pairId === cards[second].pairId

    setTimeout(() => {
      if (isMatch) {
        setCards(prev => prev.map((c, i) =>
          i === first || i === second ? { ...c, isMatched: true } : c
        ))
      } else {
        setCards(prev => prev.map((c, i) =>
          i === first || i === second ? { ...c, isFlipped: false } : c
        ))
      }
      setFlipped([])
    }, isMatch ? 300 : 800)
  }, [flipped, cards])

  // Check win
  useEffect(() => {
    if (mounted && cards.length > 0 && cards.every(c => c.isMatched)) {
      setWon(true)
    }
  }, [cards, mounted])

  const handleClick = (idx: number) => {
    if (!mounted || flipped.length === 2 || cards[idx].isFlipped || cards[idx].isMatched) return

    setCards(prev => prev.map((c, i) => i === idx ? { ...c, isFlipped: true } : c))
    setFlipped(prev => [...prev, idx])
    if (flipped.length === 1) setMoves(m => m + 1)
  }

  const restart = () => {
    setCards(createGameCards())
    setFlipped([])
    setMoves(0)
    setSeconds(0)
    setWon(false)
  }

  if (!mounted) return <div />

  return (
    <main className="min-h-screen bg-slate-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2">YU-GI-OH!</h1>
          <p className="text-slate-400">Memory Match Game</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-12 mb-8 text-center">
          <div>
            <p className="text-slate-400 text-sm mb-1">MOVES</p>
            <p className="text-4xl font-bold text-white">{moves}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">TIME</p>
            <p className="text-4xl font-bold text-white">{seconds}s</p>
          </div>
          <button
            onClick={restart}
            className="px-8 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition"
          >
            NEW GAME
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {cards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              disabled={card.isMatched}
              className={`
                aspect-square rounded-xl font-bold text-5xl
                transition-all duration-300 transform
                shadow-lg hover:shadow-2xl
                ${card.isMatched ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}
                ${card.isFlipped ? `bg-gradient-to-br ${card.color}` : 'bg-gradient-to-br from-slate-700 to-slate-800 hover:scale-110'}
              `}
            >
              {(card.isFlipped || card.isMatched) && card.emoji}
            </button>
          ))}
        </div>

        {/* Win Modal */}
        {won && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-sm text-center border-2 border-white">
              <p className="text-6xl mb-4">🏆</p>
              <h2 className="text-3xl font-bold text-white mb-4">YOU WON!</h2>
              <p className="text-slate-300 mb-6">{moves} Moves • {seconds} Seconds</p>
              <button
                onClick={restart}
                className="w-full px-6 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
