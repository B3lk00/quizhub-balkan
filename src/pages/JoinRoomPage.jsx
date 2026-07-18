import { useState } from 'react'

function JoinRoomPage({ onBack }) {
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')

  function handleCodeChange(event) {
    const cleanCode = event.target.value.replace(/\D/g, '').slice(0, 6)
    setRoomCode(cleanCode)
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (roomCode.length !== 6) {
      alert('Kod sobe mora imati 6 brojeva.')
      return
    }

    if (!playerName.trim()) {
      alert('Upiši svoje ime.')
      return
    }

    alert(`${playerName} se pridružuje sobi ${roomCode}.`)
  }

  return (
    <section className="page-screen">
      <button className="back-button" onClick={onBack}>
        ← Nazad
      </button>

      <div className="form-card join-page-card">
        <div className="form-heading">
          <span className="form-icon">🚪</span>
          <div>
            <span className="eyebrow">Ulazak u partiju</span>
            <h1>Pridruži se</h1>
          </div>
        </div>

        <p className="form-description">
          Upiši šestocifreni kod koji ti je poslao voditelj kviza.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Kod sobe</span>
            <input
              className="room-code-input"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={roomCode}
              onChange={handleCodeChange}
            />
          </label>

          <label className="form-field">
            <span>Tvoje ime</span>
            <input
              type="text"
              placeholder="Kako ćeš se zvati u igri?"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              maxLength="20"
            />
          </label>

          <button className="submit-button" type="submit">
            Uđi u sobu
            <span>→</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default JoinRoomPage