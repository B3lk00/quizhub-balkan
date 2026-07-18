import { useState } from 'react'

const questions = [
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
]

function QuizPage({ onFinish }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)

  const question = questions[currentQuestion]

  function handleAnswer(answerIndex) {
    if (selectedAnswer !== null) {
      return
    }

    setSelectedAnswer(answerIndex)

    if (answerIndex === question.correctAnswer) {
      setScore((currentScore) => currentScore + 1000)
    }
  }

  function handleNextQuestion() {
    const isLastQuestion = currentQuestion === questions.length - 1

    if (isLastQuestion) {
      onFinish(score + (selectedAnswer === question.correctAnswer ? 1000 : 0))
      return
    }

    setCurrentQuestion((questionIndex) => questionIndex + 1)
    setSelectedAnswer(null)
  }

  function getAnswerClass(answerIndex) {
    if (selectedAnswer === null) {
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

  return (
    <section className="quiz-page">
      <div className="quiz-topbar">
        <div>
          <span className="eyebrow">QuizHub Balkan</span>
          <h1>
            Pitanje {currentQuestion + 1}/{questions.length}
          </h1>
        </div>

        <div className="quiz-score">
          <span>Bodovi</span>
          <strong>{score}</strong>
        </div>
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
        <span className="question-label">Pitanje</span>

        <h2>{question.question}</h2>
      </div>

      <div className="answers-grid">
        {question.answers.map((answer, index) => (
          <button
            className={`answer-button answer-${index} ${getAnswerClass(index)}`}
            key={answer}
            onClick={() => handleAnswer(index)}
          >
            <span className="answer-letter">
              {String.fromCharCode(65 + index)}
            </span>

            <strong>{answer}</strong>
          </button>
        ))}
      </div>

      {selectedAnswer !== null && (
        <div className="answer-result">
          <div>
            <span className="eyebrow">
              {selectedAnswer === question.correctAnswer
                ? 'Tačan odgovor'
                : 'Netačan odgovor'}
            </span>

            <h3>
              {selectedAnswer === question.correctAnswer
                ? 'Odlično! Osvojio si 1000 bodova.'
                : `Tačan odgovor je: ${
                    question.answers[question.correctAnswer]
                  }`}
            </h3>
          </div>

          <button className="next-question-button" onClick={handleNextQuestion}>
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