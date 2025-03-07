"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const POSSIBLE_ANSWERS = ["EAGLE", "ATRIA", "ADMIN"]
const MAX_ATTEMPTS = 6
const WORD_LENGTH = 5

type GameStatus = "playing" | "won" | "lost"

export default function WordleGame() {
  const [answer, setAnswer] = useState<string>(() => 
    POSSIBLE_ANSWERS[Math.floor(Math.random() * POSSIBLE_ANSWERS.length)].toUpperCase()
  )

  const [guesses, setGuesses] = useState<string[]>(Array(MAX_ATTEMPTS).fill(""))
  const [currentGuess, setCurrentGuess] = useState<string>("")
  const [currentAttempt, setCurrentAttempt] = useState<number>(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing")

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameStatus !== "playing") return

      const key = event.key.toUpperCase()

      if (key === "ENTER") {
        submitGuess()
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1))
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentGuess, gameStatus])

  const submitGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      toast({
        title: "Word too short",
        description: `Your guess must be ${WORD_LENGTH} letters long.`,
        variant: "destructive",
      })
      return
    }

    const newGuesses = [...guesses]
    newGuesses[currentAttempt] = currentGuess
    setGuesses(newGuesses)

    if (currentGuess.toUpperCase() === answer.toUpperCase()) {
      setGameStatus("won")
      toast({
        title: "Congratulations!",
        description: "You've guessed the word correctly!",
      })
    } else if (currentAttempt === MAX_ATTEMPTS - 1) {
      setGameStatus("lost")
      toast({
        title: "Game Over",
        description: `The word was ${answer}.`,
        variant: "destructive",
      })
    } else {
      setCurrentAttempt((prev) => prev + 1)
      setCurrentGuess("")
    }
  }

  const resetGame = () => {
    setAnswer(POSSIBLE_ANSWERS[Math.floor(Math.random() * POSSIBLE_ANSWERS.length)].toUpperCase())
    setGuesses(Array(MAX_ATTEMPTS).fill(""))
    setCurrentGuess("")
    setCurrentAttempt(0)
    setGameStatus("playing")
  }

  const getLetterColor = (letter: string, position: number, guess: string, isWinningRow: boolean) => {
    if (!letter) return "bg-gray-200 dark:bg-gray-700"

    if (isWinningRow) {
      return "bg-green-500 text-white border-green-500"
    }

    const upperAnswer = answer.toUpperCase()

    if (letter === upperAnswer[position]) {
      return "bg-green-500 text-white border-green-500"
    } else if (upperAnswer.includes(letter)) {
      return "bg-yellow-500 text-white border-yellow-500"
    } else {
      return "bg-gray-400 text-white border-gray-400 dark:bg-gray-600"
    }
  }

  const getKeyColor = (key: string) => {
    let keyColor = "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
    const upperAnswer = answer.toUpperCase()

    for (let i = 0; i < currentAttempt; i++) {
      const guess = guesses[i]

      for (let j = 0; j < guess.length; j++) {
        if (guess[j] === key) {
          if (key === upperAnswer[j]) {
            return "bg-green-500 text-white hover:bg-green-600"
          } else if (upperAnswer.includes(key)) {
            keyColor = "bg-yellow-500 text-white hover:bg-yellow-600"
          } else {
            keyColor = "bg-gray-400 text-white hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500"
          }
        }
      }
    }

    return keyColor
  }

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Toaster />
      <h1 className="mb-8 text-4xl font-bold text-center text-gray-800 dark:text-gray-100">Wordle</h1>

      {/* Game status message moved to top */}
      {gameStatus !== "playing" && (
        <div className="mb-4 text-center">
          <p className="mb-4 text-xl font-bold">
            {gameStatus === "won" ? "Congrats!! You won!!" : `Game over! The word was ${answer}`}
          </p>
          <Button onClick={resetGame}>Play Again</Button>
        </div>
      )}

      {/* Game Board */}
      <div className="mb-8">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, attemptIndex) => (
          <div key={attemptIndex} className="flex justify-center mb-2">
            {Array.from({ length: WORD_LENGTH }).map((_, letterIndex) => {
              const letter =
                attemptIndex === currentAttempt
                  ? currentGuess[letterIndex] || ""
                  : guesses[attemptIndex][letterIndex] || ""

              const isWinningRow =
                gameStatus === "won" &&
                guesses[attemptIndex].toUpperCase() === answer.toUpperCase()

              const letterColor = isWinningRow
                ? getLetterColor(letter, letterIndex, guesses[attemptIndex], true)
                : attemptIndex < currentAttempt
                ? getLetterColor(letter, letterIndex, guesses[attemptIndex], false)
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"

              return (
                <div
                  key={letterIndex}
                  className={`flex items-center justify-center w-14 h-14 m-1 text-2xl font-bold border-2 rounded ${letterColor} transition-colors duration-300`}
                >
                  {letter}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div className="w-full max-w-md mb-4">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-2">
            {row.map((key) => (
              <Button
                key={key}
                onClick={() => {
                  if (gameStatus !== "playing") return

                  if (key === "BACKSPACE") {
                    setCurrentGuess((prev) => prev.slice(0, -1))
                  } else if (currentGuess.length < WORD_LENGTH) {
                    setCurrentGuess((prev) => prev + key)
                  }
                }}
                className={`${key === "BACKSPACE" ? "px-3" : "px-2"} mx-0.5 h-12 font-bold ${getKeyColor(key)}`}
                variant="ghost"
              >
                {key === "BACKSPACE" ? "⌫" : key}
              </Button>
            ))}
          </div>
        ))}
        <div className="flex justify-center mt-4">
          <Button
            onClick={submitGuess}
            disabled={gameStatus !== "playing"}
            className="px-8 py-2 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
          >
            ENTER
          </Button>
        </div>
      </div>
    </div>
  )
}