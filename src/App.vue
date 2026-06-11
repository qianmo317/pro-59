<template>
  <div class="app">
    <div class="game-container">
      <GameCanvas />
      
      <HUD v-if="gameStore.isPlaying && !gameStore.isGameOver" />
      
      <StartScreen v-if="!gameStore.isPlaying && !gameStore.isGameOver" />
      
      <GameOverScreen
        v-if="gameStore.isGameOver"
        @restart="handleRestart"
        @menu="handleMenu"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import GameCanvas from './components/GameCanvas.vue'
import HUD from './components/HUD.vue'
import StartScreen from './components/StartScreen.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import { useGameStore } from './stores/game'

const gameStore = useGameStore()

function handleRestart() {
  gameStore.startGame()
}

function handleMenu() {
  gameStore.isGameOver = false
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.game-container {
  position: relative;
  width: 100%;
  max-width: 800px;
}
</style>
