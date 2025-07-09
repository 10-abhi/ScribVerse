"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Search, TrendingUp, ArrowRight, Star, BookOpen, Users, Sparkles } from "lucide-react"
import { getAllBlogs, getCategories, searchBlogs, type Blog, type Category } from "../api"
import BlogCard from "../components/BlogCard"
import { useAuth } from "../context/AuthContext"
import LoadingSpinner from "../components/LoadingSpinner"
import AnimatedContainer from "../components/AnimatedContainer"
import SmoothBackground from "../components/SmoothBackground"
import { useApp } from "../context/AppContext"

const HomePage = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Blog[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const { isAppReady, setPageLoading } = useApp()
  const [contentReady, setContentReady] = useState(() => {
    // Check sessionStorage to persist loader state across navigations
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("scribverse-homepage-loaded") === "true";
    }
    return false;
  });

  // Coordinate loading states with the app
  useEffect(() => {
    setPageLoading(true)

    // Ensure content is ready only after app is ready
    if (isAppReady) {
      // If already loaded, skip loader
      if (sessionStorage.getItem("scribverse-homepage-loaded") === "true") {
        setContentReady(true);
        setPageLoading(false);
        return;
      }
      const timer = setTimeout(() => {
        setContentReady(true)
        setPageLoading(false)
        sessionStorage.setItem("scribverse-homepage-loaded", "true");
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [isAppReady, setPageLoading])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsData, categoriesData] = await Promise.all([getAllBlogs(), getCategories()])

        if (Array.isArray(blogsData)) {
          const screenWidht = window.innerWidth;
          let slicecount = 3;
          if(screenWidht<640){
            slicecount = 2;
          }else if ( screenWidht >= 640 && screenWidht < 1024){
            slicecount = 4;
          }
          // Sort by views for featured blogs
          const sortedBlogs = [...blogsData].sort((a, b) => (b.views || 0) - (a.views || 0))
          setFeaturedBlogs(sortedBlogs.slice(0, slicecount))
        } else {
          setFeaturedBlogs([])
          setError("Invalid data format received from server")
        }

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setError("Failed to load content. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (isAppReady) {
      fetchData()
    }
  }, [isAppReady])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setSearchLoading(true)
    try {
      const results = await searchBlogs(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSignIn = () => {
    const signinBtn = document.getElementById("navbar-signin-btn")
    if (signinBtn && signinBtn instanceof HTMLElement) {
      signinBtn.click()
    }
  }

  if (!contentReady) {
    return <LoadingSpinner size="large" text="Welcome to ScribVerse" fullScreen />
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Smooth Background */}
        <SmoothBackground />

        <AnimatedContainer animation="fade-in" className="relative z-10">
          <div className="py-20 md:py-32">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <AnimatedContainer animation="fade-up" delay={200}>
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
                    <span className="block mb-2">Welcome to</span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-sky-500 animate-gradient-x">
                      ScribVerse
                    </span>
                  </h1>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-up" delay={400}>
                  <p className="mt-3 max-w-md mx-auto text-xl text-zinc-300 sm:text-2xl md:mt-5 md:max-w-3xl leading-relaxed">
                    Where thoughts transcend dimensions and ideas become universes.
                  </p>
                </AnimatedContainer>

                {/* Search Bar */}
                <AnimatedContainer animation="fade-up" delay={600} className="mt-10 max-w-xl mx-auto">
                  <form onSubmit={handleSearch} className="flex w-full">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles..."
                      className="flex-grow px-6 py-4 rounded-l-md bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-lg placeholder-zinc-400"
                    />
                    <button
                      type="submit"
                      className="px-6 py-4 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 rounded-r-md hover:from-fuchsia-600 hover:to-fuchsia-700 transition-colors group"
                      disabled={searchLoading}
                    >
                      <Search className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>
                  </form>
                </AnimatedContainer>

                <AnimatedContainer
                  animation="fade-up"
                  delay={800}
                  className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12 gap-4"
                >
                  <Link
                    to="/blogs"
                    className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700 md:py-5 md:text-xl md:px-10 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-fuchsia-500/20 group"
                  >
                    Explore Articles
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {isAuthenticated ? (
                    <Link
                      to="/create"
                      className="mt-4 sm:mt-0 w-full flex items-center justify-center px-8 py-4 border border-fuchsia-500 text-lg font-medium rounded-md text-fuchsia-400 bg-transparent hover:bg-fuchsia-500/10 md:py-5 md:text-xl md:px-10 transition-all duration-300 hover:scale-105 group"
                    >
                      Start Writing
                      <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    </Link>
                  ) : (
                    <button
                      onClick={handleSignIn}
                      className="mt-4 sm:mt-0 w-full flex items-center justify-center px-8 py-4 border border-fuchsia-500 text-lg font-medium rounded-md text-fuchsia-400 bg-transparent hover:bg-fuchsia-500/10 md:py-5 md:text-xl md:px-10 transition-all duration-300 hover:scale-105 group"
                    >
                      Sign In to Write
                      <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    </button>
                  )}
                </AnimatedContainer>
              </div>
            </div>
          </div>
        </AnimatedContainer>

        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path
              fill="#18181b"
              fillOpacity="1"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-zinc-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedContainer animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Why Choose ScribVerse?</h2>
              <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
                A platform designed for writers, thinkers, and creators to share their unique perspectives with the
                world.
              </p>
            </div>
          </AnimatedContainer>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedContainer animation="fade-up" delay={200}>
              <div className="bg-zinc-800/50 backdrop-blur-sm p-8 rounded-xl border border-zinc-700/50 hover:border-fuchsia-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/5 group">
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-sky-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Rich Content</h3>
                <p className="text-zinc-400">
                  Create beautiful articles with rich formatting, images, and a seamless writing experience.
                </p>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-up" delay={300}>
              <div className="bg-zinc-800/50 backdrop-blur-sm p-8 rounded-xl border border-zinc-700/50 hover:border-fuchsia-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/5 group">
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-sky-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Vibrant Community</h3>
                <p className="text-zinc-400">
                  Connect with like-minded writers and readers who appreciate quality content.
                </p>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-up" delay={400}>
              <div className="bg-zinc-800/50 backdrop-blur-sm p-8 rounded-xl border border-zinc-700/50 hover:border-fuchsia-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/5 group">
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-sky-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Discover Excellence</h3>
                <p className="text-zinc-400">
                  Find curated content that inspires, educates, and entertains across various categories.
                </p>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <AnimatedContainer>
          <div className="py-16 bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                  Search Results for "{searchQuery}"
                </h2>
                <button
                  onClick={() => setSearchResults(null)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Clear Results
                </button>
              </div>

              {searchLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner text="Searching..." />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((blog, index) => (
                    <BlogCard key={blog.id} {...blog} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700/50">
                  <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
                  <p className="text-zinc-400">Try different keywords or browse our categories below</p>
                </div>
              )}
            </div>
          </div>
        </AnimatedContainer>
      )}

      {/* Categories Section */}
      {categories.length > 0 && !searchResults && (
        <AnimatedContainer delay={200} animation="fade-up">
          <div className="py-16 bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-8">Explore Categories</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category, index) => (
                  <AnimatedContainer key={category.id} delay={index * 50} animation="scale-in">
                    <Link
                      to={`/category/${category.slug}`}
                      className="p-6 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm rounded-xl hover:from-zinc-800 hover:to-zinc-800 transition-all duration-300 text-center hover:scale-105 transform border border-zinc-700/50 hover:border-fuchsia-500/30 group relative overflow-hidden"
                    >
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <h3 className="text-xl font-medium text-white group-hover:text-fuchsia-300 transition-colors relative z-10">
                        {category.name}
                      </h3>
                      {category._count && (
                        <p className="text-sm text-zinc-400 mt-2 group-hover:text-zinc-300 transition-colors relative z-10">
                          {category._count.posts} articles
                        </p>
                      )}

                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>
                  </AnimatedContainer>
                ))}
              </div>
            </div>
          </div>
        </AnimatedContainer>
      )}

      {/* Featured Content */}
      {!searchResults && (
        <AnimatedContainer delay={400} animation="fade-up">
          <div id="featured" className="py-16 bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-r from-fuchsia-500 to-sky-500 p-2 rounded-lg mr-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">Featured Articles</h2>
              </div>

              {loading ? (
                <div className="mt-6 flex justify-center">
                  <LoadingSpinner text="Loading featured articles..." />
                </div>
              ) : error ? (
                <div className="mt-6 text-center text-red-400 p-8 bg-red-900/20 rounded-xl border border-red-700/30">
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-fuchsia-600 rounded-md hover:bg-fuchsia-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : featuredBlogs.length > 0 ? (
                <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {featuredBlogs.map((blog, index) => (
                    <BlogCard key={blog.id} {...blog} index={index} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 text-center p-12 bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50">
                  <h3 className="text-2xl font-medium text-white mb-4">No articles available yet</h3>
                  <p className="text-zinc-400 mb-6">Be the first to publish and share your thoughts with the world!</p>
                  {isAuthenticated && (
                    <Link
                      to="/create"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-sky-600 rounded-md hover:from-fuchsia-600 hover:to-sky-700 transition-colors text-white font-medium"
                    >
                      Create a new post
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  )}
                </div>
              )}

              <div className="mt-16 text-center">
                <Link
                  to="/blogs"
                  className="inline-flex items-center px-6 py-3 border border-zinc-700 rounded-xl shadow-sm text-lg font-medium text-white bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-fuchsia-500/10 hover:border-fuchsia-500/30 group"
                >
                  View all articles
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      )}

      {/* CTA Section */}
      {!searchResults && (
        <AnimatedContainer animation="fade-up">
          <div className="py-16 bg-zinc-900 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/20 via-zinc-900/10 to-sky-900/20"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-sky-500"></div>
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-sky-500 to-fuchsia-500"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Share Your Story?</h2>
                <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
                  Join our community of writers and readers today. Start creating and discovering amazing content.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {isAuthenticated ? (
                    <Link
                      to="/create"
                      className="px-8 py-4 bg-gradient-to-r from-fuchsia-500 to-sky-600 rounded-xl text-white font-medium text-lg hover:from-fuchsia-600 hover:to-sky-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-fuchsia-500/20"
                    >
                      Create Your First Post
                    </Link>
                  ) : (
                    <button
                      onClick={handleSignIn}
                      className="px-8 py-4 bg-gradient-to-r from-fuchsia-500 to-sky-600 rounded-xl text-white font-medium text-lg hover:from-fuchsia-600 hover:to-sky-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-fuchsia-500/20"
                    >
                      Join ScribVerse Today
                    </button>
                  )}

                  <Link
                    to="/blogs"
                    className="px-8 py-4 border border-fuchsia-500 rounded-xl text-fuchsia-400 font-medium text-lg hover:bg-fuchsia-500/10 transition-all duration-300 hover:scale-105"
                  >
                    Explore Articles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      )}
    </div>
  )
}

export default HomePage
