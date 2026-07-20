import correctSoundFile from '../assets/sounds/correct.mp3'
import wrongSoundFile from '../assets/sounds/wrong.mp3'
import tickSoundFile from '../assets/sounds/tick.mp3'
import startSoundFile from '../assets/sounds/start.mp3'
import chatSoundFile from '../assets/sounds/chat.mp3'
import winSoundFile from '../assets/sounds/win.mp3'
import finishSoundFile from '../assets/sounds/finish.mp3'
import clickSoundFile from '../assets/sounds/click.mp3'

const sounds = {
  correct: new Audio(correctSoundFile),
  wrong: new Audio(wrongSoundFile),
  tick: new Audio(tickSoundFile),
  start: new Audio(startSoundFile),
  chat: new Audio(chatSoundFile),
  win: new Audio(winSoundFile),
  finish: new Audio(finishSoundFile),
  click: new Audio(clickSoundFile),
}

let soundsEnabled = true
let soundVolume = 0.5

Object.values(sounds).forEach((sound) => {
  sound.preload = 'auto'
})

function playSound(soundName, customVolume = 1) {
  if (!soundsEnabled) {
    return
  }

  const originalSound = sounds[soundName]

  if (!originalSound) {
    console.warn(`Zvuk "${soundName}" nije pronađen.`)
    return
  }

  const sound = originalSound.cloneNode()

  sound.volume = Math.min(
    Math.max(soundVolume * customVolume, 0),
    1,
  )

  sound.play().catch((error) => {
    console.warn(
      `Zvuk "${soundName}" nije moguće pokrenuti:`,
      error,
    )
  })
}

export function playCorrectSound() {
  playSound('correct')
}

export function playWrongSound() {
  playSound('wrong')
}

export function playTickSound() {
  playSound('tick', 0.7)
}

export function playStartSound() {
  playSound('start')
}

export function playChatSound() {
  playSound('chat', 0.7)
}

export function playWinSound() {
  playSound('win')
}

export function playFinishSound() {
  playSound('finish')
}

export function playClickSound() {
  playSound('click', 0.5)
}

export function setSoundsEnabled(enabled) {
  soundsEnabled = Boolean(enabled)
}

export function getSoundsEnabled() {
  return soundsEnabled
}

export function setSoundVolume(volume) {
  const cleanVolume = Number(volume)

  if (Number.isNaN(cleanVolume)) {
    return
  }

  soundVolume = Math.min(
    Math.max(cleanVolume, 0),
    1,
  )
}

export function getSoundVolume() {
  return soundVolume
}

const soundPaths = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  tick: '/sounds/tick.mp3',
  finish: '/sounds/finish.mp3',
}

const audioCache = {}

function getAudio(soundName) {
  if (!soundPaths[soundName]) {
    console.warn(`Zvuk "${soundName}" ne postoji.`)
    return null
  }

  if (!audioCache[soundName]) {
    audioCache[soundName] = new Audio(soundPaths[soundName])
    audioCache[soundName].preload = 'auto'
  }

  return audioCache[soundName]
}

export function playSound(soundName, volume = 0.6) {
  const audio = getAudio(soundName)

  if (!audio) return

  audio.pause()
  audio.currentTime = 0
  audio.volume = volume

  audio.play().catch((error) => {
    console.warn('Zvuk nije pokrenut:', error)
  })
}