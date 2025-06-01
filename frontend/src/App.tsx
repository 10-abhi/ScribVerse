"use client"

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { useEffect, useState } from "react"
import HomePage from "./pages/HomePage"
import BlogPage from "./pages/BlogPage"
import SingleBlogPage from "./pages/SingleBlogPage"
import CreateBlogPage from "./pages/CreateBlogPage"
import EditBlogPage from "./pages/EditBlogPage"
import CategoryPage from "./pages/CategpryPage"
import ProfilePage from "./pages/ProfilePage"
import EditProfilePage from "./pages/EditProfilePage"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import LoadingSpinner from "./components/LoadingSpinner"
import BackgroundEffect from "./components/BackgroundEffect"
import { AppProvider } from "./context/AppContext"

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial app loading with a minimum duration to prevent flashing
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LoadingSpinner text="Initializing ScribVerse" fullScreen />
  }

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white relative overflow-hidden">
            <BackgroundEffect />

            {/* background layers */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.05),transparent_50%)] pointer-events-none z-0"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.05),transparent_50%)] pointer-events-none z-0"></div>

            <Navbar />
            <main className="flex-grow relative z-10">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/blogs" element={<BlogPage />} />
                <Route path="/blog/:id" element={<SingleBlogPage />} />
                <Route path="/create" element={<CreateBlogPage />} />
                <Route path="/edit/:id" element={<EditBlogPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
