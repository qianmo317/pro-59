export interface BasketGlowState {
  combo: number
  enabled: boolean
}

const GLOW_THRESHOLD = 10

function getGlowIntensity(combo: number): number {
  if (combo < GLOW_THRESHOLD) return 0
  return Math.min(1, (combo - GLOW_THRESHOLD + 1) / 15)
}

function getGlowColor(intensity: number, time: number): string {
  const hue = (time * 0.05) % 360
  const alpha = intensity * 0.6
  return `hsla(${hue}, 100%, 60%, ${alpha})`
}

function getGlowRadius(intensity: number): number {
  return 15 + intensity * 40
}

export function createBasketGlowRenderer() {
  let animTime = 0

  function update(deltaTime: number) {
    animTime += deltaTime
  }

  function render(
    ctx: CanvasRenderingContext2D,
    basketX: number,
    basketY: number,
    basketWidth: number,
    basketHeight: number,
    combo: number
  ) {
    if (combo < GLOW_THRESHOLD) return

    const intensity = getGlowIntensity(combo)
    const glowRadius = getGlowRadius(intensity)

    ctx.save()

    const cx = basketX
    const cy = basketY + basketHeight / 2

    const gradient = ctx.createRadialGradient(
      cx, cy, basketWidth / 2,
      cx, cy, basketWidth / 2 + glowRadius
    )

    const color1 = getGlowColor(intensity, animTime)
    const color2 = getGlowColor(intensity, animTime + 120)
    const color3 = getGlowColor(intensity, animTime + 240)

    gradient.addColorStop(0, color1)
    gradient.addColorStop(0.4, color2)
    gradient.addColorStop(0.7, color3)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(cx, cy, basketWidth / 2 + glowRadius, basketHeight / 2 + glowRadius, 0, 0, Math.PI * 2)
    ctx.fill()

    const innerGlow = ctx.createRadialGradient(
      cx, basketY, 0,
      cx, basketY, basketWidth / 2 + 10
    )
    const innerAlpha = intensity * 0.4 * (0.7 + 0.3 * Math.sin(animTime * 0.005))
    innerGlow.addColorStop(0, `rgba(255, 255, 200, ${innerAlpha})`)
    innerGlow.addColorStop(0.5, `rgba(255, 200, 100, ${innerAlpha * 0.5})`)
    innerGlow.addColorStop(1, 'rgba(255, 200, 100, 0)')

    ctx.fillStyle = innerGlow
    ctx.beginPath()
    ctx.ellipse(cx, basketY, basketWidth / 2 + 10, 20 + intensity * 15, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  function reset() {
    animTime = 0
  }

  return { update, render, reset }
}
