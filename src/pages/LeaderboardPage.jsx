function LeaderboardPage({
  players,
  currentQuestion,
  totalQuestions,
  onNext,
  onHome,
  isLastQuestion,
}) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <section className="leaderboard-page">
      <div className="leaderboard-heading">
        <div>
        <span className="eyebrow">Kviz završen</span>

     <h1>Konačni poredak</h1>

    <p>
     Završena su sva pitanja. Pogledaj ko je osvojio prvo mjesto.
    </p>
        </div>

        <div className="round-badge">
          <span>Pitanja</span>
          <strong>
            {currentQuestion + 1}/{totalQuestions}
          </strong>
        </div>
      </div>

      <div className="leaderboard-card">
        <div className="leaderboard-table-header">
          <span>Pozicija</span>
          <span>Igrač</span>
          <span>Bodovi</span>
        </div>

        <div className="leaderboard-list">
          {sortedPlayers.map((player, index) => (
            <div
              className={`leaderboard-player ${
                index === 0 ? 'leaderboard-winner' : ''
              }`}
              key={player.id}
            >
              <div className="leaderboard-position">
                {index === 0 ? '👑' : `#${index + 1}`}
              </div>

              <div className="leaderboard-user">
                <div className="leaderboard-avatar">
                  {player.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{player.name}</strong>

                  <span>
                    {player.isCurrentPlayer
                      ? 'Ti'
                      : index === 0
                        ? 'Trenutno vodi'
                        : 'Igrač'}
                  </span>
                </div>
              </div>

              <strong className="leaderboard-score">
                {player.score}
              </strong>
            </div>
          ))}
        </div>
      </div>

     <div className="leaderboard-actions">
  <button className="leaderboard-next-button" onClick={onNext}>
    Igraj ponovo
    <span>↻</span>
  </button>

  <button className="leaderboard-home-button" onClick={onHome}>
    Vrati se na početnu
  </button>
</div>
    </section>
  )
}

export default LeaderboardPage