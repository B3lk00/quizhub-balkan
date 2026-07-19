import { useEffect, useState } from 'react'

function JoinRoomPage({ onBack, onJoin }) {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const codeFromLink = params.get('room')

  if (!codeFromLink) return

  const cleanCode = codeFromLink
    .replace(/\D/g, '')
    .slice(0, 6)

  if (cleanCode.length === 6) {
    setRoomCode(cleanCode)
  }
}, [])

  function handleSubmit(event) {
    event.preventDefault()

    const cleanName = playerName.trim()
    const cleanCode = roomCode.trim()

    if (!cleanName) {
      setError('Unesi svoje ime.')
      return
    }

    if (cleanCode.length !== 6) {
      setError('Kod sobe mora imati 6 cifara.')
      return
    }

    setError('')
    onJoin({
      playerName: cleanName,
      roomCode: cleanCode,
    })
  }

  function handleCodeChange(event) {
    const value = event.target.value
      .replace(/\D/g, '')
      .slice(0, 6)

    setRoomCode(value)
    setError('')
  }

  return (
    <section className="join-room-page">
      <div className="form-card join-room-card">
        <button className="back-button" onClick={onBack}>
          ← Nazad
        </button>

        <div className="form-heading">
          <span className="eyebrow">Ulazak u partiju</span>
          <h1>Pridruži se sobi</h1>
          <p>
            Unesi svoje ime i šestocifreni kod koji ti je poslao domaćin.
          </p>
        </div>

        <form className="room-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Ime igrača</span>

            <input
              type="text"
              value={playerName}
              onChange={(event) => {
                setPlayerName(event.target.value)
                setError('')
              }}
              placeholder="Na primjer: Haris"
              maxLength={20}
              autoComplete="off"
            />
          </label>

          <label className="form-field">
            <span>Kod sobe</span>

            <input
              className="room-code-input"
              type="text"
              inputMode="numeric"
              value={roomCode}
              onChange={handleCodeChange}
              placeholder="000000"
              maxLength={6}
              autoComplete="off"
            />
          </label>

          {error && (
            <div className="form-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <button className="primary-form-button" type="submit">
            Pridruži se sobi
            <span>→</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default JoinRoomPage