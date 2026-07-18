import { useState } from 'react'

function CreateRoomPage({ onBack }) {
  const [hostName, setHostName] = useState('')
  const [category, setCategory] = useState('Opće znanje')
  const [questionCount, setQuestionCount] = useState('10')
  const [timeLimit, setTimeLimit] = useState('20')

  function handleSubmit(event) {
    event.preventDefault()

    if (!hostName.trim()) {
      alert('Upiši svoje ime.')
      return
    }

    alert(
      `Soba će biti kreirana za ${hostName} — ${category}, ${questionCount} pitanja.`
    )
  }

  return (
    <section className="page-screen">
      <button className="back-button" onClick={onBack}>
        ← Nazad
      </button>

      <div className="form-card">
        <div className="form-heading">
          <span className="form-icon">🎮</span>
          <div>
            <span className="eyebrow">Nova partija</span>
            <h1>Kreiraj sobu</h1>
          </div>
        </div>

        <p className="form-description">
          Podesi osnovna pravila igre. Ostale opcije dodat ćemo kasnije.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Tvoje ime</span>
            <input
              type="text"
              placeholder="Naprimjer: Belko"
              value={hostName}
              onChange={(event) => setHostName(event.target.value)}
              maxLength="20"
            />
          </label>

          <label className="form-field">
            <span>Kategorija</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Opće znanje</option>
              <option>Automobili</option>
              <option>Filmovi i serije</option>
              <option>Sport</option>
              <option>Muzika</option>
              <option>Geografija</option>
              <option>Historija</option>
              <option>Gaming</option>
            </select>
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Broj pitanja</span>
              <select
                value={questionCount}
                onChange={(event) => setQuestionCount(event.target.value)}
              >
                <option value="10">10 pitanja</option>
                <option value="15">15 pitanja</option>
                <option value="20">20 pitanja</option>
                <option value="30">30 pitanja</option>
              </select>
            </label>

            <label className="form-field">
              <span>Vrijeme po pitanju</span>
              <select
                value={timeLimit}
                onChange={(event) => setTimeLimit(event.target.value)}
              >
                <option value="10">10 sekundi</option>
                <option value="15">15 sekundi</option>
                <option value="20">20 sekundi</option>
                <option value="30">30 sekundi</option>
              </select>
            </label>
          </div>

          <button className="submit-button" type="submit">
            Kreiraj sobu
            <span>→</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default CreateRoomPage