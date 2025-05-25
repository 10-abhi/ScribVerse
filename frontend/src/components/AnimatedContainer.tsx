"use client"
import { useEffect, useState, useRef, type ReactNode } from "react"
import { useInView } from "../hooks/useinView"
import { RefObject } from "react"
interface AnimatedContainerProps {
  children: ReactNode
  delay?: number
  className?: string
  animation?: "fade-up" | "fade-in" | "slide-in" | "scale-in" | "none"
}

const AnimatedContainer = ({ children, delay = 0, className = "", animation = "fade-up" }: AnimatedContainerProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const isInView = useInView(ref, { once: true, threshold: 0.1 })
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [isInView, delay])

  const getAnimationClasses = () => {
    if (animation === "none") return ""

    const baseClasses = "transition-all duration-700"

    if (!isVisible) {
      switch (animation) {
        case "fade-up":
          return `${baseClasses} opacity-0 translate-y-10`
        case "fade-in":
          return `${baseClasses} opacity-0`
        case "slide-in":
          return `${baseClasses} opacity-0 -translate-x-10`
        case "scale-in":
          return `${baseClasses} opacity-0 scale-95`
        default:
          return `${baseClasses} opacity-0`
      }
    }

    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`
  }

  return (
    <div ref={ref} className={`${getAnimationClasses()} ${className}`}>
      {children}
    </div>
  )
}

export default AnimatedContainer
