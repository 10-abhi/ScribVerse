"use client"

import { useEffect, useRef } from "react"

interface SmoothBackgroundProps {
  className?: string
}

const SmoothBackground = ({ className = "" }: SmoothBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create floating elements
    const createFloatingElement = (index: number) => {
      const element = document.createElement("div")
      element.className = "absolute rounded-full pointer-events-none"

      // Random size between 4px and 12px
      const size = Math.random() * 8 + 4
      element.style.width = `${size}px`
      element.style.height = `${size}px`

      // Random position
      element.style.left = `${Math.random() * 100}%`
      element.style.top = `${Math.random() * 100}%`
      index = index;

      // Random color from our palette
      const colors = [
        "rgba(217, 70, 239, 0.1)", // fuchsia
        "rgba(14, 165, 233, 0.1)", // sky
        "rgba(255, 255, 255, 0.05)", // white
      ]
      element.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]

      // Animation properties
      const duration = Math.random() * 20 + 15 // 15-35 seconds
      const delay = Math.random() * 5 // 0-5 seconds delay

      element.style.animation = `smoothFloat ${duration}s ease-in-out infinite`
      element.style.animationDelay = `${delay}s`

      return element
    }

    // Create 15 floating elements
    const elements: HTMLDivElement[] = []
    for (let i = 0; i < 15; i++) {
      const element = createFloatingElement(i)
      elements.push(element)
      container.appendChild(element)
    }

    // Cleanup function
    return () => {
      elements.forEach((element) => {
        if (container.contains(element)) {
          container.removeChild(element)
        }
      })
    }
  }, [])

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/20 via-zinc-900/10 to-sky-900/20"></div>

      {/* Radial gradients for depth */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full filter blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse-slow"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500/5 to-transparent transform rotate-12"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/5 to-transparent transform -rotate-12"></div>
      </div>
    </div>
  )
}

export default SmoothBackground
