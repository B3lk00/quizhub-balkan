import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { playSound } from '../utils/sounds'
import './GuessFlag.css'
import './MultiplayerGame.css'

const DEFAULT_QUESTION_TIME = 15
const RESULT_DELAY = 900

function MultiplayerGame({
  roomData,
  currentPlayerId,
  isHost,
  playerCount,
  onBack,
  items,
  modeTitle,
  questionLabel,
  itemTypeLabel,
}) {
  const questionTime =
    Number(roomData?.timeLimit) ||
    DEFAULT_QUESTION_TIME

  const [selectedAnswer, setSelectedAnswer] =
    useState(null)
  const [answerResult, setAnswerResult] =
    useState(null)
  const [earnedPoints, setEarnedPoints] =
    useState(0)
  const [timeLeft, setTimeLeft] =
    useState(questionTime)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] =
    useState(0)
  const [streak, setStreak] = useState(0)
  const [soundEnabled, setSoundEnabled] =
    useState(true)
  const [isFinished, setIsFinished] =
    useState(false)
  const [isSavingAnswer, setIsSavingAnswer] =
    useState(false)
  const [answeredPlayers, setAnsweredPlayers] =
    useState(0)
  const [timerReady, setTimerReady] =
    useState(false)

  const advanceStartedRef = useRef(false)
  const timeoutHandledRef = useRef(false)
  const advanceTimeoutRef = useRef(null)

  const questionOrder = Array.isArray(
    roomData?.questionOrder,
  )
    ? roomData.questionOrder
    : []

  const questionIndex = Number(
    roomData?.currentQuestion || 0,
  )

  const currentQuestion =
    questionOrder[questionIndex]

  const currentItem = useMemo(() => {
    if (!currentQuestion) {
      return null
    }

    return items.find(
      (item) =>
        item.name === currentQuestion.name,
    )
  }, [currentQuestion, items])

  const answers = Array.isArray(
    currentQuestion?.answers,
  )
    ? currentQuestion.answers
    : []

  useEffect(() => {
    async function loadPlayerScore() {
      if (!currentPlayerId) {
        return
      }

      const { data, error } = await supabase
        .from('players')
        .select('score, correct_answers')
        .eq('id', currentPlayerId)
        .maybeSingle()

      if (error) {
        console.error(
          'Greška pri učitavanju rezultata:',
          error,
        )
        return
      }

      if (data) {
        setScore(Number(data.score || 0))
        setCorrectAnswers(
          Number(data.correct_answers || 0),
        )
      }
    }

    loadPlayerScore()
  }, [currentPlayerId])

  useEffect(() => {
    setSelectedAnswer(null)
    setAnswerResult(null)
    setEarnedPoints(0)
    setAnsweredPlayers(0)
    setTimerReady(false)
    setTimeLeft(questionTime)

    advanceStartedRef.current = false
    timeoutHandledRef.current = false

    if (advanceTimeoutRef.current) {
      window.clearTimeout(
        advanceTimeoutRef.current,
      )
      advanceTimeoutRef.current = null
    }
  }, [
    questionIndex,
    roomData?.questionStartedAt,
    questionTime,
  ])

  useEffect(() => {
    if (
      !roomData?.questionStartedAt ||
      isFinished ||
      !currentQuestion
    ) {
      return
    }

    function updateTimer() {
      const startedAt = new Date(
        roomData.questionStartedAt,
      ).getTime()

      if (Number.isNaN(startedAt)) {
        setTimeLeft(questionTime)
        setTimerReady(true)
        return
      }

      const elapsedSeconds = Math.floor(
        Math.max(0, Date.now() - startedAt) /
          1000,
      )

      const remaining = Math.max(
        0,
        questionTime - elapsedSeconds,
      )

      setTimeLeft(remaining)
      setTimerReady(true)
    }

    updateTimer()

    const timer = window.setInterval(
      updateTimer,
      250,
    )

    return () => {
      window.clearInterval(timer)
    }
  }, [
    roomData?.questionStartedAt,
    questionIndex,
    currentQuestion,
    isFinished,
    questionTime,
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

  useEffect(() => {
    if (
      !timerReady ||
      timeLeft !== 0 ||
      timeoutHandledRef.current ||
      isFinished ||
      !currentQuestion
    ) {
      return
    }

    timeoutHandledRef.current = true

    if (!selectedAnswer) {
      setSelectedAnswer(
        '__time_expired__',
      )
      setAnswerResult('timeout')
      setEarnedPoints(0)
      setStreak(0)

      if (soundEnabled) {
        playSound('wrong', 0.65)
      }

      saveAnswer(
        '__time_expired__',
        false,
        0,
      )
    }

    if (isHost) {
      moveToNextQuestion(900)
    }
  }, [
    timerReady,
    timeLeft,
    selectedAnswer,
    isFinished,
    currentQuestion,
    isHost,
    soundEnabled,
  ])

  useEffect(() => {
    const gameFinished =
      roomData?.gameStatus === 'finished' ||
      roomData?.status === 'finished'

    if (!gameFinished || isFinished) {
      return
    }

    setIsFinished(true)

    if (soundEnabled) {
      playSound('finish', 0.7)
    }

    markPlayerFinished()
  }, [
    roomData?.gameStatus,
    roomData?.status,
    isFinished,
    soundEnabled,
  ])

  useEffect(() => {
    if (!roomData?.id) {
      return
    }

    let isCancelled = false

    async function checkAnsweredPlayers() {
      const {
        count: activePlayerCount,
        error: playersError,
      } = await supabase
        .from('players')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('room_id', roomData.id)
        .eq('kicked', false)

      if (
        playersError ||
        isCancelled
      ) {
        if (playersError) {
          console.error(
            'Greška pri brojanju igrača:',
            playersError,
          )
        }
        return
      }

      const { count, error } =
        await supabase
          .from('game_answers')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('room_id', roomData.id)
          .eq(
            'question_index',
            questionIndex,
          )

      if (error || isCancelled) {
        if (error) {
          console.error(
            'Greška pri brojanju odgovora:',
            error,
          )
        }
        return
      }

      const answeredCount =
        Number(count || 0)

      const activeCount = Number(
        activePlayerCount ||
          playerCount ||
          1,
      )

      setAnsweredPlayers(answeredCount)

      if (
        isHost &&
        activeCount > 0 &&
        answeredCount >= activeCount
      ) {
        moveToNextQuestion(900)
      }
    }

    checkAnsweredPlayers()

    const poll = window.setInterval(
      checkAnsweredPlayers,
      500,
    )

    return () => {
      isCancelled = true
      window.clearInterval(poll)
    }
  }, [
    roomData?.id,
    questionIndex,
    isHost,
    playerCount,
  ])

  async function markPlayerFinished() {
    if (!currentPlayerId) {
      return
    }

    const { error } = await supabase
      .from('players')
      .update({
        finished: true,
        finished_at:
          new Date().toISOString(),
      })
      .eq('id', currentPlayerId)

    if (error) {
      console.error(
        'Greška pri završavanju igre:',
        error,
      )
    }
  }

  async function saveAnswer(
    answer,
    isCorrect,
    points,
  ) {
    if (
      !roomData?.id ||
      !currentPlayerId ||
      isSavingAnswer
    ) {
      return
    }

    setIsSavingAnswer(true)

    const { error: answerError } =
      await supabase
        .from('game_answers')
        .upsert(
          {
            room_id: roomData.id,
            player_id: currentPlayerId,
            question_index:
              questionIndex,
            answer,
            is_correct: isCorrect,
            points,
            answered_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              'room_id,player_id,question_index',
          },
        )

    if (answerError) {
      console.error(
        'Greška pri čuvanju odgovora:',
        answerError,
      )
      setIsSavingAnswer(false)
      return
    }

    const {
      data: playerData,
      error: playerReadError,
    } = await supabase
      .from('players')
      .select(
        'score, correct_answers',
      )
      .eq('id', currentPlayerId)
      .single()

    if (playerReadError) {
      console.error(
        'Greška pri čitanju igrača:',
        playerReadError,
      )
      setIsSavingAnswer(false)
      return
    }

    const newScore =
      Number(playerData.score || 0) +
      Number(points || 0)

    const newCorrectAnswers =
      Number(
        playerData.correct_answers || 0,
      ) + (isCorrect ? 1 : 0)

    const { error: playerUpdateError } =
      await supabase
        .from('players')
        .update({
          score: newScore,
          correct_answers:
            newCorrectAnswers,
        })
        .eq('id', currentPlayerId)

    if (playerUpdateError) {
      console.error(
        'Greška pri spremanju bodova:',
        playerUpdateError,
      )
      setIsSavingAnswer(false)
      return
    }

    setScore(newScore)
    setCorrectAnswers(
      newCorrectAnswers,
    )
    setIsSavingAnswer(false)

    if (
      isHost &&
      Number(playerCount || 1) === 1
    ) {
      moveToNextQuestion(900)
    }
  }

  async function handleAnswer(answer) {
    if (
      selectedAnswer ||
      timeLeft <= 0 ||
      isSavingAnswer ||
      !currentItem
    ) {
      return
    }

    setSelectedAnswer(answer)

    const isCorrect =
      answer === currentItem.name

    if (isCorrect) {
      const newStreak = streak + 1
      const speedBonus =
        timeLeft * 20

      const streakBonus =
        newStreak >= 3
          ? (newStreak - 2) * 100
          : 0

      const points =
        500 +
        speedBonus +
        streakBonus

      setAnswerResult('correct')
      setStreak(newStreak)
      setEarnedPoints(points)

      if (soundEnabled) {
        playSound('correct', 0.65)
      }

      await saveAnswer(
        answer,
        true,
        points,
      )
      return
    }

    setAnswerResult('wrong')
    setStreak(0)
    setEarnedPoints(0)

    if (soundEnabled) {
      playSound('wrong', 0.65)
    }

    await saveAnswer(
      answer,
      false,
      0,
    )
  }

  async function moveToNextQuestion(
    delay = RESULT_DELAY,
  ) {
    if (
      !isHost ||
      advanceStartedRef.current ||
      !roomData?.id
    ) {
      return
    }

    advanceStartedRef.current = true

    advanceTimeoutRef.current =
      window.setTimeout(async () => {
        const isLastQuestion =
          questionIndex >=
          questionOrder.length - 1

        if (isLastQuestion) {
          const { error } =
            await supabase
              .from('rooms')
              .update({
                status: 'finished',
                game_status:
                  'finished',
              })
              .eq('id', roomData.id)

          if (error) {
            console.error(
              'Greška pri završavanju igre:',
              error,
            )
          }

          return
        }

        const nextQuestionIndex =
          questionIndex + 1

        const nextStartedAt =
          new Date().toISOString()

        const { error } =
          await supabase
            .from('rooms')
            .update({
              current_question:
                nextQuestionIndex,
              question_started_at:
                nextStartedAt,
            })
            .eq('id', roomData.id)
            .eq(
              'current_question',
              questionIndex,
            )

        if (error) {
          console.error(
            'Greška pri prelasku na sljedeće pitanje:',
            error,
          )
        }
      }, delay)
  }

  function getAnswerClass(answer) {
    if (!selectedAnswer) {
      return 'guess-flag-answer'
    }

    if (
      answer === currentItem?.name
    ) {
      return 'guess-flag-answer correct'
    }

    if (answer === selectedAnswer) {
      return 'guess-flag-answer wrong'
    }

    return 'guess-flag-answer disabled'
  }

  if (isFinished) {
    const accuracy =
      questionOrder.length > 0
        ? Math.round(
            (correctAnswers /
              questionOrder.length) *
              100,
          )
        : 0

    return (
      <div className="guess-flag-page">
        <div className="guess-flag-results">
          <div className="guess-flag-trophy">
            🏆
          </div>

          <span className="guess-flag-results-label">
            MULTIPLAYER ZAVRŠEN
          </span>

          <h1>Partija je završena!</h1>

          <p>
            Pogodio si {correctAnswers} od{' '}
            {questionOrder.length}{' '}
            {itemTypeLabel}.
          </p>

          <div className="guess-flag-results-grid">
            <div>
              <span>Rezultat</span>
              <strong>{score}</strong>
            </div>

            <div>
              <span>Tačni odgovori</span>
              <strong>
                {correctAnswers}/
                {questionOrder.length}
              </strong>
            </div>

            <div>
              <span>Preciznost</span>
              <strong>
                {accuracy}%
              </strong>
            </div>
          </div>

          <div className="guess-flag-results-actions">
            <button
              type="button"
              onClick={onBack}
            >
              Napusti sobu
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (
    !currentItem ||
    answers.length === 0
  ) {
    return (
      <div className="guess-flag-page">
        <div className="guess-flag-results">
          <h1>Učitavanje igre...</h1>

          <p>
            Čekamo pitanja od domaćina.
          </p>

          <button
            type="button"
            onClick={onBack}
          >
            Napusti sobu
          </button>
        </div>
      </div>
    )
  }

  const timerState =
    timeLeft <= 5
      ? 'danger'
      : timeLeft <= 10
        ? 'warning'
        : ''

  return (
    <div className="guess-flag-page">
      <header className="guess-flag-header">
        <button
          type="button"
          className="guess-flag-back"
          onClick={onBack}
        >
          ← Napusti
        </button>

        <div className="guess-flag-header-title">
          <span>MULTIPLAYER</span>
          <h1>{modeTitle}</h1>
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
        <div className="mp-question-heading">
          <div>
            <span className="mp-question-eyebrow">
              QUIZHUB BALKAN
            </span>

            <h1>
              Pitanje {questionIndex + 1}/
              {questionOrder.length}
            </h1>
          </div>

          <div
            className={`mp-question-time ${timerState}`}
          >
            <span>VRIJEME</span>
            <strong>{timeLeft}s</strong>
          </div>
        </div>

        <div className="mp-question-time-track">
          <div
            className={`mp-question-time-fill ${timerState}`}
            style={{
              width: `${
                (timeLeft /
                  questionTime) *
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
            {questionLabel}
          </span>

          {streak >= 2 && (
            <div className="guess-flag-streak">
              🔥 {streak}x STREAK
            </div>
          )}

          <div className="guess-flag-image-wrapper">
            {answerResult ===
              'correct' &&
              earnedPoints > 0 && (
                <div className="guess-flag-earned-points">
                  +{earnedPoints}
                </div>
              )}

            {answerResult ===
              'wrong' && (
                <div className="guess-flag-result-message wrong">
                  Netačno
                </div>
              )}

            {answerResult ===
              'timeout' && (
                <div className="guess-flag-result-message timeout">
                  Vrijeme je isteklo
                </div>
              )}

            <img
              src={currentItem.image}
              alt={`${itemTypeLabel} ${currentItem.name}`}
              className="guess-flag-image"
            />
          </div>

          <div className="guess-flag-answers">
            {answers.map(
              (answer, index) => (
                <button
                  type="button"
                  key={answer}
                  className={getAnswerClass(
                    answer,
                  )}
                  onClick={() =>
                    handleAnswer(answer)
                  }
                  disabled={
                    Boolean(
                      selectedAnswer,
                    ) ||
                    timeLeft <= 0 ||
                    isSavingAnswer
                  }
                >
                  <span className="guess-flag-answer-letter">
                    {String.fromCharCode(
                      65 + index,
                    )}
                  </span>

                  <span>{answer}</span>
                </button>
              ),
            )}
          </div>

          {selectedAnswer &&
            timeLeft > 0 && (
              <p className="mp-answer-waiting">
                Odgovor je zaključan.
                {playerCount > 1
                  ? ` Odgovorilo ${answeredPlayers}/${playerCount} igrača.`
                  : ' Prelazimo na sljedeće pitanje...'}
              </p>
            )}
        </section>
      </main>
    </div>
  )
}

export default MultiplayerGame