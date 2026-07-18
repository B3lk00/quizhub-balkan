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
  setCurrentQuestion(0)
  setFinalScore(0)
  window.scrollTo(0, 0)
}

function leaveRoom() {
  setCurrentPage('home')
  setRoomData(null)
  setPlayers([])
  setGameQuestions([])
  setCurrentQuestion(0)
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
        correctAnswers: 0,
        isCurrentPlayer: true,
        isHost: true,
      },
      {
        id: 2,
        name: 'Amar',
        score: 0,
        correctAnswers: 0,
        isCurrentPlayer: false,
        isHost: false,
      },
      {
        id: 3,
        name: 'Lejla',
        score: 0,
        correctAnswers: 0,
        isCurrentPlayer: false,
        isHost: false,
      },
      {
        id: 4,
        name: 'Adnan',
        score: 0,
        correctAnswers: 0,
        isCurrentPlayer: false,
        isHost: false,
      },
    ])

    setCurrentQuestion(0)
    setCurrentPage('lobby')
    window.scrollTo(0, 0)
  }

  function joinRoom({ playerName, roomCode }) {
  if (!roomData) {
    alert(
      'Trenutno nema kreirane sobe. Prvo kreiraj sobu pa kopiraj njen kod.',
    )
    return
  }

  if (roomCode !== roomData.code) {
    alert('Kod sobe nije ispravan.')
    return
  }

  const playerAlreadyExists = players.some(
    (player) =>
      player.name.toLowerCase() === playerName.toLowerCase(),
  )

  if (playerAlreadyExists) {
    alert('Igrač sa tim imenom je već u sobi.')
    return
  }

  const newPlayer = {
    id: Date.now(),
    name: playerName,
    score: 0,
    correctAnswers: 0,
    isCurrentPlayer: true,
    isHost: false,
  }

  setPlayers((currentPlayers) => [
    ...currentPlayers.map((player) => ({
      ...player,
      isCurrentPlayer: false,
    })),
    newPlayer,
  ])

  setRoomData((currentRoom) => ({
    ...currentRoom,
    players: [...currentRoom.players, playerName],
  }))

  setCurrentPage('lobby')
  window.scrollTo(0, 0)
}

  function shuffleQuestions(questionList) {
  return [...questionList].sort(() => Math.random() - 0.5)
}

function normalizeCategory(category) {
  const value = String(category || '')
    .toLowerCase()
    .trim()

  if (
    value.includes('sve') ||
    value.includes('random') ||
    value.includes('miješano') ||
    value.includes('mjesovito')
  ) {
    return 'sve'
  }

  if (value.includes('opć') || value.includes('opc')) {
    return 'opce'
  }

  if (value.includes('geograf')) {
    return 'geografija'
  }

  if (value.includes('sport')) {
    return 'sport'
  }

  if (
    value.includes('auto') ||
    value.includes('vozil')
  ) {
    return 'automobili'
  }

  if (
    value.includes('nauk') ||
    value.includes('znan')
  ) {
    return 'nauka'
  }

  return value
}

function createGameQuestions(category, questionCount) {
  const normalizedCategory = normalizeCategory(category)

  const availableQuestions =
    normalizedCategory === 'sve'
      ? allQuestions
      : allQuestions.filter(
          (question) =>
            question.category === normalizedCategory,
        )

  const requestedCount = Number(questionCount)

  return shuffleQuestions(availableQuestions).slice(
    0,
    requestedCount,
  )
}

function startQuiz() {
  const selectedQuestions = createGameQuestions(
    roomData.category,
    roomData.questionCount,
  )

  if (selectedQuestions.length === 0) {
    alert('Za ovu kategoriju trenutno nema dostupnih pitanja.')
    return
  }

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
    const isCorrect = points > 0

    return {
      ...player,
      score: player.score + points,
      correctAnswers:
        player.correctAnswers + (isCorrect ? 1 : 0),
    }
  }

  const botAnsweredCorrectly = Math.random() > 0.25

  const botPoints = botAnsweredCorrectly
    ? Math.floor(500 + Math.random() * 500)
    : 0

  return {
    ...player,
    score: player.score + botPoints,
    correctAnswers:
      player.correctAnswers +
      (botAnsweredCorrectly ? 1 : 0),
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
 const selectedQuestions = createGameQuestions(
  roomData.category,
  roomData.questionCount,
)

 setPlayers((currentPlayers) =>
  currentPlayers.map((player) => ({
    ...player,
    score: 0,
    correctAnswers: 0,
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
  const isCurrentPlayerHost = currentPlayer?.isHost === true

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
  <JoinRoomPage
    onBack={goHome}
    onJoin={joinRoom}
  />
)}

      {currentPage === 'lobby' && roomData && (
     <LobbyPage
  roomData={{
    ...roomData,
    players: players.map((player) => player.name),
    onStart: startQuiz,
    isHost: isCurrentPlayerHost,
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