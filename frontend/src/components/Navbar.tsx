"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { X, Menu, Sparkles } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import AuthModal from "./AuthModal"
import { generateAvatarDataUrl, getInitials } from "../utils/imageUtils"
import { useApp } from "../context/AppContext"

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const { isAuthenticated, logout, user, isLoading } = useAuth()
  const { isAppReady } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const signInButtonRef = useRef<HTMLButtonElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // to generate avatar if needed
  useEffect(() => {
    if (user && !user.avatarUrl) {
      const initials = getInitials(user.name)
      setAvatarUrl(generateAvatarDataUrl(initials, 200, user.id))
    }
  }, [user])

  // closing mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
  }, [location])

  // closing profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  // Don't render navbar until app is ready
  if (!isAppReady) {
    return null
  }

  return (
    <>
      <nav className="border-b border-zinc-800/50 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Sparkles className="h-8 w-8 text-fuchsia-500" />
                <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-sky-500 animated-gradient-text">
                  ScribVerse
                </span>
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    location.pathname === "/"
                      ? "text-fuchsia-300 border-fuchsia-500"
                      : "text-zinc-300 hover:text-fuchsia-300 hover:border-fuchsia-300 border-transparent"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/blogs"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    location.pathname === "/blogs"
                      ? "text-fuchsia-300 border-fuchsia-500"
                      : "text-zinc-300 hover:text-fuchsia-300 hover:border-fuchsia-300 border-transparent"
                  }`}
                >
                  Explore
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/create"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      location.pathname === "/create"
                        ? "text-fuchsia-300 border-fuchsia-500"
                        : "text-zinc-300 hover:text-fuchsia-300 hover:border-fuchsia-300 border-transparent"
                    }`}
                  >
                    Create Post
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center">
              {isLoading ? (
                <div className="h-8 w-8 rounded-full bg-zinc-700 animate-pulse"></div>
              ) : isAuthenticated ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none group"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-500 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl || "/placeholder.svg"}
                          alt={user.name || "User"}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={() => setAvatarUrl(generateAvatarDataUrl(getInitials(user.name), 200, user.id))}
                        />
                      ) : (
                        <img
                          src={avatarUrl || "/placeholder.svg"}
                          alt={user?.name || "User"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-fuchsia-300 transition-colors">
                      {user?.name || "User"}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg py-1 z-10 border border-zinc-700 backdrop-blur-sm">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-fuchsia-300 transition-colors"
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/create"
                        className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-fuchsia-300 transition-colors"
                      >
                        Create Post
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-fuchsia-300 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    ref={signInButtonRef}
                    id="navbar-signin-btn"
                    onClick={() => setIsSignInOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white hover:text-fuchsia-300 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsSignUpOpen(true)}
                    className="ml-3 px-4 py-2 text-sm font-medium bg-gradient-to-r from-fuchsia-500 to-sky-600 rounded-md hover:from-fuchsia-600 hover:to-sky-700 outline-offset-2 transition-all duration-300 hover:scale-105"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block pl-3 pr-4 py-2 text-base font-medium border-l-4 transition-colors ${
                  location.pathname === "/"
                    ? "text-fuchsia-300 border-fuchsia-500 bg-zinc-800"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-fuchsia-300 border-transparent"
                }`}
              >
                Home
              </Link>
              <Link
                to="/blogs"
                className={`block pl-3 pr-4 py-2 text-base font-medium border-l-4 transition-colors ${
                  location.pathname === "/blogs"
                    ? "text-fuchsia-300 border-fuchsia-500 bg-zinc-800"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-fuchsia-300 border-transparent"
                }`}
              >
                Explore
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/create"
                    className={`block pl-3 pr-4 py-2 text-base font-medium border-l-4 transition-colors ${
                      location.pathname === "/create"
                        ? "text-fuchsia-300 border-fuchsia-500 bg-zinc-800"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-fuchsia-300 border-transparent"
                    }`}
                  >
                    Create Post
                  </Link>
                  <Link
                    to="/profile"
                    className={`block pl-3 pr-4 py-2 text-base font-medium border-l-4 transition-colors ${
                      location.pathname === "/profile"
                        ? "text-fuchsia-300 border-fuchsia-500 bg-zinc-800"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-fuchsia-300 border-transparent"
                    }`}
                  >
                    Your Profile
                  </Link>
                </>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-zinc-800">
              <div className="flex items-center px-4">
                {isLoading ? (
                  <div className="h-8 w-8 rounded-full bg-zinc-700 animate-pulse"></div>
                ) : isAuthenticated ? (
                  <>
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-500 flex items-center justify-center overflow-hidden">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl || "/placeholder.svg"}
                            alt={user.name || "User"}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={() => setAvatarUrl(generateAvatarDataUrl(getInitials(user.name), 200, user.id))}
                          />
                        ) : (
                          <img
                            src={avatarUrl || "/placeholder.svg"}
                            alt={user?.name || "User"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user?.name || "User"}</div>
                      <div className="text-sm font-medium text-zinc-400">{user?.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="ml-auto px-4 py-2 text-sm font-medium bg-gradient-to-r from-fuchsia-500 to-sky-600 rounded-md hover:from-fuchsia-600 hover:to-sky-700 transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        setIsSignInOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      className="px-4 py-2 text-sm font-medium text-white hover:text-fuchsia-300 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsSignUpOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-fuchsia-500 to-sky-600 rounded-md hover:from-fuchsia-600 hover:to-sky-700 transition-all duration-300"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSwitchMode={() => {
          setIsSignInOpen(false)
          setIsSignUpOpen(true)
        }}
        mode="signin"
      />

      <AuthModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchMode={() => {
          setIsSignUpOpen(false)
          setIsSignInOpen(true)
        }}
        mode="signup"
      />
    </>
  )
}

export default Navbar
