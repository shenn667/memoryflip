'use client'

import { useState, useEffect } from 'react'

const EMOJIS = ['🚀', '🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸']
const CARDS = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5)

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

export default function MemoryFlip() {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [bestScore, setBestScore] = useState<number | null>(null)

  // Initialize game
  useEffect(() => {
    const initialCards = CARDS.map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }))
    setCards(initialCards)
    
    // Load best score
    const saved = localStorage.getItem('memoryflip-best')
    if (saved) setBestScore(parseInt(saved))
  }, [])

  // Timer
  useEffect(() => {
    if (!gameStarted || gameWon) return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [gameStarted, gameWon])

  // Check win condition
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setGameWon(true)
      const finalScore = Math.max(0, 10000 - moves * 100 - timer * 10)
      setScore(finalScore)
      
      if (!bestScore || finalScore > bestScore) {
        setBestScore(finalScore)
        localStorage.setItem('memoryflip-best', finalScore.toString())
      }
    }
  }, [cards, moves, timer, bestScore])

  const handleCardClick = (id: number) => {
    if (!gameStarted) setGameStarted(true)
    
    const card = cards[id]
    if (card.flipped || card.matched || flippedCards.length === 2) return

    const newCards = [...cards]
    newCards[id].flipped = true
    setCards(newCards)

    const newFlipped = [...flippedCards, id]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [first, second] = newFlipped
      
      if (cards[first].emoji === cards[second].emoji) {
        // Match!
        setTimeout(() => {
          const matched = [...cards]
          matched[first].matched = true
          matched[second].matched = true
          setCards(matched)
          setFlippedCards([])
        }, 600)
      } else {
        // No match
        setTimeout(() => {
          const unflipped = [...cards]
          unflipped[first].flipped = false
          unflipped[second].flipped = false
          setCards(unflipped)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const resetGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5)
    const newCards = shuffled.map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }))
    setCards(newCards)
    setFlippedCards([])
    setMoves(0)
    setTimer(0)
    setGameStarted(false)
    setGameWon(false)
    setScore(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white mb-2 drop-shadow-lg">
            🧠 MemoryFlip
          </h1>
          <p className="text-white/90 text-lg">Match all pairs as fast as you can!</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600">{moves}</div>
              <div className="text-sm text-gray-600 font-medium">Moves</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600">{formatTime(timer)}</div>
              <div className="text-sm text-gray-600 font-medium">Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600">
                {bestScore !== null ? bestScore : '-'}
              </div>
              <div className="text-sm text-gray-600 font-medium">Best Score</div>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.matched}
              className={`aspect-square rounded-2xl text-5xl font-bold transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                card.flipped || card.matched
                  ? 'bg-white shadow-2xl rotate-0'
                  : 'bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg rotate-y-180'
              } ${
                card.matched 
                  ? 'opacity-60 cursor-not-allowed ring-4 ring-green-400' 
                  : 'hover:shadow-2xl cursor-pointer'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
              <span className={card.flipped || card.matched ? 'block' : 'hidden'}>
                {card.emoji}
              </span>
              <span className={card.flipped || card.matched ? 'hidden' : 'block text-white/30'}>
                ?
              </span>
            </button>
          ))}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetGame}
          className="w-full bg-white hover:bg-gray-50 text-purple-600 font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
        >
          🔄 New Game
        </button>

        {/* Win Modal */}
        {gameWon && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl transform animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="text-7xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  You Won!
                </h2>
                <div className="space-y-2 mb-6">
                  <p className="text-gray-600">
                    <span className="font-bold">Moves:</span> {moves}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Time:</span> {formatTime(timer)}
                  </p>
                  <p className="text-2xl font-bold text-purple-600 mt-4">
                    Score: {score}
                  </p>
                  {score === bestScore && (
                    <p className="text-green-600 font-bold text-lg">
                      🏆 New Best Score!
                    </p>
                  )}
                </div>
                <button
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
