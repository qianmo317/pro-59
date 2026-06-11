import { defineStore } from 'pinia'
import { ref } from 'vue'
import { audioSystem } from '../utils/audioSystem'

const STORAGE_KEY = 'fruit-game-audio-settings'

interface AudioSettings {
  musicEnabled: boolean
  sfxEnabled: boolean
  musicVolume: number
  sfxVolume: number
}

function loadSettings(): AudioSettings {
  if (typeof localStorage === 'undefined') {
    return {
      musicEnabled: true,
      sfxEnabled: true,
      musicVolume: 0.3,
      sfxVolume: 0.5,
    }
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        musicEnabled: parsed.musicEnabled !== false,
        sfxEnabled: parsed.sfxEnabled !== false,
        musicVolume: typeof parsed.musicVolume === 'number' ? parsed.musicVolume : 0.3,
        sfxVolume: typeof parsed.sfxVolume === 'number' ? parsed.sfxVolume : 0.5,
      }
    }
  } catch (e) {
    console.error('Failed to load audio settings:', e)
  }
  return {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.3,
    sfxVolume: 0.5,
  }
}

function saveSettings(settings: AudioSettings) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save audio settings:', e)
  }
}

export const useAudioStore = defineStore('audio', () => {
  const settings = loadSettings()

  const musicEnabled = ref(settings.musicEnabled)
  const sfxEnabled = ref(settings.sfxEnabled)
  const musicVolume = ref(settings.musicVolume)
  const sfxVolume = ref(settings.sfxVolume)

  audioSystem.setMusicEnabled(musicEnabled.value)
  audioSystem.setSfxEnabled(sfxEnabled.value)
  audioSystem.setMusicVolume(musicVolume.value)
  audioSystem.setSfxVolume(sfxVolume.value)

  function persist() {
    saveSettings({
      musicEnabled: musicEnabled.value,
      sfxEnabled: sfxEnabled.value,
      musicVolume: musicVolume.value,
      sfxVolume: sfxVolume.value,
    })
  }

  function toggleMusic() {
    musicEnabled.value = !musicEnabled.value
    audioSystem.setMusicEnabled(musicEnabled.value)
    persist()
  }

  function toggleSfx() {
    sfxEnabled.value = !sfxEnabled.value
    audioSystem.setSfxEnabled(sfxEnabled.value)
    persist()
  }

  function setMusicVolume(value: number) {
    musicVolume.value = Math.max(0, Math.min(1, value))
    audioSystem.setMusicVolume(musicVolume.value)
    persist()
  }

  function setSfxVolume(value: number) {
    sfxVolume.value = Math.max(0, Math.min(1, value))
    audioSystem.setSfxVolume(sfxVolume.value)
    persist()
  }

  function playFruitCatch() {
    audioSystem.playFruitCatch()
  }

  function playBombExplosion() {
    audioSystem.playBombExplosion()
  }

  function playComboMilestone() {
    audioSystem.playComboMilestone()
  }

  function playGameOver() {
    audioSystem.playGameOver()
  }

  function startBgm() {
    audioSystem.startBgm()
  }

  function pauseBgm() {
    audioSystem.pauseBgm()
  }

  function resumeBgm() {
    audioSystem.resumeBgm()
  }

  function stopBgm() {
    audioSystem.stopBgm()
  }

  return {
    musicEnabled,
    sfxEnabled,
    musicVolume,
    sfxVolume,
    toggleMusic,
    toggleSfx,
    setMusicVolume,
    setSfxVolume,
    playFruitCatch,
    playBombExplosion,
    playComboMilestone,
    playGameOver,
    startBgm,
    pauseBgm,
    resumeBgm,
    stopBgm,
  }
})
