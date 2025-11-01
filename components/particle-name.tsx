"use client"

import { useEffect, useRef } from "react"

interface Vector2D {
  x: number
  y: number
}

interface ParticleNameProps {
  onComplete?: () => void
}

class Particle {
  pos: Vector2D = { x: 0, y: 0 }
  vel: Vector2D = { x: 0, y: 0 }
  acc: Vector2D = { x: 0, y: 0 }
  target: Vector2D = { x: 0, y: 0 }
  baseX = 0
  baseY = 0

  closeEnoughTarget = 200
  maxSpeed = 5.0
  maxForce = 0.5
  particleSize = 10
  isKilled = false
  settled = false
  glitterPhase = 0

  startColor = { r: 0, g: 0, b: 0 }
  targetColor = { r: 0, g: 0, b: 0 }
  colorWeight = 0
  colorBlendRate = 0.02

  move() {
    if (this.settled) return

    let proximityMult = 1
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) +
      Math.pow(this.pos.y - this.target.y, 2)
    )

    if (distance < 2 && this.colorWeight >= 0.98) {
      this.settled = true
      this.pos.x = this.target.x
      this.pos.y = this.target.y
      this.vel.x = 0
      this.vel.y = 0
      this.colorWeight = 1.0
      return
    }

    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    }

    const magnitude = Math.sqrt(
      towardsTarget.x * towardsTarget.x +
      towardsTarget.y * towardsTarget.y
    )

    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    }

    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y)
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce
      steer.y = (steer.y / steerMagnitude) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y

    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0

    // 根据距离动态调整颜色，接近时变亮
    // 使用更大的淡入距离，让粒子在远处就可见
    const fadeDistance = 1200
    if (distance < fadeDistance) {
      const targetWeight = 1 - (distance / fadeDistance)
      // 平滑过渡到目标权重
      this.colorWeight += (targetWeight - this.colorWeight) * 0.1
      this.colorWeight = Math.max(0, Math.min(1, this.colorWeight))
    } else {
      // 即使很远也保持微弱可见
      this.colorWeight = Math.max(this.colorWeight, 0.05)
    }
  }

  draw(ctx: CanvasRenderingContext2D, drawAsPoints: boolean) {
    const currentColor = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    }

    if (drawAsPoints) {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2)
    } else {
      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      const angle = Math.random() * Math.PI * 2
      const mag = (width + height) / 2

      const centerX = width / 2
      const centerY = height / 2
      const exitX = centerX + Math.cos(angle) * mag
      const exitY = centerY + Math.sin(angle) * mag

      this.target.x = exitX
      this.target.y = exitY

      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      }
      this.targetColor = { r: 0, g: 0, b: 0 }
      this.colorWeight = 0

      this.isKilled = true
      this.settled = false
    }
  }
}

export function ParticleName({ onComplete }: ParticleNameProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const completedRef = useRef(false)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const isTouchingRef = useRef(false)

  const pixelSteps = 5
  const drawAsPoints = true

  const generateRandomPos = (canvas: HTMLCanvasElement): Vector2D => {
    // 从屏幕外围随机生成位置，距离更远
    const side = Math.floor(Math.random() * 4)
    const minMargin = 300 // 最小边缘距离
    const maxMargin = 600 // 最大边缘距离
    const margin = minMargin + Math.random() * (maxMargin - minMargin)

    switch (side) {
      case 0: // 顶部
        return {
          x: Math.random() * (canvas.width + margin * 2) - margin,
          y: -margin
        }
      case 1: // 右侧
        return {
          x: canvas.width + margin,
          y: Math.random() * (canvas.height + margin * 2) - margin
        }
      case 2: // 底部
        return {
          x: Math.random() * (canvas.width + margin * 2) - margin,
          y: canvas.height + margin
        }
      default: // 左侧
        return {
          x: -margin,
          y: Math.random() * (canvas.height + margin * 2) - margin
        }
    }
  }

  const createName = (canvas: HTMLCanvasElement) => {
    const offscreenCanvas = document.createElement("canvas")
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height
    const offscreenCtx = offscreenCanvas.getContext("2d")!

    offscreenCtx.fillStyle = "white"
    offscreenCtx.font = "bold 240px Arial"
    offscreenCtx.textAlign = "center"
    offscreenCtx.textBaseline = "middle"
    offscreenCtx.fillText("xuyu", canvas.width / 2, canvas.height / 2)

    const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    const newColor = { r: 255, g: 255, b: 255 }

    const particles = particlesRef.current
    let particleIndex = 0

    const coordsIndexes: number[] = []
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
      coordsIndexes.push(i)
    }

    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]]
    }

    for (const coordIndex of coordsIndexes) {
      const pixelIndex = coordIndex
      const alpha = pixels[pixelIndex + 3]

      if (alpha > 0) {
        const x = (pixelIndex / 4) % canvas.width
        const y = Math.floor(pixelIndex / 4 / canvas.width)

        let particle: Particle

        if (particleIndex < particles.length) {
          particle = particles[particleIndex]
          particle.isKilled = false
          particle.settled = false
          particleIndex++
        } else {
          particle = new Particle()

          const randomPos = generateRandomPos(canvas)
          particle.pos.x = randomPos.x
          particle.pos.y = randomPos.y

          particle.maxSpeed = Math.random() * 8 + 10
          particle.maxForce = particle.maxSpeed * 0.1
          particle.particleSize = Math.random() * 2 + 1.5

          // 设置初始微弱可见颜色
          particle.startColor = { r: 50, g: 50, b: 50 }
          particle.colorWeight = 0.05

          particles.push(particle)
        }

        particle.startColor = {
          r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
          g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
          b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
        }
        particle.targetColor = newColor
        particle.colorWeight = 0

        particle.target.x = x
        particle.target.y = y
        particle.baseX = x
        particle.baseY = y
        particle.glitterPhase = Math.random() * Math.PI * 2
      }
    }

    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const particles = particlesRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { x: mouseX, y: mouseY } = mousePositionRef.current
    const maxDistance = 120

    let settledCount = 0
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]

      if (!particle.settled) {
        particle.move()
      }

      const dx = mouseX - particle.pos.x
      const dy = mouseY - particle.pos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      particle.glitterPhase += 0.05

      if (distance < maxDistance && (isTouchingRef.current || !('ontouchstart' in window))) {
        const force = (maxDistance - distance) / maxDistance
        const angle = Math.atan2(dy, dx)
        const moveX = Math.cos(angle) * force * 30
        const moveY = Math.sin(angle) * force * 30

        particle.pos.x = particle.baseX - moveX
        particle.pos.y = particle.baseY - moveY

        const glitterIntensity = (Math.sin(particle.glitterPhase) + 1) / 2
        const isBlue = Math.sin(particle.glitterPhase * 2) > 0

        if (isBlue) {
          const blueIntensity = Math.floor(135 + glitterIntensity * 120)
          ctx.fillStyle = `rgb(${Math.floor(blueIntensity * 0.6)}, ${Math.floor(blueIntensity * 0.8)}, ${blueIntensity})`
        } else {
          const whiteIntensity = Math.floor(200 + glitterIntensity * 55)
          ctx.fillStyle = `rgb(${whiteIntensity}, ${whiteIntensity}, ${whiteIntensity})`
        }
      } else {
        if (particle.settled) {
          particle.pos.x += (particle.baseX - particle.pos.x) * 0.15
          particle.pos.y += (particle.baseY - particle.pos.y) * 0.15
        }

        const currentColor = {
          r: Math.round(particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight),
          g: Math.round(particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight),
          b: Math.round(particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight),
        }
        ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`
      }

      if (drawAsPoints) {
        const size = particle.particleSize
        ctx.fillRect(particle.pos.x, particle.pos.y, size, size)
      } else {
        ctx.beginPath()
        ctx.arc(particle.pos.x, particle.pos.y, particle.particleSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      const distanceToTarget = Math.sqrt(
        Math.pow(particle.pos.x - particle.target.x, 2) +
        Math.pow(particle.pos.y - particle.target.y, 2)
      )
      if (distanceToTarget < 20) {
        settledCount++
      }

      if (particle.isKilled) {
        if (
          particle.pos.x < 0 ||
          particle.pos.x > canvas.width ||
          particle.pos.y < 0 ||
          particle.pos.y > canvas.height
        ) {
          particles.splice(i, 1)
        }
      }
    }

    // 当95%的粒子到达目标位置时判定为完成
    const completionThreshold = 0.95
    if (settledCount >= particles.length * completionThreshold && !completedRef.current && particles.length > 0) {
      completedRef.current = true
      setTimeout(() => {
        onComplete?.()
      }, 500)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    const handleMove = (x: number, y: number) => {
      const rect = canvas.getBoundingClientRect()
      mousePositionRef.current = { x: x - rect.left, y: y - rect.top }
    }

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault()
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleTouchStart = () => {
      isTouchingRef.current = true
    }

    const handleTouchEnd = () => {
      isTouchingRef.current = false
      mousePositionRef.current = { x: 0, y: 0 }
    }

    const handleMouseLeave = () => {
      if (!('ontouchstart' in window)) {
        mousePositionRef.current = { x: 0, y: 0 }
      }
    }

    resizeCanvas()
    createName(canvas)
    animate()

    const handleResize = () => {
      resizeCanvas()
      createName(canvas)
    }

    window.addEventListener("resize", handleResize)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchend", handleTouchEnd)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  return (
    <div className="w-full h-full absolute inset-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: "transparent", zIndex: 10 }}
      />
    </div>
  )
}
