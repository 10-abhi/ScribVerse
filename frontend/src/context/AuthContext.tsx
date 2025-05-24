"use client"

import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from "react"
import { getUserProfile, updateUserProfile, type UserProfile } from "../api"

interface User extends UserProfile {}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  getUserInfo: () => User | null
  refreshUserProfile: () => Promise<void>
  updateProfile: (updates: { name?: string; bio?: string; avatarUrl?: string }) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  })
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const parseJwt = useCallback((token: string): User | null => {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      const payload = JSON.parse(jsonPayload)
      return {
        id: payload.id,
        email: payload.email || "",
        name: payload.name || null,
      }
    } catch (error) {
      console.error("Failed to parse JWT token:", error)
      return null
    }
  }, [])

  const refreshUserProfile = useCallback(async () => {
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      // basic info from token
      const basicUser = parseJwt(token)

      // fetching full profile from API
      const userProfile = await getUserProfile(token)

      if (userProfile) {
        setUser(userProfile)
      } else if (basicUser) {
        // fallback to basic info if the api fails
        setUser(basicUser)
      } else {
        //if both fails logout
        logout()
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error)
      const basicUser = parseJwt(token)
      if (basicUser) {
        setUser(basicUser)
      } else {
        logout()
      }
    } finally {
      setIsLoading(false)
    }
  }, [token, parseJwt])

  const updateProfile = async (updates: { name?: string; bio?: string; avatarUrl?: string }) => {
    if (!token) {
      throw new Error("Authentication required")
    }

    try {
      const updatedProfile = await updateUserProfile(token, updates)
      setUser(updatedProfile)
    } catch (error) {
      console.error("Failed to update profile:", error)
      throw error
    }
  }

  useEffect(() => {
    refreshUserProfile()
  }, [refreshUserProfile])

  const login = (newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken)
    }
    setToken(newToken)
    setIsLoading(true)
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
    setToken(null)
    setUser(null)
  }

  const getUserInfo = () => {
    return user
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        getUserInfo,
        refreshUserProfile,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
