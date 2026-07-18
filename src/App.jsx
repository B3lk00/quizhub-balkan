import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinRoomPage from './pages/JoinRoomPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  function goHome() {
    setCurrentPage('home')
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
        <CreateRoomPage onBack={goHome} />
      )}

      {currentPage === 'join' && (
        <JoinRoomPage onBack={goHome} />
      )}
    </main>
  )
}

export default App