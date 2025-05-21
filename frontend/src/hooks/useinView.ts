"use client"

import { useState, useEffect, type RefObject } from "react"

interface UseInViewOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export function useInView(
  elementRef: RefObject<Element>,
  { root = null, rootMargin = "0px", threshold = 0, once = false }: UseInViewOptions = {},
): boolean {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)

        // If once is true and the element is intersecting,
        // disconnect the observer after the element comes into view
        if (once && entry.isIntersecting) {
          observer.disconnect()
        }
      },
      { root, rootMargin, threshold },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [elementRef, root, rootMargin, threshold, once])

  return isIntersecting
}
