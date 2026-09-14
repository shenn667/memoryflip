'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'

// Yu-Gi-Oh cards with reliable image URLs
const YUGIOH_CARDS = [
  { id: 1, name: 'Blue Eyes', img: 'https://images.ygoprodeck.com/images/cards/89631139.jpg' },
  { id: 2, name: 'Dark Magician', img: 'https://images.ygoprodeck.com/images/cards/46986414.jpg' },
  { id: 3, name: 'Exodia', img: 'https://images.ygoprodeck.com/images/cards/33396948.jpg' },
  { id: 4, name: 'Red Eyes', img: 'https://images.ygoprodeck.com/images/cards/74677422.jpg' },
  { id: 5, name: 'Kuriboh', img: 'https://images.ygoprodeck.com/images/cards/40640057.jpg' },
  { id: 6, name: 'Pot of Greed', img: 'https://images.ygoprodeck.com/images/cards/55144522.jpg' },
  { id: 7, name: 'Mirror Force', img: 'https://images.ygoprodeck.com/images/cards/44095762.jpg' },
  { id: 8, name: 'Celtic Guardian', img: 'https://images.ygoprodeck.com/images/cards/91152256.jpg' },
]

interface Card {
  id: number
  pairId: number
  name: string
  img: string
  flipped: boolean
  matched: boolean
  imgLoaded: boolean
}

function shuffleCards(): Card[] {
  const doubled = YUGIOH_CARDS.flatMap((card, idx) => [
    { ...card, id: idx * 2, pairId: idx, flipped: false, matched: false, imgLoaded: false },
    { ...card, id: idx * 2 + 1, pairId: idx, flipped: false, matched: false, imgLoaded: false },
  ])
  return doubled.sort(() => Math.random() - 0.5).map((card, idx) => ({
    ...card,
    id: idx,
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
      }, 400)
    } else {
      setTimeout(() => {
        setCards(p => p.map((c, i) =>
          i === first || i === second ? { ...c, flipped: false } : c
        ))
        setFlipped([])
      }, 900)
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

  function onImageLoad(idx: number) {
    setCards(p => p.map((c, i) => i === idx ? { ...c, imgLoaded: true } : c))
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Yu-Gi-Oh! Memory</h1>
          <p className="text-slate-500">Find all the card pairs</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8 flex-wrap">
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
        <div className="grid grid-cols-4 gap-2 md:gap-3 mb-8">
          {cards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => toggleCard(idx)}
              className={`
                aspect-[2.5/3.5] rounded-lg
                transition-all duration-300 transform
                overflow-hidden relative
                ${card.matched 
                  ? 'opacity-0 scale-0 pointer-events-none' 
                  : 'opacity-100 scale-100'
                }
                ${card.flipped || card.matched
                  ? 'shadow-lg'
                  : 'bg-gradient-to-br from-slate-200 to-slate-300 hover:shadow-lg hover:scale-105 cursor-pointer shadow-md'
                }
              `}
              disabled={card.matched}
            >
              {/* Card Back */}
              {!card.flipped && !card.matched && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-3xl">
                  🎴
                </div>
              )}

              {/* Card Front */}
              {(card.flipped || card.matched) && (
                <div className="absolute inset-0 bg-white flex items-center justify-center text-xs text-slate-600 text-center p-1">
                  {!card.imgLoaded ? (
                    <div className="animate-pulse">Loading...</div>
                  ) : (
                    <img
                      src={card.img}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      onLoad={() => onImageLoad(idx)}
                    />
                  )}
                </div>
              )}

              {/* Preload Image */}
              <img
                src={card.img}
                alt={card.name}
                className="hidden"
                onLoad={() => onImageLoad(idx)}
              />
            </button>
          ))}
        </div>

        {/* Victory */}
        {gameWon && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn">
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
