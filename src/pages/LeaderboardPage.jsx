function LeaderboardPage({
  players,
  currentQuestion,
  totalQuestions,
  onNext,
  onHome,
  finishedPlayersCount,
  remainingPlayersCount,
  everyoneFinished,
  currentPlayerId,
  isHost,
}) {
  return (
    <section className="leaderboard-page">
      <div className="leaderboard-heading">
        <div>
          <span className="eyebrow">
            {everyoneFinished
              ? 'Kviz završen'
              : 'Rezultati uživo'}
          </span>

          <h1>
            {everyoneFinished
              ? 'Konačni poredak'
              : 'Čekanje ostalih igrača'}
          </h1>

          <p>
            {everyoneFinished
              ? 'Svi igrači su završili kviz. Pogledaj konačni poredak.'
              : remainingPlayersCount === 1
                ? 'Još jedan igrač završava kviz. Rezultati se ažuriraju uživo.'
                : `Još ${remainingPlayersCount} igrača završavaju kviz. Rezultati se ažuriraju uživo.`}
          </p>
        </div>

        <div className="round-badge">
          <span>Završili</span>

          <strong>
            {finishedPlayersCount}/{players.length}
          </strong>
        </div>
      </div>

      {!everyoneFinished && (
        <div className="leaderboard-waiting">
          <span className="waiting-dot"></span>

          <div>
            <strong>Rezultati uživo</strong>

            <p>
              Možeš pratiti bodove igrača kako završavaju kviz.
            </p>
          </div>
        </div>
      )}

      <div className="leaderboard-card">
        <div className="leaderboard-table-header">
          <span>Pozicija</span>
          <span>Igrač</span>
          <span>Tačno</span>
          <span>Bodovi</span>
        </div>

        <div className="leaderboard-list">
          {players.map((player, index) => {
            const isCurrentPlayer =
              player.id === currentPlayerId ||
              player.isCurrentPlayer

            const isWinner =
              everyoneFinished && index === 0

            return (
              <div
                className={[
                  'leaderboard-player',
                  isWinner ? 'leaderboard-winner' : '',
                  isCurrentPlayer
                    ? 'leaderboard-current-player'
                    : '',
                  !player.isFinished
                    ? 'leaderboard-player-playing'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={player.id}
              >
                <div className="leaderboard-position">
                  {isWinner ? '👑' : `#${index + 1}`}
                </div>

                <div className="leaderboard-user">
                  <div className="leaderboard-avatar">
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {player.name}

                      {isCurrentPlayer && (
                        <span className="you-badge">Ti</span>
                      )}
                    </strong>

                    <span
                      className={
                        player.isFinished
                          ? 'player-status player-finished'
                          : 'player-status player-playing'
                      }
                    >
                      <span className="status-dot"></span>

                      {player.isFinished
                        ? isWinner
                          ? 'Pobjednik'
                          : 'Završio kviz'
                        : 'Još igra...'}
                    </span>
                  </div>
                </div>

                <div className="leaderboard-correct">
                  <strong>
                    {player.correctAnswers || 0}
                  </strong>

                  <span>/{totalQuestions}</span>
                </div>

                <strong className="leaderboard-score">
                  {player.isFinished
                    ? player.score || 0
                    : '—'}
                </strong>
              </div>
            )
          })}
        </div>
      </div>

<div className="leaderboard-actions">
  {everyoneFinished && isHost && (
    <button
      className="leaderboard-next-button"
      onClick={onNext}
    >
      Igraj ponovo
      <span>↻</span>
    </button>
  )}

  {everyoneFinished && !isHost && (
    <button
      className="leaderboard-next-button"
      disabled
    >
      Čekanje domaćina...
      <span>⌛</span>
    </button>
  )}

  {!everyoneFinished && (
    <button
      className="leaderboard-next-button"
      disabled
    >
      Čekanje ostalih...
      <span>⌛</span>
    </button>
  )}

  <button
    className="leaderboard-home-button"
    onClick={onHome}
  >
    Vrati se na početnu
  </button>
</div>
    </section>
  )
}

export default LeaderboardPage