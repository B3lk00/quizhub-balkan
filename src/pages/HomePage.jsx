function HomePage({ onCreateRoom, onJoinRoom }) {
  return (
    <>
      <section className="hero">
        <div className="hero-badge">
          <span className="status-dot"></span>
          Multiplayer kviz platforma
        </div>

        <h1>
          Okupi društvo.
          <span> Pokreni kviz.</span>
          Osvoji vrh.
        </h1>

        <p className="hero-description">
          Kreiraj privatnu sobu, podijeli kod sa prijateljima i započnite
          takmičenje za nekoliko sekundi. Bez instalacije i komplikovane
          registracije.
        </p>

        <div className="hero-actions">
          <button className="primary-button" onClick={onCreateRoom}>
            <span className="button-icon">▶</span>
            Kreiraj sobu
          </button>

          <button className="secondary-button" onClick={onJoinRoom}>
            Pridruži se
            <span className="arrow">→</span>
          </button>
        </div>

        <div className="join-box">
          <div>
            <span className="join-label">Već imaš kod sobe?</span>
            <strong>Pridruži se odmah</strong>
          </div>

          <button className="quick-join-button" onClick={onJoinRoom}>
            Unesi kod
          </button>
        </div>

        <div className="stats">
          <div className="stat-item">
            <strong>12+</strong>
            <span>Kategorija</span>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <strong>10</strong>
            <span>Modova igre</span>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item">
            <strong>∞</strong>
            <span>Zabave</span>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <article className="feature-card featured-card">
          <div className="feature-icon">⚡</div>
          <h2>Brz ulazak</h2>
          <p>
            Kreiraj sobu i podijeli kod. Igrači se priključuju bez registracije.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-icon">👥</div>
          <h2>Pravi multiplayer</h2>
          <p>
            Igrajte zajedno uživo preko mobitela, računara ili velikog ekrana.
          </p>
        </article>

        <article className="feature-card">
          <div className="feature-icon">🏆</div>
          <h2>Više modova</h2>
          <p>
            Classic, eliminacija, timska borba, time attack i još mnogo toga.
          </p>
        </article>
      </section>
    </>
  )
}

export default HomePage