import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

function LobbyPage({ roomData, onBack }) {
  const [copiedMessage, setCopiedMessage] = useState('')

  const roomLink = `${window.location.origin}?room=${roomData.code}`

  async function copyToClipboard(text, message) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessage(message)

      window.setTimeout(() => {
        setCopiedMessage('')
      }, 2000)
    } catch (error) {
      console.error('Kopiranje nije uspjelo:', error)
      alert('Kopiranje nije uspjelo. Kopiraj ručno.')
    }
  }

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
            Podijeli kod ili QR sa prijateljima i sačekaj da se svi
            pridruže.
          </p>
        </div>

        <div className="room-code-card">
          <span>Kod sobe</span>
          <strong>{roomData.code}</strong>

          <button
            type="button"
            className="copy-room-code-button"
            onClick={() =>
              copyToClipboard(
                roomData.code,
                'Kod sobe je kopiran!',
              )
            }
          >
            Kopiraj kod
          </button>
        </div>
      </div>

      {copiedMessage && (
        <div className="copy-notification">
          ✓ {copiedMessage}
        </div>
      )}

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
            {roomData.players.map((player, index) => {
              const playerName =
                typeof player === 'string'
                  ? player
                  : player.name

              const isHost =
                typeof player === 'object'
                  ? player.isHost
                  : index === 0

              return (
                <div
                  className="player-item"
                  key={
                    typeof player === 'object'
                      ? player.id
                      : `${playerName}-${index}`
                  }
                >
                  <div className="player-avatar">
                    {playerName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{playerName}</strong>

                    <span>
                      {isHost ? 'Voditelj sobe' : 'Spreman'}
                    </span>
                  </div>

                  <div className="ready-dot"></div>
                </div>
              )
            })}
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

          <div className="lobby-qr-section">
            <div className="qr-code-wrapper">
              <QRCodeSVG
                value={roomLink}
                size={170}
                level="M"
                bgColor="#ffffff"
                fgColor="#111111"
              />
            </div>

            <div className="qr-code-content">
              <strong>Skeniraj za pridruživanje</strong>

              <p>
                Otvori kameru na telefonu i skeniraj QR kod.
              </p>

              <button
                type="button"
                className="copy-room-link-button"
                onClick={() =>
                  copyToClipboard(
                    roomLink,
                    'Link sobe je kopiran!',
                  )
                }
              >
                Kopiraj link sobe
              </button>
            </div>
          </div>

          {roomData.isHost ? (
            <button
              className="start-quiz-button"
              onClick={roomData.onStart}
            >
              Pokreni kviz
            </button>
          ) : (
            <div className="waiting-for-host">
              <span className="waiting-dot"></span>
              Čekanje da domaćin pokrene kviz...
            </div>
          )}

          <p className="lobby-note">
            Kada domaćin pokrene kviz, igra će se automatski otvoriti
            svim pridruženim igračima.
          </p>
        </aside>
      </div>
    </section>
  )
}

export default LobbyPage