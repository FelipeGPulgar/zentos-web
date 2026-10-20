'use client'

import { useEffect, useRef } from 'react'

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animationId = 0
    let stars: { x: number; y: number; r: number; a: number; tw: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = Math.min(160, Math.floor((canvas.width * canvas.height) / 12000))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.005,
      }))
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        const alpha = reducedMotion ? s.a : s.a + Math.sin(t * s.tw * 60) * 0.2
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.05, alpha)})`
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      t += 1
      if (!reducedMotion) animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-accent-500/10 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-[380px] w-[480px] rounded-full bg-indigo-500/5 blur-[120px]" />
    </div>
  )
}
