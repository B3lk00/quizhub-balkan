import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { QRCodeSVG } from 'qrcode.react'

function LobbyPage({ roomData, onBack }) {
  const [copiedMessage, setCopiedMessage] =
    useState('')

  const [chatMessage, setChatMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef(null)

  const roomLink =
    `${window.location.origin}${window.location.pathname}` +
    `?room=${roomData.code}`

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [roomData.messages])

  async function copyToClipboard(text, message) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessage(message)

      window.setTimeout(() => {
        setCopiedMessage('')
      }, 2000)
    } catch (error) {
      console.error(
        'Kopiranje nije uspjelo:',
        error,
      )

      alert(
        'Kopiranje nije uspjelo. Kopiraj ručno.',
      )
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault()

    const cleanMessage = chatMessage.trim()

    if (!cleanMessage || isSending) {
      return
    }

    setIsSending(true)

    const wasSent =
      await roomData.onSendMessage(cleanMessage)

    if (wasSent) {
      setChatMessage('')
    }

    setIsSending(false)
  }

  function formatMessageTime(dateValue) {
    if (!dateValue) {
      return ''
    }

    return new Intl.DateTimeFormat('bs-BA', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateValue))
  }

  return (
    <section className="lobby-page">
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        ← Napusti sobu
      </button>

      <div className="lobby-header">
        <div>
          <span className="eyebrow">Čekaonica</span>
          <h1>Soba je spremna</h1>

          <p>
            Podijeli kod ili QR sa prijateljima i
            sačekaj da se svi pridruže.
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
        <div className="lobby-left-column">
          <div className="players-card">
            <div className="players-header">
              <div>
                <span className="eyebrow">
                  Igrači
                </span>

                <h2>Pridruženi igrači</h2>
              </div>

              <span className="player-count">
                {roomData.players.length}/20
              </span>
            </div>

            <div className="players-list">
              {roomData.players.map((player) => {
                const isCurrentPlayer =
                  player.id ===
                  roomData.currentPlayerId

                return (
                  <div
                    className="player-item"
                    key={player.id}
                  >
                    <div className="player-avatar">
                      {player.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="player-info">
                      <strong>
                        {player.name}

                        {isCurrentPlayer && (
                          <span className="lobby-you-badge">
                            Ti
                          </span>
                        )}
                      </strong>

                      <span>
                        {player.isHost
                          ? 'Voditelj sobe'
                          : 'Spreman'}
                      </span>
                    </div>

                    <div className="player-item-actions">
                      <div className="ready-dot"></div>

                      {roomData.isHost &&
                        !player.isHost &&
                        !isCurrentPlayer && (
                          <button
                            type="button"
                            className="kick-player-button"
                            onClick={() =>
                              roomData.onKickPlayer(
                                player.id,
                              )
                            }
                          >
                            Izbaci
                          </button>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lobby-chat-card">
            <div className="chat-header">
              <div>
                <span className="eyebrow">
                  Razgovor
                </span>

                <h2>Chat sobe</h2>
              </div>

              <span className="chat-online">
                Uživo
              </span>
            </div>

            <div className="chat-messages">
              {roomData.messages.length === 0 ? (
                <div className="empty-chat">
                  <span>💬</span>

                  <strong>
                    Još nema poruka
                  </strong>

                  <p>
                    Napiši prvu poruku igračima u
                    sobi.
                  </p>
                </div>
              ) : (
                roomData.messages.map((message) => {
                  const isOwnMessage =
                    message.playerId ===
                    roomData.currentPlayerId

                  return (
                    <div
                      className={`chat-message ${
                        isOwnMessage
                          ? 'own-message'
                          : ''
                      }`}
                      key={message.id}
                    >
                      <div className="chat-message-top">
                        <strong>
                          {isOwnMessage
                            ? 'Ti'
                            : message.playerName}
                        </strong>

                        <span>
                          {formatMessageTime(
                            message.createdAt,
                          )}
                        </span>
                      </div>

                      <p>{message.text}</p>
                    </div>
                  )
                })
              )}

              <div ref={messagesEndRef}></div>
            </div>

            <form
              className="chat-form"
              onSubmit={handleSendMessage}
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(event) =>
                  setChatMessage(
                    event.target.value.slice(0, 200),
                  )
                }
                placeholder="Napiši poruku..."
                maxLength={200}
                autoComplete="off"
              />

              <span className="chat-character-count">
                {chatMessage.length}/200
              </span>

              <button
                type="submit"
                disabled={
                  !chatMessage.trim() || isSending
                }
              >
                {isSending
                  ? 'Šaljem...'
                  : 'Pošalji'}
              </button>
            </form>
          </div>
        </div>

        <aside className="room-settings-card">
          <span className="eyebrow">
            Postavke igre
          </span>

          <h2>Detalji partije</h2>

          <div className="setting-item">
            <span>Kategorija</span>
            <strong>{roomData.category}</strong>
          </div>

          <div className="setting-item">
            <span>Broj pitanja</span>
            <strong>
              {roomData.questionCount}
            </strong>
          </div>

          <div className="setting-item">
            <span>Vrijeme po pitanju</span>
            <strong>
              {roomData.timeLimit} sekundi
            </strong>
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
              <strong>
                Skeniraj za pridruživanje
              </strong>

              <p>
                Otvori kameru na telefonu i
                skeniraj QR kod.
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
              type="button"
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
            Kada domaćin pokrene kviz, igra će se
            automatski otvoriti svim pridruženim
            igračima.
          </p>
        </aside>
      </div>
    </section>
  )
}

export default LobbyPage