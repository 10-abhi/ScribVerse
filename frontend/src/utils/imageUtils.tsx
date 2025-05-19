import type React from "react"

/**
 * Generates a CSS gradient background for a blog post
 * @param id The blog post ID or any unique identifier
 * @returns CSS gradient string
 */
export const generateGradientBackground = (id: number | string): string => {
  // Convert id to a number if it's a string
  const numericId = typeof id === "string" ? Number.parseInt(id, 10) || hashString(id) : id

  // Use the ID to generate consistent but different colors for each blog
  const hue1 = (numericId * 137) % 360
  const hue2 = (numericId * 271) % 360

  return `linear-gradient(135deg, hsl(${hue1}, 70%, 35%) 0%, hsl(${hue2}, 70%, 45%) 100%)`
}

/**
 * Handles image loading errors by replacing with a gradient background
 * @param event The error event
 * @param id The blog post ID or any unique identifier
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, id: number | string): void => {
  const img = event.currentTarget

  // Apply a gradient background as fallback
  const gradient = generateGradientBackground(id)
  img.style.background = gradient

  // Create a data URL with the gradient (this prevents additional HTTP requests)
  createGradientDataUrl(gradient, img.width || 800, img.height || 400).then((dataUrl) => {
    img.src = dataUrl
  })

  img.style.objectFit = "cover"
}

/**
 * Creates a data URL containing a gradient
 * @param gradient CSS gradient string
 * @param width Width of the image
 * @param height Height of the image
 * @returns Promise resolving to a data URL
 */
export const createGradientDataUrl = async (gradient: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Create a gradient background
      const gradientObj = ctx.createLinearGradient(0, 0, width, height)
      gradientObj.addColorStop(0, `hsl(${(hashString(gradient) * 137) % 360}, 70%, 35%)`)
      gradientObj.addColorStop(1, `hsl(${(hashString(gradient) * 271) % 360}, 70%, 45%)`)

      ctx.fillStyle = gradientObj
      ctx.fillRect(0, 0, width, height)

      // Add some visual interest with a pattern
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)"
      for (let i = 0; i < width; i += 20) {
        ctx.fillRect(i, 0, 10, height)
      }

      // Add a subtle glow in the center
      const radialGradient = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width / 2)
      radialGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)")
      radialGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
      ctx.fillStyle = radialGradient
      ctx.fillRect(0, 0, width, height)

      resolve(canvas.toDataURL("image/png"))
    } else {
      // Fallback to a simple colored data URL if canvas is not supported
      resolve(
        `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23333'/%3E%3C/svg%3E`,
      )
    }
  })
}

/**
 * Simple hash function for strings
 * @param str String to hash
 * @returns A numeric hash
 */
const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Generates initials from a name
 * @param name Full name
 * @returns Initials (up to 2 characters)
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?"

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generates a data URL for a user avatar with initials
 * @param initials User initials
 * @param size Size of the avatar
 * @param id Unique identifier for consistent colors
 * @returns Data URL for the avatar
 */
export const generateAvatarDataUrl = (initials: string, size = 200, id: number | string = Math.random()): string => {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return ""
  }

  // Generate a consistent background color based on the id
  const numericId = typeof id === "string" ? hashString(id) : id
  const hue = (numericId * 137) % 360

  // Draw background
  ctx.fillStyle = `hsl(${hue}, 70%, 40%)`
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()

  // Draw text
  ctx.fillStyle = "white"
  ctx.font = `bold ${size / 2}px sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(initials, size / 2, size / 2)

  return canvas.toDataURL("image/png")
}
