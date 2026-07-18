import { useEffect, useState } from 'react'

export const allQuestions = [
  {
    question: 'Koji je glavni grad Bosne i Hercegovine?',
    answers: ['Mostar', 'Sarajevo', 'Tuzla', 'Zenica'],
    correctAnswer: 1,
  },
  {
    question: 'Koja marka proizvodi model A5?',
    answers: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
    correctAnswer: 2,
  },
  {
    question: 'Koliko kontinenata postoji?',
    answers: ['5', '6', '7', '8'],
    correctAnswer: 2,
  },
  {
    question: 'Koja planeta je najbliža Suncu?',
    answers: ['Venera', 'Mars', 'Merkur', 'Jupiter'],
    correctAnswer: 2,
  },
  {
    question: 'Koliko igrača jedan fudbalski tim ima na terenu?',
    answers: ['9', '10', '11', '12'],
    correctAnswer: 2,
  },
]

function QuizPage({
  questions,
  currentQuestion,
  score,
  timeLimit = 20,
  onAnswerComplete,
}) {
  const totalTime = Number(timeLimit)

  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(totalTime)
  const [isAnswered, setIsAnswered] = useState(false)
  const [awardedPoints, setAwardedPoints] = useState(0)

  const question = questions[currentQuestion]

  useEffect(() => {
    setSelectedAnswer(null)
    setTimeLeft(totalTime)
    setIsAnswered(false)
    setAwardedPoints(0)
  }, [currentQuestion, totalTime])

  useEffect(() => {
    if (isAnswered) {
      return
    }

    if (timeLeft <= 0) {
      setIsAnswered(true)
      setAwardedPoints(0)
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft((currentTime) => currentTime - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isAnswered])

  function handleAnswer(answerIndex) {
    if (isAnswered) {
      return
    }

    setSelectedAnswer(answerIndex)
    setIsAnswered(true)

    if (answerIndex === question.correctAnswer) {
      const speedBonus = Math.round((timeLeft / totalTime) * 500)
      const points = 500 + speedBonus

      setAwardedPoints(points)
    } else {
      setAwardedPoints(0)
    }
  }

  function showLeaderboard() {
    onAnswerComplete(awardedPoints)
  }

  function getAnswerClass(answerIndex) {
    if (!isAnswered) {
      return ''
    }

    if (answerIndex === question.correctAnswer) {
      return 'correct-answer'
    }

    if (answerIndex === selectedAnswer) {
      return 'wrong-answer'
    }

    return 'disabled-answer'
  }

  function getTimerClass() {
    if (timeLeft <= 5) {
      return 'timer-danger'
    }

    if (timeLeft <= 10) {
      return 'timer-warning'
    }

    return ''
  }

  const timerProgress = (timeLeft / totalTime) * 100

  return (
    <section className="quiz-page">
      <div className="quiz-topbar">
        <div>
          <span className="eyebrow">QuizHub Balkan</span>

          <h1>
            Pitanje {currentQuestion + 1}/{questions.length}
          </h1>
        </div>

        <div className="quiz-status">
          <div className={`quiz-timer ${getTimerClass()}`}>
            <span>Vrijeme</span>
            <strong>{timeLeft}s</strong>
          </div>

          <div className="quiz-score">
            <span>Bodovi</span>
            <strong>{score}</strong>
          </div>
        </div>
      </div>

      <div className="timer-progress">
        <div
          className={`timer-progress-fill ${getTimerClass()}`}
          style={{ width: `${timerProgress}%` }}
        ></div>
      </div>

      <div className="quiz-progress">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        ></div>
      </div>

      <div className="question-card">
        <span className="question-label">
          {isAnswered ? 'Odgovor zaključan' : 'Odaberi odgovor'}
        </span>

        <h2>{question.question}</h2>
      </div>

      <div className="answers-grid">
        {question.answers.map((answer, index) => (
          <button
            className={`answer-button answer-${index} ${getAnswerClass(index)}`}
            key={answer}
            onClick={() => handleAnswer(index)}
            disabled={isAnswered}
          >
            <span className="answer-letter">
              {String.fromCharCode(65 + index)}
            </span>

            <strong>{answer}</strong>
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className="answer-result">
          <div>
            <span className="eyebrow">
              {selectedAnswer === null
                ? 'Vrijeme je isteklo'
                : selectedAnswer === question.correctAnswer
                  ? 'Tačan odgovor'
                  : 'Netačan odgovor'}
            </span>

            <h3>
              {selectedAnswer === null
                ? `Tačan odgovor je: ${
                    question.answers[question.correctAnswer]
                  }`
                : selectedAnswer === question.correctAnswer
                  ? `Odlično! Osvojio si ${awardedPoints} bodova.`
                  : `Tačan odgovor je: ${
                      question.answers[question.correctAnswer]
                    }`}
            </h3>
          </div>

         <button
  className="next-question-button"
  onClick={showLeaderboard}
>
  {currentQuestion === questions.length - 1
    ? 'Završi kviz'
    : 'Sljedeće pitanje'}

  <span>→</span>
</button>
        </div>
      )}
    </section>
  )
}


export default QuizPage