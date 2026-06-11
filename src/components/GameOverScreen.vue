<template>
  <div class="game-over-screen">
    <div class="game-over-content">
      <h1 class="game-over-title">🎮 游戏结束</h1>
      
      <div class="final-score">
        <span class="score-label">最终得分</span>
        <span class="score-value">{{ gameStore.score }}</span>
      </div>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-emoji">🍎</span>
          <span class="stat-label">接住水果</span>
          <span class="stat-value">{{ gameStore.itemsCaught }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-emoji">💣</span>
          <span class="stat-label">被炸弹击中</span>
          <span class="stat-value">{{ gameStore.bombsHit }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-emoji">🔥</span>
          <span class="stat-label">最高连击</span>
          <span class="stat-value">{{ gameStore.maxCombo }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-emoji">⭐</span>
          <span class="stat-label">最高关卡</span>
          <span class="stat-value">{{ gameStore.level }}</span>
        </div>
      </div>

      <div class="time-display">
        <span class="time-label">游戏时长</span>
        <span class="time-value">{{ formatTime(gameStore.gameTime) }}</span>
      </div>

      <div class="action-buttons">
        <button class="restart-btn" @click="restartGame">
          🔄 再玩一次
        </button>
        <button class="menu-btn" @click="goToMenu">
          🏠 返回主菜单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'

const emit = defineEmits<{
  (e: 'restart'): void
  (e: 'menu'): void
}>()

const gameStore = useGameStore()

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function restartGame() {
  emit('restart')
}

function goToMenu() {
  emit('menu')
}
</script>

<style scoped>
.game-over-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
  z-index: 100;
}

.game-over-content {
  background: rgba(255, 255, 255, 0.98);
  padding: 40px;
  border-radius: 24px;
  text-align: center;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.5s ease-out;
}

.game-over-title {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.final-score {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 25px;
}

.score-label {
  display: block;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.score-value {
  display: block;
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 25px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-item:hover {
  transform: scale(1.05);
}

.stat-emoji {
  font-size: 28px;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.time-display {
  background: #f0f0f0;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 25px;
}

.time-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.time-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  font-family: monospace;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.restart-btn,
.menu-btn {
  border: none;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restart-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.restart-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.5);
}

.menu-btn {
  background: #f5f5f5;
  color: #666;
  border: 2px solid #e0e0e0;
}

.menu-btn:hover {
  background: #e8e8e8;
  transform: translateY(-2px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
