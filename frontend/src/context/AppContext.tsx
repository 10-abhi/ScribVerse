"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"

interface AppContextType {
  isAppReady: boolean
  setAppReady: (ready: boolean) => void
  isPageLoading: boolean
  setPageLoading: (loading: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isAppReady, setIsAppReady] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  // set app as ready after the initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const setAppReady = (ready: boolean) => {
    setIsAppReady(ready)
  }

  const setPageLoading = (loading: boolean) => {
    setIsPageLoading(loading)
  }

  return (
    <AppContext.Provider
      value={{
        isAppReady,
        setAppReady,
        isPageLoading,
        setPageLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
