import { useEffect, useState } from 'react'
import {
  playCorrectSound,
  playTickSound,
  playWrongSound,
} from '../utils/sounds'

export const allQuestions = [
  {
    id: 'opce-1',
    category: 'opce',
    question: 'Koliko kontinenata postoji?',
    answers: ['5', '6', '7', '8'],
    correctAnswer: 2,
  },
  {
    id: 'opce-2',
    category: 'opce',
    question: 'Koliko dana ima prijestupna godina?',
    answers: ['364', '365', '366', '367'],
    correctAnswer: 2,
  },
  {
    id: 'opce-3',
    category: 'opce',
    question: 'Koji je najveći sisar na svijetu?',
    answers: ['Slon', 'Plavi kit', 'Žirafa', 'Nosorog'],
    correctAnswer: 1,
  },

  {
    id:'geografija-1',
    category: 'geografija',
    question: 'Koji je glavni grad Bosne i Hercegovine?',
    answers: ['Mostar', 'Sarajevo', 'Tuzla', 'Zenica'],
    correctAnswer: 1,
  },
  {
    id:'geografija-2',
    category: 'geografija',
    question: 'Koja je najveća država na svijetu?',
    answers: ['Kanada', 'Kina', 'Rusija', 'SAD'],
    correctAnswer: 2,
  },
  {
    id:'geografija-3',
    category: 'geografija',
    question: 'Koja rijeka protiče kroz London?',
    answers: ['Dunav', 'Temza', 'Sena', 'Rajna'],
    correctAnswer: 1,
  },

  {
    id:'sport-1',
    category: 'sport',
    question: 'Koliko igrača jedan fudbalski tim ima na terenu?',
    answers: ['9', '10', '11', '12'],
    correctAnswer: 2,
  },
  {
    id:'sport-2',
    category: 'sport',
    question: 'Koliko traje regularna fudbalska utakmica?',
    answers: ['60 minuta', '80 minuta', '90 minuta', '100 minuta'],
    correctAnswer: 2,
  },
  {
    id:'sport-3',
    category: 'sport',
    question: 'U kojem sportu se koristi reket i loptica preko mreže?',
    answers: ['Golf', 'Tenis', 'Rukomet', 'Vaterpolo'],
    correctAnswer: 1,
  },

  {
    id:'automobili-1',
    category: 'automobili',
    question: 'Koja marka proizvodi model A5?',
    answers: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
    correctAnswer: 2,
  },
  {
    id:'automobili-2',
    category: 'automobili',
    question: 'Šta znači oznaka TDI?',
    answers: [
      'Benzinski motor',
      'Dizelski motor s direktnim ubrizgavanjem',
      'Električni motor',
      'Hibridni pogon',
    ],
    correctAnswer: 1,
  },
  {
    id:'automobili-3',
    category: 'automobili',
    question: 'Koji dio automobila puni akumulator tokom vožnje?',
    answers: ['Starter', 'Alternator', 'Hladnjak', 'Turbina'],
    correctAnswer: 1,
  },

  {
    id:'nauka-1',
    category: 'nauka',
    question: 'Koja planeta je najbliža Suncu?',
    answers: ['Venera', 'Mars', 'Merkur', 'Jupiter'],
    correctAnswer: 2,
  },
  {
    id:'nauka-2',
    category: 'nauka',
    question: 'Koja je hemijska oznaka za vodu?',
    answers: ['CO2', 'H2O', 'O2', 'NaCl'],
    correctAnswer: 1,
  },
  {
    id:'nauka-3',
    category: 'nauka',
    question: 'Koji organ pumpa krv kroz ljudsko tijelo?',
    answers: ['Pluća', 'Jetra', 'Srce', 'Bubrezi'],
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
  const [answerSubmitted, setAnswerSubmitted] = useState(false)

  const question = questions[currentQuestion]

  useEffect(() => {
    setSelectedAnswer(null)
    setTimeLeft(totalTime)
    setIsAnswered(false)
    setAwardedPoints(0)
    setAnswerSubmitted(false)
  }, [currentQuestion, totalTime])

  useEffect(() => {
  if (
    !isAnswered &&
    timeLeft > 0 &&
    timeLeft <= 3
  ) {
    playTickSound()
  }
}, [timeLeft, isAnswered])

  useEffect(() => {
    if (isAnswered) {
      return
    }

if (timeLeft <= 0) {
  setIsAnswered(true)
  setAwardedPoints(0)
  playWrongSound()
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
    const speedBonus = Math.round(
      (timeLeft / totalTime) * 500,
    )

    const points = 500 + speedBonus

    setAwardedPoints(points)
    playCorrectSound()
  } else {
    setAwardedPoints(0)
    playWrongSound()
  }
}

async function showLeaderboard() {
  if (answerSubmitted) {
    return
  }

  setAnswerSubmitted(true)

  await onAnswerComplete(awardedPoints)
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
  disabled={answerSubmitted}
>
  {answerSubmitted
    ? 'Učitavanje...'
    : currentQuestion === questions.length - 1
      ? 'Završi kviz'
      : 'Sljedeće pitanje'}

  {!answerSubmitted && <span>→</span>}
</button>
        </div>
      )}
    </section>
  )
}


export default QuizPage