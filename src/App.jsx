import { useEffect, useState } from 'react'
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
  const [currentPlayerId, setCurrentPlayerId] = useState(null)
  const [gameQuestions, setGameQuestions] = useState([])
  
useEffect(() => {
  if (!roomData?.id || !currentPlayerId) {
    return
  }

const playersChannel = supabase
  .channel(`room-players-${roomData.id}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'players',
      filter: `room_id=eq.${roomData.id}`,
    },
    (payload) => {
      const changedPlayer = payload.new

      const currentPlayerWasKicked =
        payload.eventType === 'UPDATE' &&
        changedPlayer?.id === currentPlayerId &&
        changedPlayer?.kicked === true

      if (currentPlayerWasKicked) {
        alert('Domaćin te je izbacio iz sobe.')
        leaveRoom()
        return
      }

      loadRoomPlayers(
        roomData.id,
        currentPlayerId,
      )
    },
  )
  .subscribe((status, error) => {
    console.log('Players Realtime status:', status)

    if (error) {
      console.error(
        'Players Realtime greška:',
        error,
      )
    }
  })

  return () => {
    supabase.removeChannel(playersChannel)
  }
}, [roomData?.id, currentPlayerId])

useEffect(() => {
  if (!roomData?.id) {
    return
  }

  const roomChannel = supabase
    .channel(`room-status-${roomData.id}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomData.id}`,
      },
      async (payload) => {
  const updatedRoom = payload.new

        setRoomData((previousRoom) => ({
          ...previousRoom,
          status: updatedRoom.status,
          currentQuestion: updatedRoom.current_question,
        }))

if (
  updatedRoom.status === 'playing' &&
  currentPage !== 'quiz'
) {
  const { data: activePlayer, error: playerCheckError } =
    await supabase
      .from('players')
      .select('id')
      .eq('id', currentPlayerId)
      .eq('room_id', roomData.id)
      .maybeSingle()

  if (playerCheckError) {
    console.error(
      'Greška pri provjeri igrača:',
      playerCheckError,
    )
    return
  }

  if (!activePlayer) {
    alert('Domaćin te je izbacio iz sobe.')
    leaveRoom()
    return
  }

  const selectedQuestions = getQuestionsByIds(
    updatedRoom.question_ids,
  )

  if (selectedQuestions.length === 0) {
    console.error('Pitanja nisu pronađena.')
    return
  }

  setGameQuestions(selectedQuestions)
  setCurrentQuestion(0)
  setFinalScore(0)
  setCurrentPage('quiz')
  window.scrollTo(0, 0)
}
      },
    )
    .subscribe((status, error) => {
      console.log('Room Realtime status:', status)

      if (error) {
        console.error('Room Realtime greška:', error)
      }
    })

  return () => {
    supabase.removeChannel(roomChannel)
  }
}, [
  roomData?.id,
  currentPage,
  currentPlayerId,
])

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const roomCodeFromLink = params.get('room')

  if (roomCodeFromLink) {
    setCurrentPage('join')
  }
}, [])

async function loadRoomPlayers(roomId, playerIdToCheck) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomId)
    .eq('kicked', false)
    .order('created_at', { ascending: true })

  if (error) {
    console.error(
      'Greška pri učitavanju igrača:',
      error,
    )
    return
  }

  const loadedPlayers = (data || []).map((player) => ({
    id: player.id,
    name: player.name,
    score: player.score || 0,
    correctAnswers: player.correct_answers || 0,
    isHost: player.is_host,
    isFinished: player.finished === true,
    finishedAt: player.finished_at,
    isCurrentPlayer:
      player.id === playerIdToCheck,
  }))

  setPlayers(loadedPlayers)
}

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
  setCurrentPlayerId(null)
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

async function kickPlayer(playerId) {
  if (!roomData?.id || !isCurrentPlayerHost) {
    alert('Samo domaćin može izbaciti igrača.')
    return
  }

  if (playerId === currentPlayerId) {
    alert('Ne možeš izbaciti samog sebe.')
    return
  }

  const playerToKick = players.find(
    (player) => player.id === playerId,
  )

  if (!playerToKick) {
    alert('Igrač nije pronađen.')
    return
  }

  const shouldKick = window.confirm(
    `Želiš li izbaciti igrača "${playerToKick.name}" iz sobe?`,
  )

  if (!shouldKick) {
    return
  }

  const { error } = await supabase
    .from('players')
    .update({
      kicked: true,
    })
    .eq('id', playerId)
    .eq('room_id', roomData.id)
    .eq('is_host', false)

  if (error) {
    console.error(
      'Greška pri izbacivanju igrača:',
      error,
    )

    alert('Igrača nije moguće izbaciti.')
    return
  }

  setPlayers((currentPlayers) =>
    currentPlayers.filter(
      (player) => player.id !== playerId,
    ),
  )
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
        finished: false,
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
    questionIds: createdRoom.question_ids || [],
  })

setCurrentPlayerId(createdHost.id)

  setPlayers([
    {
      id: createdHost.id,
      name: createdHost.name,
      score: createdHost.score,
      correctAnswers: createdHost.correct_answers,
      isCurrentPlayer: true,
      isHost: createdHost.is_host,
      isFinished: false,
      kicked: false
    },
  ])

  setCurrentQuestion(0)
  setCurrentPage('lobby')
  window.scrollTo(0, 0)
}
async function joinRoom({ playerName, roomCode }) {
  const cleanName = playerName.trim()
  const cleanCode = roomCode.trim()

  if (!cleanName || !cleanCode) {
    alert('Unesi ime i kod sobe.')
    return
  }

  try {
    const { data: foundRoom, error: roomError } =
      await supabase
        .from('rooms')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle()

    if (roomError) {
      console.error('Greška pri traženju sobe:', roomError)
      alert('Došlo je do greške pri traženju sobe.')
      return
    }

    if (!foundRoom) {
      alert('Soba sa tim kodom ne postoji.')
      return
    }

    if (foundRoom.status !== 'lobby') {
      alert('Ova partija je već počela ili je završena.')
      return
    }

    const { data: existingPlayer, error: existingError } =
      await supabase
        .from('players')
        .select('id')
        .eq('room_id', foundRoom.id)
        .ilike('name', cleanName)
        .maybeSingle()

    if (existingError) {
      console.error(
        'Greška pri provjeri postojećeg igrača:',
        existingError,
      )

      alert('Nije moguće provjeriti igrača.')
      return
    }

    if (existingPlayer) {
      alert('Igrač sa tim imenom je već u lobbyju.')
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
          finished: false,
        })
        .select()
        .single()

    if (playerError) {
      console.error(
        'Greška pri dodavanju igrača:',
        playerError,
      )

      alert('Nije moguće pridružiti se sobi.')
      return
    }

    console.log('Igrač uspješno kreiran:', createdPlayer)

    setCurrentPlayerId(createdPlayer.id)

    setRoomData({
      id: foundRoom.id,
      code: foundRoom.code,
      category: foundRoom.category,
      questionCount: foundRoom.question_count,
      timeLimit: foundRoom.time_limit,
      status: foundRoom.status,
      currentQuestion: foundRoom.current_question || 0,
      questionIds: foundRoom.question_ids || [],
    })

    setPlayers([
      {
        id: createdPlayer.id,
        name: createdPlayer.name,
        score: createdPlayer.score || 0,
        correctAnswers: createdPlayer.correct_answers || 0,
        isHost: false,
        isCurrentPlayer: true,
        isFinished: false,
        kicked: false
      },
    ])

window.history.replaceState(
  {},
  '',
  window.location.pathname,
)

    setCurrentQuestion(foundRoom.current_question || 0)
    setCurrentPage('lobby')
    window.scrollTo(0, 0)

    console.log('Otvaram lobby...')

    // Nakon otvaranja lobbyja učitaj sve ostale igrače.
    await loadRoomPlayers(
      foundRoom.id,
      createdPlayer.id,
    )
  } catch (error) {
    console.error('Neočekivana joinRoom greška:', error)
    alert('Došlo je do neočekivane greške.')
  }
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

function getQuestionsByIds(questionIds) {
  if (!Array.isArray(questionIds)) {
    return []
  }

  return questionIds
    .map((questionId) =>
      allQuestions.find(
        (question) => question.id === questionId,
      ),
    )
    .filter(Boolean)
}

async function startQuiz() {
  if (!roomData?.id) {
    alert('Soba nije pronađena.')
    return
  }

  const currentPlayer = players.find(
    (player) => player.id === currentPlayerId,
  )

  if (!currentPlayer?.isHost) {
    alert('Samo domaćin može pokrenuti kviz.')
    return
  }

  const selectedQuestions = createGameQuestions(
    roomData.category,
    roomData.questionCount,
  )

  if (selectedQuestions.length === 0) {
    alert('Nema dostupnih pitanja za ovu kategoriju.')
    return
  }

  const questionIds = selectedQuestions.map(
    (question) => question.id,
  )

  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'playing',
      current_question: 0,
      question_ids: questionIds,
    })
    .eq('id', roomData.id)

  if (error) {
    console.error('Greška pri pokretanju kviza:', error)
    alert('Kviz nije moguće pokrenuti.')
    return
  }

  setGameQuestions(selectedQuestions)
  setCurrentQuestion(0)
  setFinalScore(0)

  setRoomData((previousRoom) => ({
    ...previousRoom,
    status: 'playing',
    currentQuestion: 0,
    questionIds,
  }))

  setCurrentPage('quiz')
  window.scrollTo(0, 0)
}

async function completeAnswer(points) {
  if (!roomData?.id || !currentPlayerId) {
    return
  }

  const player = players.find(
    (currentPlayer) =>
      currentPlayer.id === currentPlayerId,
  )

  if (!player) {
    alert('Trenutni igrač nije pronađen.')
    return
  }

  const isCorrect = points > 0

  const newScore =
    Number(player.score || 0) + Number(points || 0)

  const newCorrectAnswers =
    Number(player.correctAnswers || 0) +
    (isCorrect ? 1 : 0)

  const isLastQuestion =
    currentQuestion === gameQuestions.length - 1

  const playerUpdate = {
    score: newScore,
    correct_answers: newCorrectAnswers,
  }

  if (isLastQuestion) {
    playerUpdate.finished = true
    playerUpdate.finished_at = new Date().toISOString()
  }

  const { error: playerError } = await supabase
    .from('players')
    .update(playerUpdate)
    .eq('id', currentPlayerId)

  if (playerError) {
    console.error(
      'Greška pri čuvanju odgovora:',
      playerError,
    )

    alert('Odgovor i bodovi nisu sačuvani.')
    return
  }

  setPlayers((currentPlayers) =>
    currentPlayers.map((currentPlayer) =>
      currentPlayer.id === currentPlayerId
        ? {
            ...currentPlayer,
            score: newScore,
            correctAnswers: newCorrectAnswers,
            isFinished: isLastQuestion,
            finishedAt: isLastQuestion
              ? playerUpdate.finished_at
              : currentPlayer.finishedAt,
          }
        : currentPlayer,
    ),
  )

  if (!isLastQuestion) {
    setCurrentQuestion(
      (questionIndex) => questionIndex + 1,
    )

    setCurrentPage('quiz')
    window.scrollTo(0, 0)
    return
  }

  setFinalScore(newScore)

  await loadRoomPlayers(
    roomData.id,
    currentPlayerId,
  )

  setCurrentPage('leaderboard')
  window.scrollTo(0, 0)

  const { data: allPlayers, error: playersError } =
    await supabase
      .from('players')
      .select('finished')
      .eq('room_id', roomData.id)

  if (playersError) {
    console.error(
      'Greška pri provjeri završetka igrača:',
      playersError,
    )
    return
  }

  const everyoneFinished =
    allPlayers.length > 0 &&
    allPlayers.every(
      (roomPlayer) => roomPlayer.finished === true,
    )

  if (everyoneFinished) {
    const { error: roomError } = await supabase
      .from('rooms')
      .update({
        status: 'finished',
      })
      .eq('id', roomData.id)

    if (roomError) {
      console.error(
        'Greška pri završavanju sobe:',
        roomError,
      )
    }
  }
}

async function restartQuiz() {
  if (!roomData?.id || !isCurrentPlayerHost) {
    alert('Samo domaćin može pokrenuti novu rundu.')
    return
  }

  const selectedQuestions = createGameQuestions(
    roomData.category,
    roomData.questionCount,
  )

  if (selectedQuestions.length === 0) {
    alert('Nema dostupnih pitanja za novu rundu.')
    return
  }

  const questionIds = selectedQuestions.map(
    (question) => question.id,
  )

  const { error: playersError } = await supabase
    .from('players')
    .update({
      score: 0,
      correct_answers: 0,
      finished: false,
      finished_at: null,
    })
    .eq('room_id', roomData.id)
    .eq('kicked', false)

  if (playersError) {
    console.error(
      'Greška pri resetovanju igrača:',
      playersError,
    )

    alert('Igrači nisu resetovani.')
    return
  }

  const { error: roomError } = await supabase
    .from('rooms')
    .update({
      status: 'playing',
      current_question: 0,
      question_ids: questionIds,
    })
    .eq('id', roomData.id)

  if (roomError) {
    console.error(
      'Greška pri pokretanju nove runde:',
      roomError,
    )

    alert('Nova runda nije pokrenuta.')
    return
  }

  setPlayers((currentPlayers) =>
    currentPlayers.map((player) => ({
      ...player,
      score: 0,
      correctAnswers: 0,
      isFinished: false,
      finishedAt: null,
    })),
  )

  setGameQuestions(selectedQuestions)
  setCurrentQuestion(0)
  setFinalScore(0)

  setRoomData((previousRoom) => ({
    ...previousRoom,
    status: 'playing',
    currentQuestion: 0,
    questionIds,
  }))

  setCurrentPage('quiz')
  window.scrollTo(0, 0)
}

  const currentPlayer = players.find(
    (player) => player.isCurrentPlayer,
  )
  const isCurrentPlayerHost = currentPlayer?.isHost === true

  const leaderboardPlayers = [...players].sort((playerA, playerB) => {
  if (playerA.isFinished && !playerB.isFinished) {
    return -1
  }

  if (!playerA.isFinished && playerB.isFinished) {
    return 1
  }

  if (playerB.score !== playerA.score) {
    return playerB.score - playerA.score
  }

  if (playerB.correctAnswers !== playerA.correctAnswers) {
    return playerB.correctAnswers - playerA.correctAnswers
  }

  if (playerA.finishedAt && playerB.finishedAt) {
    return (
      new Date(playerA.finishedAt).getTime() -
      new Date(playerB.finishedAt).getTime()
    )
  }

  return 0
})

const finishedPlayersCount = players.filter(
  (player) => player.isFinished,
).length

const remainingPlayersCount =
  players.length - finishedPlayersCount

const everyoneFinished =
  players.length > 0 &&
  remainingPlayersCount === 0

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
      players,
      onStart: startQuiz,
      onKickPlayer: kickPlayer,
      isHost: isCurrentPlayerHost,
      currentPlayerId,
    }}
    onBack={leaveRoom}
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
  players={leaderboardPlayers}
  currentQuestion={currentQuestion}
  totalQuestions={gameQuestions.length}
  onNext={restartQuiz}
  onHome={goHome}
  isLastQuestion={true}
  finishedPlayersCount={finishedPlayersCount}
  remainingPlayersCount={remainingPlayersCount}
  everyoneFinished={everyoneFinished}
  currentPlayerId={currentPlayerId}
  isHost={isCurrentPlayerHost}
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