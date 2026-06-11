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
import { useAudioStore } from '../stores/audio'
import { createRandomItem, getFruitConfig, resetItemCounter, createMiniFruit } from '../utils/mockData'
import { createComboAchievementRenderer } from '../utils/comboAchievementRenderer'
import { createBasketGlowRenderer } from '../utils/basketGlowRenderer'
import type { FallingItem } from '../stores/game'

const gameStore = useGameStore()
const audioStore = useAudioStore()

const comboAchievementRenderer = createComboAchievementRenderer()
const basketGlowRenderer = createBasketGlowRenderer()

const comboMilestones = [5, 10, 15, 20]
let lastMilestoneCombo = 0

const canvasRef = ref<HTMLCanvasElement | null>(null)
const wrapperRef = ref<HTMLDivElement | null>(null)
const canvasWidth = ref(800)
const canvasHeight = ref(600)
const items = ref<FallingItem[]>([])
const showCombo = ref(false)
const lastScore = ref(0)
const scorePopupStyle = ref({ left: '0px', top: '0px' })
const scorePopupTimeout = ref<number | null>(null)

const comboBreakVisible = ref(false)
const comboBreakCombo = ref(0)
const comboBreakScore = ref(0)
let comboBreakTimeout: number | null = null

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
  const newItem = createRandomItem(canvasWidth.value, gameStore.baseSpeed, gameStore.bombProbability)
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

let goldenPulseTime = 0

function drawFallingItem(ctx: CanvasRenderingContext2D, item: FallingItem) {
  const config = getFruitConfig(item.type)
  ctx.save()
  ctx.translate(item.x, item.y)
  ctx.rotate(item.rotation)

  if (item.type === 'golden') {
    const pulseScale = 1 + Math.sin(goldenPulseTime * 0.008) * 0.15
    const glowSize = item.size * 0.8 * pulseScale
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize)
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)')
    gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = `${item.size * 0.3}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const sparkleAngle = goldenPulseTime * 0.005
    for (let i = 0; i < 4; i++) {
      const angle = sparkleAngle + (i * Math.PI / 2)
      const dist = item.size * 0.5 * pulseScale
      const sx = Math.cos(angle) * dist
      const sy = Math.sin(angle) * dist
      ctx.fillText('✨', sx, sy)
    }
  }

  if (item.type === 'ice') {
    const glowSize = item.size * 0.7
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize)
    gradient.addColorStop(0, 'rgba(0, 206, 209, 0.6)')
    gradient.addColorStop(0.6, 'rgba(0, 206, 209, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 206, 209, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
    ctx.fill()
  }

  if (item.type === 'split') {
    const glowSize = item.size * 0.6
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize)
    gradient.addColorStop(0, 'rgba(255, 105, 180, 0.5)')
    gradient.addColorStop(1, 'rgba(255, 105, 180, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
    ctx.fill()
  }

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

function showComboBreak() {
  const combo = gameStore.lastComboCount
  const score = gameStore.lastComboScore
  if (combo < 3) return

  comboBreakCombo.value = combo
  comboBreakScore.value = score
  comboBreakVisible.value = true

  if (comboBreakTimeout) {
    clearTimeout(comboBreakTimeout)
  }
  comboBreakTimeout = window.setTimeout(() => {
    comboBreakVisible.value = false
  }, 2000)
}

function drawComboBreak(ctx: CanvasRenderingContext2D) {
  ctx.save()

  const cx = canvasWidth.value / 2
  const cy = canvasHeight.value / 2 - 40

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  const bgW = 280
  const bgH = 90
  const bgR = 16
  ctx.beginPath()
  ctx.moveTo(cx - bgW / 2 + bgR, cy - bgH / 2)
  ctx.lineTo(cx + bgW / 2 - bgR, cy - bgH / 2)
  ctx.quadraticCurveTo(cx + bgW / 2, cy - bgH / 2, cx + bgW / 2, cy - bgH / 2 + bgR)
  ctx.lineTo(cx + bgW / 2, cy + bgH / 2 - bgR)
  ctx.quadraticCurveTo(cx + bgW / 2, cy + bgH / 2, cx + bgW / 2 - bgR, cy + bgH / 2)
  ctx.lineTo(cx - bgW / 2 + bgR, cy + bgH / 2)
  ctx.quadraticCurveTo(cx - bgW / 2, cy + bgH / 2, cx - bgW / 2, cy + bgH / 2 - bgR)
  ctx.lineTo(cx - bgW / 2, cy - bgH / 2 + bgR)
  ctx.quadraticCurveTo(cx - bgW / 2, cy - bgH / 2, cx - bgW / 2 + bgR, cy - bgH / 2)
  ctx.closePath()
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.font = 'bold 28px Arial, sans-serif'
  ctx.fillStyle = '#999'
  ctx.fillText('连击终结', cx, cy - 14)

  ctx.font = '20px Arial, sans-serif'
  ctx.fillStyle = '#BBB'
  ctx.fillText(`${comboBreakCombo.value}连击 · 得分 ${comboBreakScore.value}`, cx, cy + 20)

  ctx.restore()
}

const gravity = 0.15

function handleItemCatch(item: FallingItem) {
  if (item.type === 'bomb') {
    gameStore.loseLife()
    audioStore.playBombExplosion()
    showComboBreak()
    lastMilestoneCombo = 0
    return
  }

  const config = getFruitConfig(item.type)
  const score = gameStore.addScore(config.score)
  lastScore.value = score
  updateScorePopup(item.x, item.y)
  audioStore.playFruitCatch()

  const currentCombo = gameStore.combo
  for (const milestone of comboMilestones) {
    if (currentCombo >= milestone && lastMilestoneCombo < milestone) {
      audioStore.playComboMilestone()
      lastMilestoneCombo = milestone
      comboAchievementRenderer.trigger(milestone, performance.now())
      break
    }
  }

  if (config.effect === 'freeze') {
    gameStore.triggerFreeze(1000)
  }

  if (config.effect === 'split') {
    const basketPosX = gameStore.basketX
    const basketPosY = basketY.value
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI / 2 + (i - 1) * 0.4
      const speed = 5 + Math.random() * 2
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
      const miniFruit = createMiniFruit(basketPosX, basketPosY - 10, vx, vy)
      items.value.push(miniFruit)
    }
  }
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

  goldenPulseTime += deltaTime

  gameStore.addGameTime(deltaTime)
  gameStore.updateFreeze(deltaTime)

  if (!gameStore.isFrozen) {
    spawnTimer += deltaTime
    if (spawnTimer >= gameStore.spawnRate) {
      spawnItem()
      spawnTimer = 0
    }
  }

  items.value = items.value.filter(item => {
    if (!gameStore.isFrozen) {
      if (item.isMini && item.vy !== undefined && item.vx !== undefined) {
        item.vy += gravity
        item.x += item.vx
        item.y += item.vy
      } else {
        item.y += item.speed
      }
      item.rotation += item.rotationSpeed
    }

    if (checkCollision(item)) {
      handleItemCatch(item)
      return false
    }

    if (item.y > canvasHeight.value + 50) {
      if (item.type !== 'bomb') {
        gameStore.resetCombo()
        showComboBreak()
        lastMilestoneCombo = 0
      }
      return false
    }

    if (item.isMini && item.y < -50) {
      return false
    }

    return true
  })

  drawBackground(ctx)
  
  if (gameStore.isFrozen) {
    ctx.fillStyle = 'rgba(173, 216, 230, 0.3)'
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 2
    const icePatternSize = 30
    for (let x = 0; x < canvasWidth.value; x += icePatternSize * 2) {
      for (let y = 0; y < canvasHeight.value; y += icePatternSize * 2) {
        ctx.beginPath()
        ctx.moveTo(x, y - 5)
        ctx.lineTo(x, y + 5)
        ctx.moveTo(x - 5, y)
        ctx.lineTo(x + 5, y)
        ctx.stroke()
      }
    }
  }
  
  items.value.forEach(item => drawFallingItem(ctx, item))

  basketGlowRenderer.update(deltaTime)
  basketGlowRenderer.render(ctx, gameStore.basketX, basketY.value, gameStore.basketWidth, basketHeight, gameStore.combo)
  drawBasket(ctx)

  comboAchievementRenderer.render(ctx, canvasWidth.value, performance.now())

  if (comboBreakVisible.value) {
    drawComboBreak(ctx)
  }

  animationId = requestAnimationFrame(gameLoop)
}

function startGameLoop() {
  resetItemCounter()
  items.value = []
  spawnTimer = 0
  lastMilestoneCombo = 0
  lastTime = performance.now()
  goldenPulseTime = 0
  comboAchievementRenderer.clear()
  basketGlowRenderer.reset()
  comboBreakVisible.value = false
  animationId = requestAnimationFrame(gameLoop)
  audioStore.startBgm()
}

function stopGameLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  audioStore.stopBgm()
}

watch(() => gameStore.isPlaying, (playing) => {
  if (playing) {
    startGameLoop()
  } else {
    stopGameLoop()
  }
})

watch(() => gameStore.isPaused, (paused) => {
  if (paused) {
    audioStore.pauseBgm()
  } else if (gameStore.isPlaying) {
    lastTime = performance.now()
    audioStore.resumeBgm()
  }
})

watch(() => gameStore.isGameOver, (gameOver) => {
  if (gameOver) {
    audioStore.stopBgm()
    audioStore.playGameOver()
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
