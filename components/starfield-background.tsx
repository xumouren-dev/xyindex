"use client"

import { useEffect, useRef } from "react"

interface Star {
  x: number
  y: number
  z: number
  size: number
  brightness: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface Nebula {
  x: number
  y: number
  radius: number
  color: { r: number; g: number; b: number }
  opacity: number
  speed: number
  angle: number
}

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const starsRef = useRef<Star[]>([])
  const nebulaeRef = useRef<Nebula[]>([])
  const timeRef = useRef(0)

  const initStars = (width: number, height: number) => {
    const stars: Star[] = []
    const numStars = Math.floor((width * height) / 1000)

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random(),
        size: Math.random() * 2,
        brightness: Math.random(),
        twinkleSpeed: 0.0005 + Math.random() * 0.003,
        twinkleOffset: Math.random() * Math.PI * 2,
      })
    }

    starsRef.current = stars
  }

  const initNebulae = (width: number, height: number) => {
    const nebulae: Nebula[] = []
    const colors = [
      { r: 102, g: 126, b: 234 },
      { r: 147, g: 51, b: 234 },
      { r: 234, g: 51, b: 153 },
      { r: 51, g: 153, b: 234 },
      { r: 147, g: 112, b: 219 },
    ]

    for (let i = 0; i < 8; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 200 + Math.random() * 400,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.03 + Math.random() * 0.05,
        speed: 0.00005 + Math.random() * 0.00015,
        angle: Math.random() * Math.PI * 2,
      })
    }

    nebulaeRef.current = nebulae
  }

  const drawGalaxy = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) => {
    const centerX = width / 2
    const centerY = height / 2
    const gradientRadius = Math.max(width, height) * 0.8

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      gradientRadius
    )

    const pulse = Math.sin(time * 0.0003) * 0.02 + 0.1

    gradient.addColorStop(0, `rgba(147, 112, 219, ${pulse})`)
    gradient.addColorStop(0.3, `rgba(72, 61, 139, ${pulse * 0.6})`)
    gradient.addColorStop(0.6, `rgba(25, 25, 112, ${pulse * 0.3})`)
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(Math.PI / 6)
    ctx.translate(-centerX, -centerY)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.restore()
  }

  const drawNebulae = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) => {
    nebulaeRef.current.forEach((nebula) => {
      nebula.x += Math.cos(nebula.angle) * nebula.speed * 10
      nebula.y += Math.sin(nebula.angle) * nebula.speed * 10

      if (nebula.x < -nebula.radius) nebula.x = width + nebula.radius
      if (nebula.x > width + nebula.radius) nebula.x = -nebula.radius
      if (nebula.y < -nebula.radius) nebula.y = height + nebula.radius
      if (nebula.y > height + nebula.radius) nebula.y = -nebula.radius

      const gradient = ctx.createRadialGradient(
        nebula.x,
        nebula.y,
        0,
        nebula.x,
        nebula.y,
        nebula.radius
      )

      const pulse = Math.sin(time * nebula.speed * 10 + nebula.angle) * 0.02
      const opacity = nebula.opacity + pulse

      gradient.addColorStop(
        0,
        `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, ${opacity})`
      )
      gradient.addColorStop(
        0.5,
        `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, ${opacity * 0.3})`
      )
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.fillRect(
        nebula.x - nebula.radius,
        nebula.y - nebula.radius,
        nebula.radius * 2,
        nebula.radius * 2
      )
    })
  }

  const drawStars = (ctx: CanvasRenderingContext2D, time: number) => {
    starsRef.current.forEach((star) => {
      const twinkle =
        (Math.sin(time * star.twinkleSpeed + star.twinkleOffset) + 1) / 2
      const brightness = star.brightness * 0.3 + twinkle * 0.7
      const alpha = brightness * (0.3 + star.z * 0.7)

      const size = star.size * (0.5 + star.z * 1.5)

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`

      if (size > 1.5) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, size / 2, 0, Math.PI * 2)
        ctx.fill()

        if (brightness > 0.8 && star.z > 0.7) {
          const glowGradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            size * 3
          )
          glowGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`)
          glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
          ctx.fillStyle = glowGradient
          ctx.fillRect(
            star.x - size * 3,
            star.y - size * 3,
            size * 6,
            size * 6
          )
        }
      } else {
        ctx.fillRect(star.x, star.y, Math.max(1, size), Math.max(1, size))
      }
    })
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })!
    timeRef.current += 16

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawGalaxy(ctx, canvas.width, canvas.height, timeRef.current)
    drawNebulae(ctx, canvas.width, canvas.height, timeRef.current)
    drawStars(ctx, timeRef.current)

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars(canvas.width, canvas.height)
      initNebulae(canvas.width, canvas.height)
    }

    resizeCanvas()
    animate()

    window.addEventListener("resize", resizeCanvas)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}
