<template>
  <div class="start-screen">
    <div class="start-content">
      <h1 class="game-title">
        <span class="title-fruit">🍎</span>
        接水果大作战
        <span class="title-fruit">🍊</span>
      </h1>
      
      <p class="game-subtitle">接住水果，躲避炸弹！</p>

      <div class="instructions">
        <h3>游戏说明</h3>
        <ul>
          <li>🖱️ <strong>鼠标移动</strong> 控制篮子左右移动</li>
          <li>⌨️ <strong>方向键</strong> 或 <strong>A/D 键</strong> 控制篮子</li>
          <li>📱 <strong>触摸滑动</strong> 控制篮子（移动端）</li>
          <li>⏸️ <strong>空格键</strong> 或 <strong>ESC</strong> 暂停游戏</li>
        </ul>
      </div>

      <div class="fruit-legend">
        <h3>水果分值</h3>
        <div class="legend-grid">
          <div class="legend-item">
            <span class="emoji">🍎</span>
            <span class="score">10分</span>
          </div>
          <div class="legend-item">
            <span class="emoji">🍊</span>
            <span class="score">15分</span>
          </div>
          <div class="legend-item">
            <span class="emoji">🍓</span>
            <span class="score">15分</span>
          </div>
          <div class="legend-item">
            <span class="emoji">🍇</span>
            <span class="score">20分</span>
          </div>
          <div class="legend-item">
            <span class="emoji">🍉</span>
            <span class="score">25分</span>
          </div>
          <div class="legend-item bomb">
            <span class="emoji">💣</span>
            <span class="score">-1❤️</span>
          </div>
        </div>
      </div>

      <div class="combo-tip">
        <p>💡 连续接住水果可触发连击加分！</p>
      </div>

      <button class="start-btn" @click="startGame">
        开始游戏
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../stores/game'

const gameStore = useGameStore()

function startGame() {
  gameStore.startGame()
}
</script>

<style scoped>
.start-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 100;
}

.start-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 24px;
  text-align: center;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.5s ease-out;
}

.game-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-fruit {
  font-size: 36px;
  animation: bounce 1s ease-in-out infinite;
}

.title-fruit:last-child {
  animation-delay: 0.5s;
}

.game-subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.instructions,
.fruit-legend {
  text-align: left;
  margin-bottom: 25px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.instructions h3,
.fruit-legend h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.instructions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instructions li {
  font-size: 14px;
  color: #555;
  padding: 6px 0;
}

.instructions strong {
  color: #667eea;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 8px;
  transition: transform 0.2s;
}

.legend-item:hover {
  transform: scale(1.1);
}

.legend-item.bomb {
  background: #ffebee;
}

.legend-item .emoji {
  font-size: 28px;
}

.legend-item .score {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.combo-tip {
  background: linear-gradient(135deg, #FF6B35, #FF8C00);
  padding: 12px 20px;
  border-radius: 10px;
  margin-bottom: 25px;
}

.combo-tip p {
  color: white;
  font-size: 14px;
  margin: 0;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 48px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

.start-btn:active {
  transform: translateY(-1px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
