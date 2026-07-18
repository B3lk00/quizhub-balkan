import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinRoomPage from './pages/JoinRoomPage'
import LobbyPage from './pages/LobbyPage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [roomData, setRoomData] = useState(null)
  const [finalScore, setFinalScore] = useState(0)

  function goHome() {
    setCurrentPage('home')
    setRoomData(null)
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

    setCurrentPage('lobby')
    window.scrollTo(0, 0)
  }

  function startQuiz() {
    setCurrentPage('quiz')
    window.scrollTo(0, 0)
  }

  function finishQuiz(score) {
    setFinalScore(score)
    setCurrentPage('results')
    window.scrollTo(0, 0)
  }

  function restartQuiz() {
    setFinalScore(0)
    setCurrentPage('quiz')
    window.scrollTo(0, 0)
  }

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
            onStart: startQuiz,
          }}
          onBack={goHome}
        />
      )}

      {currentPage === 'quiz' && roomData && (
  <QuizPage
    onFinish={finishQuiz}
    timeLimit={roomData.timeLimit}
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