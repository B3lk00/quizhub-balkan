import { useEffect, useState } from 'react'
import { flags } from '../data/questions/flags'
import './GuessFlag.css'

function shuffleArray(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function createAnswers(correctFlag) {
  const wrongAnswers = shuffleArray(
    flags.filter((flag) => flag.id !== correctFlag.id),
  )
    .slice(0, 3)
    .map((flag) => flag.country)

  return shuffleArray([
    correctFlag.country,
    ...wrongAnswers,
  ])
}

function GuessFlag({ onBack }) {
  const [gameFlags, setGameFlags] = useState(() =>
  shuffleArray(flags).slice(0, 10),
)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const currentFlag = gameFlags[questionIndex]

  useEffect(() => {
    if (!currentFlag) return

    setAnswers(createAnswers(currentFlag))
    setSelectedAnswer(null)
  }, [currentFlag])

  function handleAnswer(answer) {
    if (selectedAnswer) return

    setSelectedAnswer(answer)

    const isCorrect = answer === currentFlag.country

    if (isCorrect) {
      setScore((currentScore) => currentScore + 1000)
      setCorrectAnswers(
        (currentCorrectAnswers) =>
          currentCorrectAnswers + 1,
      )
    }

    setTimeout(() => {
      const isLastQuestion =
        questionIndex === gameFlags.length - 1

      if (isLastQuestion) {
        setIsFinished(true)
        return
      }

      setQuestionIndex(
        (currentQuestionIndex) =>
          currentQuestionIndex + 1,
      )
    }, 1200)
  }

  function getAnswerClass(answer) {
    if (!selectedAnswer) {
      return 'guess-flag-answer'
    }

    if (answer === currentFlag.country) {
      return 'guess-flag-answer correct'
    }

    if (answer === selectedAnswer) {
      return 'guess-flag-answer wrong'
    }

    return 'guess-flag-answer disabled'
  }

function restartGame() {
  setGameFlags(shuffleArray(flags).slice(0, 10))
  setQuestionIndex(0)
  setSelectedAnswer(null)
  setScore(0)
  setCorrectAnswers(0)
  setIsFinished(false)
}

  if (isFinished) {
    const accuracy = Math.round(
      (correctAnswers / gameFlags.length) * 100,
    )

    return (
      <div className="guess-flag-page">
        <div className="guess-flag-results">
          <div className="guess-flag-trophy">🏆</div>

          <span className="guess-flag-results-label">
            IGRA ZAVRŠENA
          </span>

          <h1>Odlična partija!</h1>

          <p>
            Prepoznao si {correctAnswers} od{' '}
            {gameFlags.length} zastava.
          </p>

          <div className="guess-flag-results-grid">
            <div>
              <span>Rezultat</span>
              <strong>{score}</strong>
            </div>

            <div>
              <span>Tačni odgovori</span>
              <strong>
                {correctAnswers}/{gameFlags.length}
              </strong>
            </div>

            <div>
              <span>Preciznost</span>
              <strong>{accuracy}%</strong>
            </div>
          </div>

          <div className="guess-flag-results-actions">
            <button type="button" onClick={restartGame}>
              Igraj ponovo
            </button>

            <button
              type="button"
              className="secondary"
              onClick={onBack}
            >
              Game Modes
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentFlag) {
    return null
  }

  return (
    <div className="guess-flag-page">
      <header className="guess-flag-header">
        <button
          type="button"
          className="guess-flag-back"
          onClick={onBack}
        >
          ← Nazad
        </button>

        <div className="guess-flag-header-title">
          <span>GAME MODE</span>
          <h1>Pogodi zastavu</h1>
        </div>

        <div className="guess-flag-score">
          <span>REZULTAT</span>
          <strong>{score}</strong>
        </div>
      </header>

      <main className="guess-flag-content">
        <div className="guess-flag-progress-info">
          <span>
            Zastava {questionIndex + 1} / {gameFlags.length}
          </span>

          <span>
            {correctAnswers} tačnih
          </span>
        </div>

        <div className="guess-flag-progress">
          <div
            style={{
              width: `${
                ((questionIndex + 1) /
                  gameFlags.length) *
                100
              }%`,
            }}
          />
        </div>

        <section className="guess-flag-card">
          <span className="guess-flag-question-label">
            KOJA JE OVO DRŽAVA?
          </span>

          <div className="guess-flag-image-wrapper">
            <img
              src={currentFlag.image}
              alt="Zastava države"
              className="guess-flag-image"
            />
          </div>

          <div className="guess-flag-answers">
            {answers.map((answer, index) => (
              <button
                type="button"
                key={answer}
                className={getAnswerClass(answer)}
                onClick={() => handleAnswer(answer)}
                disabled={Boolean(selectedAnswer)}
              >
                <span className="guess-flag-answer-letter">
                  {String.fromCharCode(65 + index)}
                </span>

                <span>{answer}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default GuessFlag