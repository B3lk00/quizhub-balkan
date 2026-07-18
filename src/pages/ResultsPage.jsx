function ResultsPage({ score, onRestart, onHome }) {
  return (
    <section className="results-page">
      <div className="results-card">
        <div className="winner-icon">🏆</div>

        <span className="eyebrow">Kviz završen</span>

        <h1>Odlična igra!</h1>

        <p>Osvojio si ukupno:</p>

        <strong className="final-score">{score} bodova</strong>

        <div className="results-actions">
          <button className="submit-button" onClick={onRestart}>
            Igraj ponovo
          </button>

          <button className="results-home-button" onClick={onHome}>
            Vrati se na početnu
          </button>
        </div>
      </div>
    </section>
  )
}

export default ResultsPage