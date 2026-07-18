import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinRoomPage from './pages/JoinRoomPage'
import LobbyPage from './pages/LobbyPage'
import QuizPage, { allQuestions } from './pages/QuizPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ResultsPage from './pages/ResultsPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [roomData, setRoomData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [players, setPlayers] = useState([])
  const [finalScore, setFinalScore] = useState(0)
  const [gameQuestions, setGameQuestions] = useState([])

  function goHome() {
    setCurrentPage('home')
    setRoomData(null)
    setCurrentQuestion(0)
    setPlayers([])
    setFinalScore(0)
    window.scrollTo(0, 0)
  }

  function openCreateRoom() {
    setCurrentPage('create')
    window.scrollTo(0, 0)
  }

  function openJoinRoom() {
    setCurrentPage('join')
    window.scrollTo(0, 0)
  }

  function createRoom(settings) {
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString()

    setRoomData({
      code: roomCode,
      category: settings.category,
      questionCount: settings.questionCount,
      timeLimit: settings.timeLimit,
      players: [settings.hostName],
    })

    setPlayers([
      {
        id: 1,
        name: settings.hostName,
        score: 0,
        isCurrentPlayer: true,
      },
      {
        id: 2,
        name: 'Amar',
        score: 0,
        isCurrentPlayer: false,
      },
      {
        id: 3,
        name: 'Lejla',
        score: 0,
        isCurrentPlayer: false,
      },
      {
        id: 4,
        name: 'Adnan',
        score: 0,
        isCurrentPlayer: false,
      },
    ])

    setCurrentQuestion(0)
    setCurrentPage('lobby')
    window.scrollTo(0, 0)
  }

  function shuffleQuestions(questionList) {
  return [...questionList].sort(() => Math.random() - 0.5)
}

 function startQuiz() {
  const requestedQuestionCount = Number(roomData.questionCount)

  const selectedQuestions = shuffleQuestions(allQuestions).slice(
    0,
    requestedQuestionCount,
  )

  setGameQuestions(selectedQuestions)
  setCurrentQuestion(0)
  setCurrentPage('quiz')
  window.scrollTo(0, 0)
}

function completeAnswer(points) {
  const isLastQuestion =
  currentQuestion === gameQuestions.length - 1

  const updatedPlayers = players.map((player) => {
    if (player.isCurrentPlayer) {
      return {
        ...player,
        score: player.score + points,
      }
    }

    const botPoints =
      Math.random() > 0.25
        ? Math.floor(500 + Math.random() * 500)
        : 0

    return {
      ...player,
      score: player.score + botPoints,
    }
  })

  setPlayers(updatedPlayers)

  if (isLastQuestion) {
    const currentPlayer = updatedPlayers.find(
      (player) => player.isCurrentPlayer,
    )

    setFinalScore(currentPlayer?.score || 0)
    setCurrentPage('leaderboard')
  } else {
    setCurrentQuestion(
      (questionIndex) => questionIndex + 1,
    )

    setCurrentPage('quiz')
  }

  window.scrollTo(0, 0)
}

  function restartQuiz() {
  const requestedQuestionCount = Number(roomData.questionCount)

  const selectedQuestions = shuffleQuestions(allQuestions).slice(
    0,
    requestedQuestionCount,
  )

  setPlayers((currentPlayers) =>
    currentPlayers.map((player) => ({
      ...player,
      score: 0,
    })),
  )

  setGameQuestions(selectedQuestions)
  setCurrentQuestion(0)
  setFinalScore(0)
  setCurrentPage('quiz')
  window.scrollTo(0, 0)
}

  const currentPlayer = players.find(
    (player) => player.isCurrentPlayer,
  )

  return (
    <main className="app">
      <div className="background-orb orb-one"></div>
      <div className="background-orb orb-two"></div>
      <div className="background-grid"></div>

      <nav className="navbar">
        <button className="logo logo-button" onClick={goHome}>
          QUIZ<span>HUB</span>
        </button>

        {currentPage === 'home' && (
          <div className="nav-links">
            <a href="#features">Mogućnosti</a>
            <button onClick={openJoinRoom}>Pridruži se</button>
          </div>
        )}
      </nav>

      {currentPage === 'home' && (
        <HomePage
          onCreateRoom={openCreateRoom}
          onJoinRoom={openJoinRoom}
        />
      )}

      {currentPage === 'create' && (
        <CreateRoomPage
          onBack={goHome}
          onCreate={createRoom}
        />
      )}

      {currentPage === 'join' && (
        <JoinRoomPage onBack={goHome} />
      )}

      {currentPage === 'lobby' && roomData && (
        <LobbyPage
          roomData={{
            ...roomData,
            players: players.map((player) => player.name),
            onStart: startQuiz,
          }}
          onBack={goHome}
        />
      )}

      {currentPage === 'quiz' && roomData && gameQuestions.length > 0 && (
  <QuizPage
    questions={gameQuestions}
    currentQuestion={currentQuestion}
    score={currentPlayer?.score || 0}
    timeLimit={roomData.timeLimit}
    onAnswerComplete={completeAnswer}
  />
)}

{currentPage === 'leaderboard' && (
  <LeaderboardPage
    players={players}
    currentQuestion={currentQuestion}
    totalQuestions={gameQuestions.length}
    onNext={restartQuiz}
    onHome={goHome}
    isLastQuestion={true}
  />
)}

      {currentPage === 'results' && (
        <ResultsPage
          score={finalScore}
          onRestart={restartQuiz}
          onHome={goHome}
        />
      )}
    </main>
  )
}

export default App