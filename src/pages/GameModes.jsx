import './GameModes.css'

const gameModes = [
  {
    id: 'guess-flag',
    title: 'Pogodi zastavu',
    description: 'Prepoznaj državu prema prikazanoj zastavi.',
    icon: '🏳️',
    status: 'active',
    players: '1–20 igrača',
  },
  {
    id: 'guess-car',
    title: 'Pogodi automobil',
    description: 'Prepoznaj marku ili model automobila.',
    icon: '🚗',
    status: 'coming-soon',
    players: 'Uskoro',
  },
  {
    id: 'guess-logo',
    title: 'Pogodi logo',
    description: 'Prepoznaj poznate kompanije i brendove.',
    icon: '🏢',
    status: 'coming-soon',
    players: 'Uskoro',
  },
  {
    id: 'guess-country',
    title: 'Pogodi državu',
    description: 'Prepoznaj državu prema njenom obliku.',
    icon: '🌍',
    status: 'coming-soon',
    players: 'Uskoro',
  },
  {
    id: 'guess-city',
    title: 'Pogodi grad',
    description: 'Prepoznaj grad prema znamenitostima.',
    icon: '🏙️',
    status: 'coming-soon',
    players: 'Uskoro',
  },
  {
    id: 'guess-movie',
    title: 'Pogodi film',
    description: 'Prepoznaj film prema slici ili opisu.',
    icon: '🎬',
    status: 'coming-soon',
    players: 'Uskoro',
  },
  {
    id: 'guess-club',
    title: 'Pogodi klub',
    description: 'Prepoznaj fudbalski klub prema grbu.',
    icon: '⚽',
    status: 'coming-soon',
    players: 'Uskoro',
  },
  {
    id: 'guess-character',
    title: 'Pogodi lika',
    description: 'Prepoznaj poznate gaming i filmske likove.',
    icon: '👤',
    status: 'coming-soon',
    players: 'Uskoro',
  },
]

function GameModes({ onBack, onSelectMode }) {
  const handleModeClick = (mode) => {
    if (mode.status !== 'active') return

    onSelectMode?.(mode.id)
  }

  return (
    <div className="game-modes-page">
      <div className="game-modes-background game-modes-background-one" />
      <div className="game-modes-background game-modes-background-two" />

      <header className="game-modes-header">
        <button
          type="button"
          className="game-modes-back-button"
          onClick={onBack}
        >
          <span>←</span>
          Nazad
        </button>

        <div className="game-modes-header-text">
          <span className="game-modes-eyebrow">QUIZHUB BALKAN</span>

          <h1>
            Odaberi <span>Game Mode</span>
          </h1>

          <p>
            Izaberi način igre, napravi sobu i izazovi svoje prijatelje.
          </p>
        </div>

        <div className="game-modes-player-badge">
          <span className="game-modes-live-dot" />
          Multiplayer
        </div>
      </header>

      <main className="game-modes-content">
        <section className="game-modes-featured">
          <div className="game-modes-featured-content">
            <div className="game-modes-featured-tag">
              <span>🔥</span>
              ISTAKNUTI MOD
            </div>

            <h2>Pogodi zastavu</h2>

            <p>
              Testiraj koliko dobro poznaješ zastave država iz cijelog
              svijeta. Brži odgovor donosi više bodova.
            </p>

            <div className="game-modes-featured-info">
              <span>🌍 195 država</span>
              <span>👥 Multiplayer</span>
              <span>⚡ Brzo bodovanje</span>
            </div>

            <button
              type="button"
              className="game-modes-play-button"
              onClick={() => onSelectMode?.('guess-flag')}
            >
              <span>▶</span>
              Igraj sada
            </button>
          </div>

          <div className="game-modes-featured-visual">
            <div className="game-modes-flag-card flag-card-back">
              🇯🇵
            </div>

            <div className="game-modes-flag-card flag-card-middle">
              🇧🇷
            </div>

            <div className="game-modes-flag-card flag-card-front">
              🇧🇦
            </div>

            <div className="game-modes-score-bubble">
              <strong>+950</strong>
              <span>Brzi odgovor</span>
            </div>
          </div>
        </section>

        <section className="game-modes-section">
          <div className="game-modes-section-heading">
            <div>
              <span>SVE IGRE</span>
              <h2>Izaberi izazov</h2>
            </div>

            <div className="game-modes-count">
              {gameModes.length} modova
            </div>
          </div>

          <div className="game-modes-grid">
            {gameModes.map((mode) => {
              const isActive = mode.status === 'active'

              return (
                <button
                  type="button"
                  key={mode.id}
                  className={`game-mode-card ${
                    isActive ? 'game-mode-card-active' : ''
                  }`}
                  onClick={() => handleModeClick(mode)}
                  disabled={!isActive}
                >
                  <div className="game-mode-card-top">
                    <div className="game-mode-icon">
                      {mode.icon}
                    </div>

                    {isActive ? (
                      <span className="game-mode-status active">
                        Dostupno
                      </span>
                    ) : (
                      <span className="game-mode-status">
                        Uskoro
                      </span>
                    )}
                  </div>

                  <div className="game-mode-card-content">
                    <h3>{mode.title}</h3>
                    <p>{mode.description}</p>
                  </div>

                  <div className="game-mode-card-footer">
                    <span>{mode.players}</span>

                    <span className="game-mode-arrow">
                      {isActive ? '→' : '🔒'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default GameModes