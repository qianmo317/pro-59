<template>
  <div class="game-canvas-wrapper" ref="wrapperRef">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousemove="handleMouseMove"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
    ></canvas>
    <div v-if="showCombo && gameStore.combo >= 3" class="combo-display">
      <span class="combo-text">连击 x{{ gameStore.combo }}</span>
      <span v-if="gameStore.comboMultiplier > 1" class="combo-multiplier">{{ gameStore.comboMultiplier }}x 加分!</span>
    </div>
    <div v-if="lastScore > 0" class="score-popup" :style="scorePopupStyle">
      +{{ lastScore }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useGameStore } from '../stores/game'
import { createRandomItem, getFruitConfig, resetItemCounter } from '../utils/mockData'
import type { FallingItem } from '../stores/game'

const gameStore = useGameStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapperRef = ref<HTMLDivElement | null>(null)
const canvasWidth = ref(800)
const canvasHeight = ref(600)
const items = ref<FallingItem[]>([])
const showCombo = ref(false)
const lastScore = ref(0)
const scorePopupStyle = ref({ left: '0px', top: '0px' })
const scorePopupTimeout = ref<number | null>(null)

let animationId: number | null = null
let lastTime = 0
let spawnTimer = 0
const basketHeight = 60
const basketY = computed(() => canvasHeight.value - basketHeight - 10)

function resizeCanvas() {
  if (wrapperRef.value) {
    const rect = wrapperRef.value.getBoundingClientRect()
    canvasWidth.value = Math.min(800, rect.width)
    canvasHeight.value = Math.min(600, rect.height || 600)
    gameStore.setCanvasSize(canvasWidth.value, canvasHeight.value)
    gameStore.setBasketX(canvasWidth.value / 2)
  }
}

function handleMouseMove(event: MouseEvent) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  gameStore.setBasketX(x)
}

function handleTouchStart(event: TouchEvent) {
  event.preventDefault()
  handleTouchMove(event)
}

function handleTouchMove(event: TouchEvent) {
  event.preventDefault()
  if (!canvasRef.value || event.touches.length === 0) return
  const rect = canvasRef.value.getBoundingClientRect()
  const touch = event.touches[0]
  const x = touch.clientX - rect.left
  gameStore.setBasketX(x)
}

function handleKeyDown(event: KeyboardEvent) {
  if (!gameStore.isPlaying || gameStore.isPaused) return
  const moveSpeed = 25
  if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
    gameStore.setBasketX(gameStore.basketX - moveSpeed)
  } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
    gameStore.setBasketX(gameStore.basketX + moveSpeed)
  } else if (event.key === ' ' || event.key === 'Escape') {
    gameStore.togglePause()
  }
}

function spawnItem() {
  const newItem = createRandomItem(canvasWidth.value, gameStore.baseSpeed)
  items.value.push(newItem)
}

function checkCollision(item: FallingItem): boolean {
  const basketLeft = gameStore.basketX - gameStore.basketWidth / 2
  const basketRight = gameStore.basketX + gameStore.basketWidth / 2
  const basketTop = basketY.value
  const basketBottom = basketY.value + basketHeight

  const itemBottom = item.y + item.size / 2
  const itemLeft = item.x - item.size / 2
  const itemRight = item.x + item.size / 2

  return (
    itemBottom >= basketTop &&
    itemBottom <= basketBottom &&
    itemRight >= basketLeft &&
    itemLeft <= basketRight
  )
}

function updateScorePopup(x: number, y: number) {
  scorePopupStyle.value = {
    left: `${x}px`,
    top: `${y}px`
  }
  if (scorePopupTimeout.value) {
    clearTimeout(scorePopupTimeout.value)
  }
  scorePopupTimeout.value = window.setTimeout(() => {
    lastScore.value = 0
  }, 600)
}

function drawBasket(ctx: CanvasRenderingContext2D) {
  const x = gameStore.basketX
  const w = gameStore.basketWidth
  const h = basketHeight
  const y = basketY.value

  ctx.save()

  const gradient = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y)
  gradient.addColorStop(0, '#8B4513')
  gradient.addColorStop(0.5, '#A0522D')
  gradient.addColorStop(1, '#8B4513')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(x - w / 2, y)
  ctx.quadraticCurveTo(x - w / 2 - 10, y + h / 2, x - w / 2 + 5, y + h)
  ctx.lineTo(x + w / 2 - 5, y + h)
  ctx.quadraticCurveTo(x + w / 2 + 10, y + h / 2, x + w / 2, y)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#654321'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.strokeStyle = '#5D4037'
  ctx.lineWidth = 1
  for (let i = 1; i < 6; i++) {
    const px = x - w / 2 + (w / 6) * i
    ctx.beginPath()
    ctx.moveTo(px, y + 5)
    ctx.lineTo(px, y + h - 5)
    ctx.stroke()
  }

  for (let i = 1; i < 4; i++) {
    const py = y + (h / 4) * i
    ctx.beginPath()
    ctx.moveTo(x - w / 2 + 8, py)
    ctx.lineTo(x + w / 2 - 8, py)
    ctx.stroke()
  }

  ctx.fillStyle = '#228B22'
  ctx.beginPath()
  ctx.ellipse(x, y, w / 2 + 5, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawFallingItem(ctx: CanvasRenderingContext2D, item: FallingItem) {
  const config = getFruitConfig(item.type)
  ctx.save()
  ctx.translate(item.x, item.y)
  ctx.rotate(item.rotation)

  const fontSize = item.size
  ctx.font = `${fontSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(config.emoji, 0, 0)

  ctx.restore()
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight.value)
  gradient.addColorStop(0, '#87CEEB')
  gradient.addColorStop(0.7, '#98D8C8')
  gradient.addColorStop(1, '#7EC8A3')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  const cloudPositions = [
    { x: 100, y: 80, w: 80, h: 40 },
    { x: 300, y: 50, w: 100, h: 50 },
    { x: 550, y: 100, w: 70, h: 35 },
    { x: 680, y: 60, w: 90, h: 45 }
  ]
  
  cloudPositions.forEach(cloud => {
    ctx.beginPath()
    ctx.ellipse(cloud.x, cloud.y, cloud.w / 2, cloud.h / 2, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = '#5D8A5D'
  ctx.fillRect(0, canvasHeight.value - 20, canvasWidth.value, 20)

  ctx.fillStyle = '#4A7A4A'
  for (let i = 0; i < canvasWidth.value; i += 20) {
    ctx.beginPath()
    ctx.moveTo(i, canvasHeight.value - 20)
    ctx.lineTo(i + 5, canvasHeight.value - 30)
    ctx.lineTo(i + 10, canvasHeight.value - 20)
    ctx.fill()
  }
}

function drawPausedOverlay(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('游戏暂停', canvasWidth.value / 2, canvasHeight.value / 2 - 30)

  ctx.font = '24px Arial'
  ctx.fillText('按空格键或点击继续', canvasWidth.value / 2, canvasHeight.value / 2 + 30)
}

function gameLoop(timestamp: number) {
  if (!canvasRef.value || !gameStore.isPlaying) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  if (gameStore.isPaused) {
    drawBackground(ctx)
    items.value.forEach(item => drawFallingItem(ctx, item))
    drawBasket(ctx)
    drawPausedOverlay(ctx)
    animationId = requestAnimationFrame(gameLoop)
    return
  }

  const deltaTime = timestamp - lastTime
  lastTime = timestamp

  gameStore.addGameTime(deltaTime)

  spawnTimer += deltaTime
  if (spawnTimer >= gameStore.spawnRate) {
    spawnItem()
    spawnTimer = 0
  }

  items.value = items.value.filter(item => {
    item.y += item.speed
    item.rotation += item.rotationSpeed

    if (checkCollision(item)) {
      if (item.type === 'bomb') {
        gameStore.loseLife()
      } else {
        const config = getFruitConfig(item.type)
        const score = gameStore.addScore(config.score)
        lastScore.value = score
        updateScorePopup(item.x, item.y)
      }
      return false
    }

    if (item.y > canvasHeight.value + 50) {
      if (item.type !== 'bomb') {
        gameStore.resetCombo()
      }
      return false
    }

    return true
  })

  drawBackground(ctx)
  items.value.forEach(item => drawFallingItem(ctx, item))
  drawBasket(ctx)

  animationId = requestAnimationFrame(gameLoop)
}

function startGameLoop() {
  resetItemCounter()
  items.value = []
  spawnTimer = 0
  lastTime = performance.now()
  animationId = requestAnimationFrame(gameLoop)
}

function stopGameLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

watch(() => gameStore.isPlaying, (playing) => {
  if (playing) {
    startGameLoop()
  } else {
    stopGameLoop()
  }
})

watch(() => gameStore.isPaused, (paused) => {
  if (!paused && gameStore.isPlaying) {
    lastTime = performance.now()
  }
})

onMounted(() => {
  resizeCanvas()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  stopGameLoop()
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.game-canvas-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 600px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

canvas {
  display: block;
  cursor: none;
}

.combo-display {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
  animation: pulse 0.3s ease-out;
}

.combo-text {
  display: block;
  font-size: 36px;
  font-weight: bold;
  color: #FF6B35;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.combo-multiplier {
  display: block;
  font-size: 20px;
  color: #FFD700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.score-popup {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  animation: floatUp 0.6s ease-out forwards;
  transform: translate(-50%, -50%);
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -100%) scale(1.5);
  }
}

@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(0.8);
  }
  50% {
    transform: translateX(-50%) scale(1.2);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}
</style>
