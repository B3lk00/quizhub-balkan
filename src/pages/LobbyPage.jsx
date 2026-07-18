function LobbyPage({ roomData, onBack }) {
  return (
    <section className="lobby-page">
      <button className="back-button" onClick={onBack}>
        ← Napusti sobu
      </button>

      <div className="lobby-header">
        <div>
          <span className="eyebrow">Čekaonica</span>
          <h1>Soba je spremna</h1>
          <p>
            Podijeli kod sa prijateljima i sačekaj da se svi pridruže.
          </p>
        </div>

        <div className="room-code-card">
          <span>Kod sobe</span>
          <strong>{roomData.code}</strong>
        </div>
      </div>

      <div className="lobby-grid">
        <div className="players-card">
          <div className="players-header">
            <div>
              <span className="eyebrow">Igrači</span>
              <h2>Pridruženi igrači</h2>
            </div>

            <span className="player-count">
              {roomData.players.length}/20
            </span>
          </div>

          <div className="players-list">
            {roomData.players.map((player, index) => (
              <div className="player-item" key={`${player}-${index}`}>
                <div className="player-avatar">
                  {player.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{player}</strong>
                  <span>{index === 0 ? 'Voditelj sobe' : 'Spreman'}</span>
                </div>

                <div className="ready-dot"></div>
              </div>
            ))}
          </div>
        </div>

        <aside className="room-settings-card">
          <span className="eyebrow">Postavke igre</span>
          <h2>Detalji partije</h2>

          <div className="setting-item">
            <span>Kategorija</span>
            <strong>{roomData.category}</strong>
          </div>

          <div className="setting-item">
            <span>Broj pitanja</span>
            <strong>{roomData.questionCount}</strong>
          </div>

          <div className="setting-item">
            <span>Vrijeme po pitanju</span>
            <strong>{roomData.timeLimit} sekundi</strong>
          </div>

         <button
          className="submit-button lobby-start-button"
          onClick={roomData.onStart}
        >
          Pokreni kviz
           <span>▶</span>
           </button>

          <p className="lobby-note">
            Za početak je dovoljan jedan igrač. Kasnije ćemo dodati pravo
            povezivanje više uređaja.
          </p>
        </aside>
      </div>
    </section>
  )
}

export default LobbyPage