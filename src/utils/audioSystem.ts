export class AudioSystem {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private bgmOscillators: OscillatorNode[] = []
  private bgmGainNodes: GainNode[] = []
  private bgmTimer: number | null = null
  private bgmNoteIndex = 0
  private isBgmPlaying = false
  private isPaused = false
  private musicEnabled = true
  private sfxEnabled = true
  private musicVolume = 0.3
  private sfxVolume = 0.5

  private bgmPattern = [
    { note: 261.63, duration: 0.4 },
    { note: 293.66, duration: 0.4 },
    { note: 329.63, duration: 0.4 },
    { note: 349.23, duration: 0.4 },
    { note: 392.00, duration: 0.6 },
    { note: 349.23, duration: 0.2 },
    { note: 329.63, duration: 0.4 },
    { note: 293.66, duration: 0.4 },
    { note: 261.63, duration: 0.6 },
    { note: 220.00, duration: 0.2 },
    { note: 246.94, duration: 0.4 },
    { note: 261.63, duration: 0.6 },
  ]

  private gameOverMelody = [
    { note: 392.00, duration: 0.3 },
    { note: 349.23, duration: 0.3 },
    { note: 329.63, duration: 0.3 },
    { note: 293.66, duration: 0.5 },
    { note: 261.63, duration: 0.8 },
  ]

  private comboMilestoneFanfare = [
    { note: 523.25, duration: 0.15 },
    { note: 659.25, duration: 0.15 },
    { note: 783.99, duration: 0.3 },
  ]

  constructor() {
    this.initAudioContext()
  }

  private initAudioContext() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)

      this.bgmGain = this.audioContext.createGain()
      this.bgmGain.gain.value = this.musicEnabled ? this.musicVolume : 0
      this.bgmGain.connect(this.masterGain)

      this.sfxGain = this.audioContext.createGain()
      this.sfxGain.gain.value = this.sfxEnabled ? this.sfxVolume : 0
      this.sfxGain.connect(this.masterGain)
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioContext) {
      this.initAudioContext()
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume()
    }
    return this.audioContext
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
    if (this.bgmGain) {
      this.bgmGain.gain.value = enabled ? this.musicVolume : 0
    }
    if (enabled && this.isBgmPlaying && !this.isPaused) {
      this.startBgm()
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled
    if (this.sfxGain) {
      this.sfxGain.gain.value = enabled ? this.sfxVolume : 0
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.bgmGain && this.musicEnabled) {
      this.bgmGain.gain.value = this.musicVolume
    }
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    if (this.sfxGain && this.sfxEnabled) {
      this.sfxGain.gain.value = this.sfxVolume
    }
  }

  getMusicVolume(): number {
    return this.musicVolume
  }

  getSfxVolume(): number {
    return this.sfxVolume
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled
  }

  isSfxEnabled(): boolean {
    return this.sfxEnabled
  }

  playFruitCatch() {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.05)
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

    osc.connect(gainNode)
    gainNode.connect(this.sfxGain)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)

    const osc2 = ctx.createOscillator()
    const gainNode2 = ctx.createGain()

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.02)
    osc2.frequency.exponentialRampToValueAtTime(2640, ctx.currentTime + 0.08)

    gainNode2.gain.setValueAtTime(0, ctx.currentTime + 0.02)
    gainNode2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.03)
    gainNode2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    osc2.connect(gainNode2)
    gainNode2.connect(this.sfxGain)

    osc2.start(ctx.currentTime + 0.02)
    osc2.stop(ctx.currentTime + 0.15)
  }

  playBombExplosion() {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return

    const bufferSize = ctx.sampleRate * 0.5
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2)
    }

    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.5, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(this.sfxGain)

    noise.start(ctx.currentTime)
    noise.stop(ctx.currentTime + 0.5)

    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4)

    oscGain.gain.setValueAtTime(0.4, ctx.currentTime)
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

    osc.connect(oscGain)
    oscGain.connect(this.sfxGain)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  }

  playComboMilestone() {
    const ctx = this.ensureContext()
    const sfxGain = this.sfxGain
    if (!ctx || !sfxGain) return

    let currentTime = ctx.currentTime

    this.comboMilestoneFanfare.forEach(({ note, duration }) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(note, currentTime)

      gainNode.gain.setValueAtTime(0, currentTime)
      gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.02)
      gainNode.gain.linearRampToValueAtTime(0.15, currentTime + duration * 0.5)
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration)

      osc.connect(gainNode)
      gainNode.connect(sfxGain)

      osc.start(currentTime)
      osc.stop(currentTime + duration)

      currentTime += duration
    })
  }

  playGameOver() {
    const ctx = this.ensureContext()
    const sfxGain = this.sfxGain
    if (!ctx || !sfxGain) return

    let currentTime = ctx.currentTime

    this.gameOverMelody.forEach(({ note, duration }, index) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(note, currentTime)

      const volume = index === this.gameOverMelody.length - 1 ? 0.3 : 0.25
      gainNode.gain.setValueAtTime(0, currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(volume * 0.8, currentTime + duration * 0.7)
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration)

      osc.connect(gainNode)
      gainNode.connect(sfxGain)

      osc.start(currentTime)
      osc.stop(currentTime + duration)

      currentTime += duration * 0.8
    })
  }

  startBgm() {
    const ctx = this.ensureContext()
    if (!ctx || !this.bgmGain) return

    this.stopBgm()
    this.isBgmPlaying = true
    this.isPaused = false
    this.bgmNoteIndex = 0

    this.playNextBgmNote()
  }

  private playNextBgmNote() {
    const ctx = this.audioContext
    if (!ctx || !this.bgmGain || !this.isBgmPlaying || this.isPaused) return

    const note = this.bgmPattern[this.bgmNoteIndex]
    const currentTime = ctx.currentTime

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(note.note, currentTime)

    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(0.1, currentTime + note.duration * 0.5)
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration)

    osc.connect(gainNode)
    gainNode.connect(this.bgmGain)

    osc.start(currentTime)
    osc.stop(currentTime + note.duration)

    this.bgmOscillators.push(osc)
    this.bgmGainNodes.push(gainNode)

    this.bgmNoteIndex = (this.bgmNoteIndex + 1) % this.bgmPattern.length

    const nextNoteDelay = note.duration * 1000 * 0.7
    this.bgmTimer = window.setTimeout(() => this.playNextBgmNote(), nextNoteDelay)
  }

  pauseBgm() {
    if (!this.isBgmPlaying) return
    this.isPaused = true
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer)
      this.bgmTimer = null
    }
  }

  resumeBgm() {
    if (!this.isBgmPlaying || !this.isPaused) return
    this.isPaused = false
    this.playNextBgmNote()
  }

  stopBgm() {
    this.isBgmPlaying = false
    this.isPaused = false
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer)
      this.bgmTimer = null
    }
    this.bgmOscillators.forEach(osc => {
      try { osc.stop() } catch (e) {}
    })
    this.bgmOscillators = []
    this.bgmGainNodes = []
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }
}

export const audioSystem = new AudioSystem()
