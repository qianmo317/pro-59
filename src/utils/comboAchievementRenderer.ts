export interface ComboAchievement {
  combo: number
  startTime: number
  duration: number
}

const ACHIEVEMENT_DURATION = 1500

type AchievementStyle = {
  color: string
  shadowColor: string
  gradient?: (ctx: CanvasRenderingContext2D, x: number, y: number, fontSize: number) => CanvasGradient | null
}

function getAchievementStyle(combo: number): AchievementStyle {
  if (combo >= 20) {
    return {
      color: '#FF0000',
      shadowColor: 'rgba(255, 0, 0, 0.6)',
      gradient: (ctx, x, y, fontSize) => {
        const grad = ctx.createLinearGradient(x - fontSize * 2, y, x + fontSize * 2, y)
        grad.addColorStop(0, '#FF0000')
        grad.addColorStop(0.16, '#FF8800')
        grad.addColorStop(0.33, '#FFFF00')
        grad.addColorStop(0.5, '#00FF00')
        grad.addColorStop(0.66, '#0088FF')
        grad.addColorStop(0.83, '#8800FF')
        grad.addColorStop(1, '#FF0088')
        return grad
      }
    }
  }
  if (combo >= 10) {
    return {
      color: '#FF8C00',
      shadowColor: 'rgba(255, 140, 0, 0.6)'
    }
  }
  return {
    color: '#FFD700',
    shadowColor: 'rgba(255, 215, 0, 0.6)'
  }
}

function getScaleProgress(elapsed: number, duration: number): number {
  const t = Math.min(elapsed / duration, 1)
  if (t < 0.2) {
    const p = t / 0.2
    return 0.5 + p * 0.8
  }
  if (t < 0.35) {
    const p = (t - 0.2) / 0.15
    return 1.3 + p * 0.2
  }
  if (t < 0.5) {
    const p = (t - 0.35) / 0.15
    return 1.5 - p * 0.3
  }
  if (t < 0.65) {
    const p = (t - 0.5) / 0.15
    return 1.2 - p * 0.15
  }
  const p = (t - 0.65) / 0.35
  return 1.05 - p * 0.05
}

function getOpacity(elapsed: number, duration: number): number {
  const t = elapsed / duration
  if (t < 0.7) return 1
  return Math.max(0, 1 - (t - 0.7) / 0.3)
}

export function createComboAchievementRenderer() {
  const activeAchievements: ComboAchievement[] = []

  function trigger(combo: number, now: number) {
    activeAchievements.push({
      combo,
      startTime: now,
      duration: ACHIEVEMENT_DURATION
    })
  }

  function render(ctx: CanvasRenderingContext2D, canvasWidth: number, now: number) {
    for (let i = activeAchievements.length - 1; i >= 0; i--) {
      const ach = activeAchievements[i]
      const elapsed = now - ach.startTime
      if (elapsed >= ach.duration) {
        activeAchievements.splice(i, 1)
        continue
      }

      const scale = getScaleProgress(elapsed, ach.duration)
      const opacity = getOpacity(elapsed, ach.duration)
      const style = getAchievementStyle(ach.combo)

      ctx.save()
      ctx.globalAlpha = opacity

      const baseFontSize = 64
      const fontSize = baseFontSize * scale
      const x = canvasWidth / 2
      const y = 120

      ctx.font = `bold ${fontSize}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.shadowColor = style.shadowColor
      ctx.shadowBlur = 20 + (scale - 1) * 30
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      const text = `连击 x${ach.combo}`

      if (style.gradient) {
        const grad = style.gradient(ctx, x, y, fontSize)
        if (grad) {
          ctx.fillStyle = grad
        } else {
          ctx.fillStyle = style.color
        }
      } else {
        ctx.fillStyle = style.color
      }

      ctx.fillText(text, x, y)

      ctx.shadowBlur = 0
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.lineWidth = 2 * scale
      ctx.strokeText(text, x, y)

      ctx.restore()
    }
  }

  function clear() {
    activeAchievements.length = 0
  }

  return { trigger, render, clear }
}
