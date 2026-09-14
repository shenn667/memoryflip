'use client'

import { useState, useEffect } from 'react'

const YUGIOH_CARDS = [
  { id: 'blue-eyes', name: 'Blue-Eyes White Dragon', img: 'https://images.ygoprodeck.com/images/cards/89631139.jpg' },
  { id: 'dark-magician', name: 'Dark Magician', img: 'https://images.ygoprodeck.com/images/cards/46986414.jpg' },
  { id: 'exodia', name: 'Exodia the Forbidden One', img: 'https://images.ygoprodeck.com/images/cards/33396948.jpg' },
  { id: 'red-eyes', name: 'Red-Eyes Black Dragon', img: 'https://images.ygoprodeck.com/images/cards/74677422.jpg' },
  { id: 'kuriboh', name: 'Kuriboh', img: 'https://images.ygoprodeck.com/images/cards/40640057.jpg' },
  { id: 'pot-of-greed', name: 'Pot of Greed', img: 'https://images.ygoprodeck.com/images/cards/55144522.jpg' },
  { id: 'mirror-force', name: 'Mirror Force', img: 'https://images.ygoprodeck.com/images/cards/44095762.jpg' },
  { id: 'celtic-guardian', name: 'Celtic Guardian', img: 'https://images.ygoprodeck.com/images/cards/91152256.jpg' },
]

interface Card {
  id: number
  cardId: string
  name: string
  img: string
  flipped: boolean
  matched: boolean
}

function shuffleCards(): Card[] {
  const doubled = [...YUGIOH_CARDS, ...YUGIOH_CARDS]
  return doubled
    .map((card, index) => ({
      id: index,
      cardId: card.id,
      name: card.name,
      img: card.img,
      flipped: false,
      matched: false,
    }))
    .sort(() => Math.random() - 0.5)
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCards(shuffleCards())
  }, [])

  useEffect(() => {
    if (!gameStarted || gameWon) return
    const timer = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [gameStarted, gameWon])

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      if (cards[first].cardId === cards[second].cardId) {
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) =>
            idx === first || idx === second ? { ...card, matched: true } : card
          ))
          setFlippedCards([])
        }, 500)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) =>
            idx === first || idx === second ? { ...card, flipped: false } : card
          ))
          setFlippedCards([])
        }, 1000)
      }
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (mounted && cards.length > 0 && cards.every(card => card.matched)) {
      setGameWon(true)
    }
  }, [cards, mounted])

  function handleCardClick(index: number) {
    if (!gameStarted) setGameStarted(true)
    if (flippedCards.length === 2) return
    if (cards[index].flipped || cards[index].matched) return
    if (flippedCards.includes(index)) return

    setCards(prev => prev.map((card, idx) =>
      idx === index ? { ...card, flipped: true } : card
    ))
    setFlippedCards(prev => [...prev, index])
    if (flippedCards.length === 1) setMoves(m => m + 1)
  }

  function restart() {
    setCards(shuffleCards())
    setFlippedCards([])
    setMoves(0)
    setTime(0)
    setGameStarted(false)
    setGameWon(false)
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="glass-card px-8 py-6">
          <div className="text-slate-600 text-lg">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
            Memory Match
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            Find all the pairs of Yu-Gi-Oh! cards
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <div className="glass-card px-6 py-3">
            <div className="text-slate-500 text-xs font-medium mb-1">Moves</div>
            <div className="text-slate-800 text-2xl font-semibold">{moves}</div>
          </div>
          <div className="glass-card px-6 py-3">
            <div className="text-slate-500 text-xs font-medium mb-1">Time</div>
            <div className="text-slate-800 text-2xl font-semibold">{time}s</div>
          </div>
          <button
            onClick={restart}
            className="glass-card px-6 py-3 hover:bg-white/60 transition-all duration-200 font-medium text-slate-700"
          >
            New Game
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto mb-8">
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`
                aspect-[2.5/3.5] cursor-pointer preserve-3d transition-all duration-500
                ${card.flipped || card.matched ? 'rotate-y-180' : ''}
                ${card.matched ? 'opacity-0 scale-90' : 'hover:scale-105'}
              `}
            >
              {/* Back */}
              <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-lg">
                <div className="w-full h-full glass-card-strong flex items-center justify-center">
                  <div className="text-4xl opacity-40">🎴</div>
                </div>
              </div>

              {/* Front */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-xl">
                <div className="relative w-full h-full bg-white">
                  <img
                    src={card.img}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Victory */}
        {gameWon && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
            <div className="glass-card-strong max-w-sm mx-4 p-8 text-center animate-scaleIn">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Well Done!
              </h2>
              <p className="text-slate-600 mb-6">
                You found all the pairs
              </p>
              <div className="flex justify-center gap-8 mb-6">
                <div>
                  <div className="text-slate-500 text-sm">Moves</div>
                  <div className="text-slate-800 text-2xl font-semibold">{moves}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-sm">Time</div>
                  <div className="text-slate-800 text-2xl font-semibold">{time}s</div>
                </div>
              </div>
              <button
                onClick={restart}
                className="glass-card px-8 py-3 hover:bg-white/60 transition-all duration-200 font-medium text-slate-700 w-full"
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
