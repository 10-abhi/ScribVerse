"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, User, Mail, Lock } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { signIn, signUp } from "../api"
import { useNavigate } from "react-router-dom"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchMode: () => void
  mode: "signin" | "signup"
}

const AuthModal = ({ isOpen, onClose, onSwitchMode, mode }: AuthModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  //resetting form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        password: "",
      })
      setError("")
      setRememberMe(false)
      setTermsAccepted(false)
    }
  }, [isOpen, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    //validating inputs 
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!formData.password.trim()) {
      setError("Password is required")
      return
    }

    if (mode === "signup") {
      if (!formData.name.trim()) {
        setError("Name is required")
        return
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long")
        return
      }

      if (!termsAccepted) {
        setError("You must accept the terms and conditions")
        return
      }
    }

    setLoading(true)

    try {
      if (mode === "signin") {
        const data = await signIn(formData.email, formData.password)
        if (data.jwt) {
          login(data.jwt)
          onClose()
          navigate("/blogs")
        } else {
          throw new Error("Invalid response from server")
        }
      } else {
        const data = await signUp(formData.name, formData.email, formData.password)
        if (data.jwt) {
          login(data.jwt)
          onClose()
          navigate("/blogs")
        } else {
          throw new Error("Invalid response from server")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-zinc-900/75 transition-opacity" aria-hidden="true"></div>

        <div className="relative inline-block align-bottom bg-zinc-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button type="button" onClick={onClose} className="text-zinc-400 hover:text-zinc-300" aria-label="Close">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="bg-zinc-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-white text-center" id="modal-title">
                  {mode === "signin" ? "Sign In to ScribVerse" : "Create your ScribVerse Account"}
                </h3>
                {error && (
                  <div className="mt-2 p-2 bg-red-900/50 text-red-200 rounded text-sm text-center">{error}</div>
                )}
                <div className="mt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {mode === "signup" && (
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                          Full name
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-zinc-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            className="bg-zinc-700 block w-full pl-10 pr-3 py-2 border border-zinc-600 rounded-md text-zinc-300 placeholder-zinc-400 outline-none ring-offset-zinc-900 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm"
                            placeholder="John Smith"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                        Email address
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-zinc-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="bg-zinc-700 block w-full pl-10 pr-3 py-2 border border-zinc-600 rounded-md text-zinc-300 placeholder-zinc-400 outline-none ring-offset-zinc-900 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                        Password
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-zinc-400" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          className="bg-zinc-700 block w-full pl-10 pr-3 py-2 border border-zinc-600 rounded-md text-zinc-300 placeholder-zinc-400 outline-none ring-offset-zinc-900 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      {mode === "signup" && (
                        <p className="mt-2 text-sm text-zinc-400">Password must be at least 8 characters long</p>
                      )}
                    </div>

                    {mode === "signin" && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-zinc-600 rounded bg-zinc-700"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-300">
                            Remember me
                          </label>
                        </div>
                      </div>
                    )}

                    {mode === "signup" && (
                      <div className="flex items-center">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-zinc-600 rounded bg-zinc-700"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-zinc-300">
                          I agree to the{" "}
                          <a href="#" className="text-fuchsia-400 hover:text-fuchsia-300">
                            Terms
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-fuchsia-400 hover:text-fuchsia-300">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700 outline-offset-2 disabled:opacity-50"
                      >
                        {loading ? "Processing..." : mode === "signin" ? "Sign in" : "Create account"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-zinc-700 text-base font-medium text-white hover:bg-zinc-600 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onSwitchMode}
            >
              {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
