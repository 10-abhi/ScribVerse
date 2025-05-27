"use client"

import { useEffect, useState } from "react"

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large"
  text?: string
  fullScreen?: boolean
}

const LoadingSpinner = ({ size = "medium", text = "Loading...", fullScreen = false }: LoadingSpinnerProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    large: "w-24 h-24",
  }

  const containerClasses = fullScreen
    ? "fixed inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
    : "flex flex-col items-center justify-center py-8"

  return (
    <div className={containerClasses}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(217,70,239,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Main spinner container */}
        <div className="relative">
          {/* Outer ring */}
          <div className={`${sizeClasses[size]} relative`}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-100 ease-out"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d946ef" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Inner spinning element */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-6 h-6 bg-gradient-to-r from-fuchsia-500 to-sky-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-fuchsia-500 to-sky-500 rounded-full blur-sm animate-pulse"></div>
            </div>
          </div>

          {/* Rotating dots */}
          <div className="absolute inset-0 animate-spin-slow">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-fuchsia-400 rounded-full"
                style={{
                  top: "10%",
                  left: "50%",
                  transformOrigin: "0 200%",
                  transform: `rotate(${i * 120}deg) translateX(-50%)`,
                  opacity: 0.6 + i * 0.2,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Text with better animation */}
        {text && (
          <div className="mt-8 text-center">
            <div className="relative">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
                {text}
              </h3>
              <div className="mt-2 flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: "1s",
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress percentage */}
        <div className="mt-4 text-sm text-zinc-400 font-mono">{Math.round(progress)}%</div>
      </div>
    </div>
  )
}

export default LoadingSpinner
