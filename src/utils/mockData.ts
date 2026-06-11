import Mock from 'mockjs'
import type { FruitType, FallingItem } from '../stores/game'

const fruitTypes: FruitType[] = ['apple', 'orange', 'watermelon', 'grape', 'strawberry']

export interface FruitConfig {
  type: FruitType
  color: string
  score: number
  emoji: string
  name: string
  rarity?: 'common' | 'rare' | 'legendary'
  effect?: 'none' | 'freeze' | 'split'
}

export const fruitConfigs: Record<FruitType, FruitConfig> = {
  apple: { type: 'apple', color: '#e74c3c', score: 10, emoji: '🍎', name: '苹果', rarity: 'common', effect: 'none' },
  orange: { type: 'orange', color: '#f39c12', score: 15, emoji: '🍊', name: '橙子', rarity: 'common', effect: 'none' },
  watermelon: { type: 'watermelon', color: '#2ecc71', score: 25, emoji: '🍉', name: '西瓜', rarity: 'common', effect: 'none' },
  grape: { type: 'grape', color: '#9b59b6', score: 20, emoji: '🍇', name: '葡萄', rarity: 'common', effect: 'none' },
  strawberry: { type: 'strawberry', color: '#e91e63', score: 15, emoji: '🍓', name: '草莓', rarity: 'common', effect: 'none' },
  bomb: { type: 'bomb', color: '#2c3e50', score: -50, emoji: '💣', name: '炸弹', rarity: 'common', effect: 'none' },
  golden: { type: 'golden', color: '#FFD700', score: 100, emoji: '🌟', name: '金色水果', rarity: 'legendary', effect: 'none' },
  ice: { type: 'ice', color: '#00CED1', score: 20, emoji: '❄️', name: '冰冻水果', rarity: 'rare', effect: 'freeze' },
  split: { type: 'split', color: '#FF69B4', score: 15, emoji: '🍬', name: '分裂水果', rarity: 'rare', effect: 'split' }
}

let itemIdCounter = 0

export function createRandomItem(canvasWidth: number, baseSpeed: number, bombProbability: number = 15): FallingItem {
  const rand = Mock.Random.float(0, 100)
  
  if (rand < bombProbability) {
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
  
  const specialRand = Mock.Random.float(0, 100)
  if (specialRand < 2) {
    return {
      id: itemIdCounter++,
      type: 'golden',
      x: Mock.Random.float(40, canvasWidth - 40),
      y: -50,
      speed: baseSpeed * Mock.Random.float(0.9, 1.1),
      rotation: Mock.Random.float(0, Math.PI * 2),
      rotationSpeed: Mock.Random.float(-0.03, 0.03),
      size: 50
    }
  }
  
  if (specialRand < 7) {
    return {
      id: itemIdCounter++,
      type: 'ice',
      x: Mock.Random.float(40, canvasWidth - 40),
      y: -50,
      speed: baseSpeed * Mock.Random.float(0.8, 1.2),
      rotation: Mock.Random.float(0, Math.PI * 2),
      rotationSpeed: Mock.Random.float(-0.04, 0.04),
      size: 45
    }
  }
  
  if (specialRand < 12) {
    return {
      id: itemIdCounter++,
      type: 'split',
      x: Mock.Random.float(40, canvasWidth - 40),
      y: -50,
      speed: baseSpeed * Mock.Random.float(0.8, 1.2),
      rotation: Mock.Random.float(0, Math.PI * 2),
      rotationSpeed: Mock.Random.float(-0.04, 0.04),
      size: 48
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

export function createMiniFruit(x: number, y: number, vx: number, vy: number): FallingItem {
  const type = fruitTypes[Mock.Random.integer(0, fruitTypes.length - 1)]
  return {
    id: itemIdCounter++,
    type,
    x,
    y,
    speed: 0,
    rotation: Mock.Random.float(0, Math.PI * 2),
    rotationSpeed: Mock.Random.float(-0.1, 0.1),
    size: 25,
    isMini: true,
    vx,
    vy
  }
}

export function getFruitConfig(type: FruitType): FruitConfig {
  return fruitConfigs[type]
}

export function resetItemCounter() {
  itemIdCounter = 0
}
