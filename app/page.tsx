'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// Yu-Gi-Oh! iconic cards with image URLs
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
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) =>
            idx === first || idx === second ? { ...card, matched: true } : card
          ))
          setFlippedCards([])
        }, 600)
      } else {
        // No match
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
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading Duel...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-4 md:p-8 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 mb-2 drop-shadow-lg animate-shine">
            YU-GI-OH! MEMORY DUEL
          </h1>
          <p className="text-purple-200 text-lg md:text-xl font-semibold tracking-wide">
            It&apos;s Time to D-D-D-DUEL!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
          <div className="bg-gradient-to-br from-purple-600/80 to-purple-800/80 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-purple-400/50 shadow-2xl">
            <div className="text-purple-200 text-sm font-semibold mb-1">MOVES</div>
            <div className="text-white text-3xl font-bold">{moves}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/80 to-blue-800/80 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-blue-400/50 shadow-2xl">
            <div className="text-blue-200 text-sm font-semibold mb-1">TIME</div>
            <div className="text-white text-3xl font-bold">{time}s</div>
          </div>
          <button
            onClick={restart}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-200 border-2 border-yellow-300"
          >
            🔄 NEW DUEL
          </button>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto mb-8">
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`
                aspect-[2.5/3.5] cursor-pointer preserve-3d transition-all duration-500
                ${card.flipped || card.matched ? 'rotate-y-180' : ''}
                ${card.matched ? 'opacity-0 scale-0' : 'hover:scale-105'}
              `}
            >
              {/* Card Back */}
              <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden shadow-2xl border-2 border-purple-400/50">
                <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-900 flex items-center justify-center relative">
                  <div className="text-6xl md:text-7xl opacity-80">🎴</div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                </div>
              </div>

              {/* Card Front */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg overflow-hidden shadow-2xl border-2 border-yellow-400/80">
                <div className="relative w-full h-full bg-black">
                  <Image
                    src={card.img}
                    alt={card.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2">
                    <p className="text-white text-xs md:text-sm font-bold text-center drop-shadow-lg">
                      {card.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Victory Modal */}
        {gameWon && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 p-1 rounded-3xl shadow-2xl max-w-md mx-4 animate-scaleIn">
              <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-4xl font-bold text-yellow-400 mb-4 drop-shadow-lg">
                  VICTORY!
                </h2>
                <p className="text-purple-200 text-xl mb-6">
                  You&apos;ve won the duel!
                </p>
                <div className="space-y-2 mb-6">
                  <div className="text-white text-2xl font-bold">
                    {moves} Moves
                  </div>
                  <div className="text-white text-2xl font-bold">
                    {time} Seconds
                  </div>
                </div>
                <button
                  onClick={restart}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-purple-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  🎴 DUEL AGAIN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
