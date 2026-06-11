import Mock from 'mockjs'
import type { FruitType, FallingItem } from '../stores/game'

const fruitTypes: FruitType[] = ['apple', 'orange', 'watermelon', 'grape', 'strawberry']

export interface FruitConfig {
  type: FruitType
  color: string
  score: number
  emoji: string
  name: string
}

export const fruitConfigs: Record<FruitType, FruitConfig> = {
  apple: { type: 'apple', color: '#e74c3c', score: 10, emoji: '🍎', name: '苹果' },
  orange: { type: 'orange', color: '#f39c12', score: 15, emoji: '🍊', name: '橙子' },
  watermelon: { type: 'watermelon', color: '#2ecc71', score: 25, emoji: '🍉', name: '西瓜' },
  grape: { type: 'grape', color: '#9b59b6', score: 20, emoji: '🍇', name: '葡萄' },
  strawberry: { type: 'strawberry', color: '#e91e63', score: 15, emoji: '🍓', name: '草莓' },
  bomb: { type: 'bomb', color: '#2c3e50', score: -50, emoji: '💣', name: '炸弹' }
}

let itemIdCounter = 0

export function createRandomItem(canvasWidth: number, baseSpeed: number): FallingItem {
  const isBomb = Mock.Random.float(0, 100) < 15
  
  if (isBomb) {
    return {
      id: itemIdCounter++,
      type: 'bomb',
      x: Mock.Random.float(40, canvasWidth - 40),
      y: -50,
      speed: baseSpeed * Mock.Random.float(0.8, 1.2),
      rotation: Mock.Random.float(0, Math.PI * 2),
      rotationSpeed: Mock.Random.float(-0.1, 0.1),
      size: 40
    }
  }

  const type = fruitTypes[Mock.Random.integer(0, fruitTypes.length - 1)]
  
  return {
    id: itemIdCounter++,
    type,
    x: Mock.Random.float(40, canvasWidth - 40),
    y: -50,
    speed: baseSpeed * Mock.Random.float(0.7, 1.3),
    rotation: Mock.Random.float(0, Math.PI * 2),
    rotationSpeed: Mock.Random.float(-0.05, 0.05),
    size: Mock.Random.integer(35, 55)
  }
}

export function getFruitConfig(type: FruitType): FruitConfig {
  return fruitConfigs[type]
}

export function resetItemCounter() {
  itemIdCounter = 0
}
