import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type FruitType = 'apple' | 'orange' | 'watermelon' | 'grape' | 'strawberry' | 'bomb'

export interface FallingItem {
  id: number
  type: FruitType
  x: number
  y: number
  speed: number
  rotation: number
  rotationSpeed: number
  size: number
}

export interface GameState {
  score: number
  lives: number
  maxLives: number
  combo: number
  maxCombo: number
  itemsCaught: number
  bombsHit: number
  isPlaying: boolean
  isGameOver: boolean
  isPaused: boolean
  level: number
  gameTime: number
}

export const useGameStore = defineStore('game', () => {
  const score = ref(0)
  const lives = ref(3)
  const maxLives = ref(3)
  const combo = ref(0)
  const maxCombo = ref(0)
  const itemsCaught = ref(0)
  const bombsHit = ref(0)
  const isPlaying = ref(false)
  const isGameOver = ref(false)
  const isPaused = ref(false)
  const level = ref(1)
  const gameTime = ref(0)
  const basketX = ref(0)
  const basketWidth = ref(100)
  const canvasWidth = ref(800)
  const canvasHeight = ref(600)

  const comboMultiplier = computed(() => {
    if (combo.value >= 20) return 4
    if (combo.value >= 15) return 3
    if (combo.value >= 10) return 2.5
    if (combo.value >= 5) return 2
    if (combo.value >= 3) return 1.5
    return 1
  })

  const baseSpeed = computed(() => {
    return 2 + level.value * 0.3
  })

  const spawnRate = computed(() => {
    return Math.max(400, 1200 - level.value * 80)
  })

  function startGame() {
    score.value = 0
    lives.value = 3
    combo.value = 0
    maxCombo.value = 0
    itemsCaught.value = 0
    bombsHit.value = 0
    isPlaying.value = true
    isGameOver.value = false
    isPaused.value = false
    level.value = 1
    gameTime.value = 0
  }

  function addScore(baseScore: number) {
    combo.value++
    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value
    }
    const finalScore = Math.round(baseScore * comboMultiplier.value)
    score.value += finalScore
    itemsCaught.value++
    updateLevel()
    return finalScore
  }

  function resetCombo() {
    combo.value = 0
  }

  function loseLife() {
    lives.value--
    bombsHit.value++
    combo.value = 0
    if (lives.value <= 0) {
      isGameOver.value = true
      isPlaying.value = false
    }
  }

  function updateLevel() {
    const newLevel = Math.floor(itemsCaught.value / 10) + 1
    if (newLevel > level.value) {
      level.value = newLevel
    }
  }

  function addGameTime(delta: number) {
    gameTime.value += delta
  }

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function setBasketX(x: number) {
    const halfBasket = basketWidth.value / 2
    if (x < halfBasket) {
      basketX.value = halfBasket
    } else if (x > canvasWidth.value - halfBasket) {
      basketX.value = canvasWidth.value - halfBasket
    } else {
      basketX.value = x
    }
  }

  function setCanvasSize(width: number, height: number) {
    canvasWidth.value = width
    canvasHeight.value = height
  }

  return {
    score,
    lives,
    maxLives,
    combo,
    maxCombo,
    itemsCaught,
    bombsHit,
    isPlaying,
    isGameOver,
    isPaused,
    level,
    gameTime,
    basketX,
    basketWidth,
    canvasWidth,
    canvasHeight,
    comboMultiplier,
    baseSpeed,
    spawnRate,
    startGame,
    addScore,
    resetCombo,
    loseLife,
    updateLevel,
    addGameTime,
    togglePause,
    setBasketX,
    setCanvasSize
  }
})
