import { useEffect, useState } from 'react'
import { flags } from '../data/questions/flags'
import { playSound } from '../utils/sounds'
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
const [streak, setStreak] = useState(0)
const [earnedPoints, setEarnedPoints] = useState(0)
const QUESTION_TIME = 15
const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const currentFlag = gameFlags[questionIndex]
  const [answerResult, setAnswerResult] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

useEffect(() => {
  if (!currentFlag) return

  setAnswers(createAnswers(currentFlag))
  setSelectedAnswer(null)
  setAnswerResult(null)
  setTimeLeft(QUESTION_TIME)
  setEarnedPoints(0)
}, [currentFlag])

useEffect(() => {
  if (
    isFinished ||
    selectedAnswer ||
    !currentFlag
  ) {
    return
  }

  if (timeLeft <= 0) {
    handleTimeExpired()
    return
  }

  const timer = setTimeout(() => {
    setTimeLeft((currentTime) => currentTime - 1)
  }, 1000)

  return () => clearTimeout(timer)
}, [
  timeLeft,
  selectedAnswer,
  isFinished,
  currentFlag,
])

useEffect(() => {
  if (
    timeLeft > 0 &&
    timeLeft <= 3 &&
    !selectedAnswer &&
    !isFinished
  ) {
    playSound('tick', 0.45)
  }
}, [timeLeft, selectedAnswer, isFinished])

function handleTimeExpired() {
  if (selectedAnswer) return

  setSelectedAnswer('__time_expired__')

  setTimeout(() => {
    goToNextQuestion()
  }, 1200)
}

function handleTimeExpired() {
  if (selectedAnswer) return

  playSound('wrong', 0.65)

  setSelectedAnswer('__time_expired__')
  setAnswerResult('timeout')
  setStreak(0)
  setEarnedPoints(0)

  setTimeout(() => {
    goToNextQuestion()
  }, 1200)
}

function goToNextQuestion() {
  const isLastQuestion =
    questionIndex === gameFlags.length - 1

if (isLastQuestion) {
  playSound('finish', 0.7)
  setIsFinished(true)
  return
}

  setQuestionIndex(
    (currentQuestionIndex) =>
      currentQuestionIndex + 1,
  )
}

function handleAnswer(answer) {
  if (selectedAnswer) return

  setSelectedAnswer(answer)

  const isCorrect = answer === currentFlag.country

if (isCorrect) {
if (soundEnabled) {
  playSound('correct', 0.65)
}  setAnswerResult('correct')

  const newStreak = streak + 1
  const speedBonus = timeLeft * 20
  const streakBonus =
    newStreak >= 3 ? (newStreak - 2) * 100 : 0

  const points = 500 + speedBonus + streakBonus

  setStreak(newStreak)
  setEarnedPoints(points)

  setScore(
    (currentScore) => currentScore + points,
  )

  setCorrectAnswers(
    (currentCorrectAnswers) =>
      currentCorrectAnswers + 1,
  )
} else {
  if (soundEnabled) {
  playSound('wrong', 0.65)
}
  setAnswerResult('wrong')
  setStreak(0)
  setEarnedPoints(0)
}

  setTimeout(() => {
    goToNextQuestion()
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
  setTimeLeft(QUESTION_TIME)
  setStreak(0)
setEarnedPoints(0)
setAnswerResult(null)
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
          <button
  type="button"
  className="guess-flag-sound-button"
  onClick={() =>
    setSoundEnabled((currentValue) => !currentValue)
  }
>
  {soundEnabled ? '🔊' : '🔇'}
</button>
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

        <section
  className={`guess-flag-card ${
    answerResult ? `result-${answerResult}` : ''
  }`}
>
          <span className="guess-flag-question-label">
            KOJA JE OVO DRŽAVA?
          </span>

          <div
  className={`guess-flag-timer ${
    timeLeft <= 5 ? 'warning' : ''
  } ${timeLeft <= 3 ? 'danger' : ''}`}
  style={{
    '--timer-progress': `${
      (timeLeft / QUESTION_TIME) * 360
    }deg`,
  }}
>
  <div className="guess-flag-timer-inner">
    <strong>{timeLeft}</strong>
    <span>sek</span>
  </div>
</div>

{streak >= 2 && (
  <div className="guess-flag-streak">
    🔥 {streak}x STREAK
  </div>
)}
          <div className="guess-flag-image-wrapper">
{selectedAnswer &&
  selectedAnswer === currentFlag.country &&
  earnedPoints > 0 && (
    <div className="guess-flag-earned-points">
      +{earnedPoints}
    </div>
  )}

  {answerResult === 'wrong' && (
  <div className="guess-flag-result-message wrong">
    Netačno
  </div>
)}

{answerResult === 'timeout' && (
  <div className="guess-flag-result-message timeout">
    Vrijeme je isteklo
  </div>
)}

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