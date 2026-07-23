import { useState } from 'react'

function CreateRoomPage({ onBack, onCreate }) {
  const [hostName, setHostName] = useState('')
  const [gameMode, setGameMode] =
    useState('classic-quiz')
  const [category, setCategory] =
    useState('Opće znanje')
  const [questionCount, setQuestionCount] =
    useState('10')
  const [timeLimit, setTimeLimit] =
    useState('20')
  const [isCreating, setIsCreating] =
    useState(false)

  const isClassicQuiz =
    gameMode === 'classic-quiz'

  async function handleSubmit(event) {
    event.preventDefault()

    if (!hostName.trim()) {
      alert('Upiši svoje ime.')
      return
    }

    if (isCreating) {
      return
    }

    setIsCreating(true)

    try {
      await onCreate({
        hostName: hostName.trim(),
        gameMode,
        category: isClassicQuiz
          ? category
          : 'Game mode',
        questionCount,
        timeLimit,
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="page-screen">
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        ← Nazad
      </button>

      <div className="form-card">
        <div className="form-heading">
          <span className="form-icon">🎮</span>

          <div>
            <span className="eyebrow">
              Nova partija
            </span>
            <h1>Kreiraj sobu</h1>
          </div>
        </div>

        <p className="form-description">
          Izaberi vrstu igre, podesi pravila i
          otvori čekaonicu za prijatelje.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Tvoje ime</span>

            <input
              type="text"
              placeholder="Naprimjer: Belko"
              value={hostName}
              onChange={(event) =>
                setHostName(event.target.value)
              }
              maxLength={20}
              autoComplete="off"
            />
          </label>

          <label className="form-field">
            <span>Vrsta igre</span>

            <select
              value={gameMode}
              onChange={(event) =>
                setGameMode(event.target.value)
              }
            >
              <option value="classic-quiz">
                Obični kviz
              </option>

              <option value="guess-logo">
                Pogodi logo
              </option>

              <option value="guess-flag">
                Pogodi zastavu
              </option>

              <option value="guess-car">
                Pogodi automobil
              </option>
            </select>
          </label>

          {isClassicQuiz && (
            <label className="form-field">
              <span>Kategorija</span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
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
          )}

          <div className="form-row">
            <label className="form-field">
              <span>Broj pitanja</span>

              <select
                value={questionCount}
                onChange={(event) =>
                  setQuestionCount(
                    event.target.value,
                  )
                }
              >
                <option value="5">
                  5 pitanja
                </option>
                <option value="10">
                  10 pitanja
                </option>
                <option value="15">
                  15 pitanja
                </option>
                <option value="20">
                  20 pitanja
                </option>
              </select>
            </label>

            <label className="form-field">
              <span>Vrijeme po pitanju</span>

              <select
                value={timeLimit}
                onChange={(event) =>
                  setTimeLimit(event.target.value)
                }
              >
                <option value="10">
                  10 sekundi
                </option>
                <option value="15">
                  15 sekundi
                </option>
                <option value="20">
                  20 sekundi
                </option>
                <option value="30">
                  30 sekundi
                </option>
              </select>
            </label>
          </div>

          <button
            className="submit-button"
            type="submit"
            disabled={isCreating}
          >
            <span>
              {isCreating
                ? 'Kreiram sobu...'
                : 'Kreiraj sobu'}
            </span>

            {!isCreating && <span>→</span>}
          </button>
        </form>
      </div>
    </section>
  )
}

export default CreateRoomPage