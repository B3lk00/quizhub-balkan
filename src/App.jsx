import { useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
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

  async function createRoom(settings) {
  const roomCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString()

  const { data: createdRoom, error: roomError } =
    await supabase
      .from('rooms')
      .insert({
        code: roomCode,
        category: settings.category,
        question_count: Number(settings.questionCount),
        time_limit: Number(settings.timeLimit),
        status: 'lobby',
        current_question: 0,
      })
      .select()
      .single()

  if (roomError) {
    console.error('Greška pri kreiranju sobe:', roomError)
    alert('Nije moguće kreirati sobu. Pokušaj ponovo.')
    return
  }

  const { data: createdHost, error: playerError } =
    await supabase
      .from('players')
      .insert({
        room_id: createdRoom.id,
        name: settings.hostName,
        score: 0,
        correct_answers: 0,
        is_host: true,
      })
      .select()
      .single()

  if (playerError) {
    console.error(
      'Greška pri dodavanju domaćina:',
      playerError,
    )

    await supabase
      .from('rooms')
      .delete()
      .eq('id', createdRoom.id)

    alert('Soba je kreirana, ali domaćin nije dodat.')
    return
  }

  setRoomData({
    id: createdRoom.id,
    code: createdRoom.code,
    category: createdRoom.category,
    questionCount: createdRoom.question_count,
    timeLimit: createdRoom.time_limit,
    status: createdRoom.status,
  })

  setPlayers([
    {
      id: createdHost.id,
      name: createdHost.name,
      score: createdHost.score,
      correctAnswers: createdHost.correct_answers,
      isCurrentPlayer: true,
      isHost: createdHost.is_host,
    },
  ])

  setCurrentQuestion(0)
  setCurrentPage('lobby')
  window.scrollTo(0, 0)
}
async function joinRoom({ playerName, roomCode }) {
  const cleanName = playerName.trim()
  const cleanCode = roomCode.trim()

  const { data: foundRoom, error: roomError } =
    await supabase
      .from('rooms')
      .select('*')
      .eq('code', cleanCode)
      .single()

  if (roomError || !foundRoom) {
    console.error('Greška pri pronalasku sobe:', roomError)

    alert('Soba sa tim kodom ne postoji.')
    return
  }

  if (foundRoom.status !== 'lobby') {
    alert('Ova partija je već počela ili je završena.')
    return
  }

  const { data: existingPlayer } = await supabase
    .from('players')
    .select('id')
    .eq('room_id', foundRoom.id)
    .ilike('name', cleanName)
    .maybeSingle()

  if (existingPlayer) {
    alert('Igrač sa tim imenom je već u ovoj sobi.')
    return
  }

  const { data: createdPlayer, error: playerError } =
    await supabase
      .from('players')
      .insert({
        room_id: foundRoom.id,
        name: cleanName,
        score: 0,
        correct_answers: 0,
        is_host: false,
      })
      .select()
      .single()

  if (playerError) {
    console.error(
      'Greška pri pridruživanju sobi:',
      playerError,
    )

    if (playerError.code === '23505') {
      alert('Igrač sa tim imenom je već u sobi.')
      return
    }

    alert('Nije moguće pridružiti se sobi.')
    return
  }

  const { data: roomPlayers, error: playersError } =
    await supabase
      .from('players')
      .select('*')
      .eq('room_id', foundRoom.id)
      .order('created_at', { ascending: true })

  if (playersError) {
    console.error(
      'Greška pri učitavanju igrača:',
      playersError,
    )
  }

  setRoomData({
    id: foundRoom.id,
    code: foundRoom.code,
    category: foundRoom.category,
    questionCount: foundRoom.question_count,
    timeLimit: foundRoom.time_limit,
    status: foundRoom.status,
  })

  setPlayers(
    (roomPlayers || [createdPlayer]).map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      correctAnswers: player.correct_answers,
      isHost: player.is_host,
      isCurrentPlayer: player.id === createdPlayer.id,
    })),
  )

  setCurrentQuestion(foundRoom.current_question || 0)
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