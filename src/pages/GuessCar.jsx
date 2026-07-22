import { useEffect, useState } from 'react'
import { cars } from '../data/questions/cars'
import { playSound } from '../utils/sounds'
import './GuessFlag.css'

const QUESTION_TIME = 15
const QUESTIONS_PER_GAME = 10

function shuffleArray(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function createAnswers(currentCar) {
  const wrongAnswers = shuffleArray(
    cars.filter(
      (car) => car.name !== currentCar.name,
    ),
  )
    .slice(0, 3)
    .map((car) => car.name)

  return shuffleArray([
    currentCar.name,
    ...wrongAnswers,
  ])
}

function GuessCar({ onBack }) {
  const [gameCars, setGameCars] = useState(() =>
    shuffleArray(cars).slice(
      0,
      QUESTIONS_PER_GAME,
    ),
  )

  const [questionIndex, setQuestionIndex] =
    useState(0)

  const [answers, setAnswers] = useState([])

  const [selectedAnswer, setSelectedAnswer] =
    useState(null)

  const [score, setScore] = useState(0)

  const [correctAnswers, setCorrectAnswers] =
    useState(0)

  const [isFinished, setIsFinished] =
    useState(false)

  const [streak, setStreak] = useState(0)

  const [earnedPoints, setEarnedPoints] =
    useState(0)

  const [timeLeft, setTimeLeft] =
    useState(QUESTION_TIME)

  const [answerResult, setAnswerResult] =
    useState(null)

  const [soundEnabled, setSoundEnabled] =
    useState(true)

  const currentCar = gameCars[questionIndex]

  useEffect(() => {
    if (!currentCar) return

    setAnswers(createAnswers(currentCar))
    setSelectedAnswer(null)
    setAnswerResult(null)
    setTimeLeft(QUESTION_TIME)
    setEarnedPoints(0)
  }, [currentCar])

  useEffect(() => {
    if (
      isFinished ||
      selectedAnswer ||
      !currentCar
    ) {
      return
    }

    if (timeLeft <= 0) {
      handleTimeExpired()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(
        (currentTime) => currentTime - 1,
      )
    }, 1000)

    return () => clearTimeout(timer)
  }, [
    timeLeft,
    selectedAnswer,
    isFinished,
    currentCar,
  ])

  useEffect(() => {
    if (
      timeLeft > 0 &&
      timeLeft <= 3 &&
      !selectedAnswer &&
      !isFinished &&
      soundEnabled
    ) {
      playSound('tick', 0.45)
    }
  }, [
    timeLeft,
    selectedAnswer,
    isFinished,
    soundEnabled,
  ])

  function getRank() {
    if (score >= 10000) {
      return {
        name: 'DIAMOND',
        icon: '💎',
        message:
          'Nevjerovatno! Pravi si automobilski stručnjak.',
      }
    }

    if (score >= 7500) {
      return {
        name: 'GOLD',
        icon: '🏆',
        message:
          'Odličan rezultat! Automobili su tvoj teren.',
      }
    }

    if (score >= 5000) {
      return {
        name: 'SILVER',
        icon: '🥈',
        message:
          'Vrlo dobro poznaješ automobile.',
      }
    }

    return {
      name: 'BRONZE',
      icon: '🥉',
      message:
        'Dobar početak. Probaj ponovo!',
    }
  }

  const finalRank = getRank()

  function handleTimeExpired() {
    if (selectedAnswer) return

    if (soundEnabled) {
      playSound('wrong', 0.65)
    }

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
      questionIndex === gameCars.length - 1

    if (isLastQuestion) {
      if (soundEnabled) {
        playSound('finish', 0.7)
      }

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

    const isCorrect =
      answer === currentCar.name

    if (isCorrect) {
      if (soundEnabled) {
        playSound('correct', 0.65)
      }

      setAnswerResult('correct')

      const newStreak = streak + 1
      const speedBonus = timeLeft * 20

      const streakBonus =
        newStreak >= 3
          ? (newStreak - 2) * 100
          : 0

      const points =
        500 + speedBonus + streakBonus

      setStreak(newStreak)
      setEarnedPoints(points)

      setScore(
        (currentScore) =>
          currentScore + points,
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

    if (answer === currentCar.name) {
      return 'guess-flag-answer correct'
    }

    if (answer === selectedAnswer) {
      return 'guess-flag-answer wrong'
    }

    return 'guess-flag-answer disabled'
  }

  function restartGame() {
    setGameCars(
      shuffleArray(cars).slice(
        0,
        QUESTIONS_PER_GAME,
      ),
    )

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
      (correctAnswers / gameCars.length) *
        100,
    )

    return (
      <div className="guess-flag-page">
        <div className="guess-flag-results">
          <div className="guess-flag-trophy">
            🏆
          </div>

          <span className="guess-flag-results-label">
            IGRA ZAVRŠENA
          </span>

          <h1>Odlična vožnja!</h1>

          <p>
            Prepoznao si {correctAnswers} od{' '}
            {gameCars.length} automobila.
          </p>

          <div className="guess-flag-results-grid">
            <div>
              <span>Rezultat</span>
              <strong>{score}</strong>
            </div>

            <div>
              <span>Tačni odgovori</span>

              <strong>
                {correctAnswers}/{gameCars.length}
              </strong>
            </div>

            <div>
              <span>Preciznost</span>
              <strong>{accuracy}%</strong>
            </div>
          </div>

          <div
            className={`guess-flag-rank rank-${finalRank.name.toLowerCase()}`}
          >
            <div className="guess-flag-rank-icon">
              {finalRank.icon}
            </div>

            <span>OSVOJENI RANG</span>

            <strong>{finalRank.name}</strong>

            <p>{finalRank.message}</p>
          </div>

          <div className="guess-flag-results-actions">
            <button
              type="button"
              onClick={restartGame}
            >
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

  if (!currentCar) {
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
          <h1>Pogodi automobil</h1>
        </div>

        <div className="guess-flag-score">
          <button
            type="button"
            className="guess-flag-sound-button"
            onClick={() =>
              setSoundEnabled(
                (currentValue) =>
                  !currentValue,
              )
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
            Automobil {questionIndex + 1} /{' '}
            {gameCars.length}
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
                  gameCars.length) *
                100
              }%`,
            }}
          />
        </div>

        <section
          className={`guess-flag-card ${
            answerResult
              ? `result-${answerResult}`
              : ''
          }`}
        >
          <span className="guess-flag-question-label">
            KOJI JE OVO AUTOMOBIL?
          </span>

          <div
            className={`guess-flag-timer ${
              timeLeft <= 5 ? 'warning' : ''
            } ${
              timeLeft <= 3 ? 'danger' : ''
            }`}
            style={{
              '--timer-progress': `${
                (timeLeft / QUESTION_TIME) *
                360
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
            {selectedAnswer ===
              currentCar.name &&
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
              src={currentCar.image}
              alt="Automobil za pogađanje"
              className="guess-flag-image"
            />
          </div>

          <div className="guess-flag-answers">
            {answers.map((answer, index) => (
              <button
                type="button"
                key={answer}
                className={getAnswerClass(
                  answer,
                )}
                onClick={() =>
                  handleAnswer(answer)
                }
                disabled={Boolean(
                  selectedAnswer,
                )}
              >
                <span className="guess-flag-answer-letter">
                  {String.fromCharCode(
                    65 + index,
                  )}
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

export default GuessCar