"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAllBlogs, getCategories, searchBlogs, type Blog, type Category } from "../api"
import BlogCard from "../components/BlogCard"
import { useAuth } from "../context/AuthContext"
import { PenSquare, RefreshCw, Search, Filter } from "lucide-react"

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Blog[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest")
  const { isAuthenticated } = useAuth()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [blogsData, categoriesData] = await Promise.all([getAllBlogs(), getCategories()])

      if (Array.isArray(blogsData)) {
        setBlogs(blogsData)
      } else {
        setBlogs([])
        setError("Invalid data format received from server")
      }

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setError("Failed to load blogs. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

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

  const filteredBlogs = () => {
    let result = searchResults || blogs

    // Filter by category if selected
    if (selectedCategory) {
      result = result.filter((blog) => blog.categories?.some((cat) => cat.slug === selectedCategory))
    }

    // Sort blogs
    if (sortBy === "latest") {
      return [...result].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    } else {
      return [...result].sort((a, b) => (b.views || 0) - (a.views || 0))
    }
  }

  const displayBlogs = filteredBlogs()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-white">All Articles</h1>

        <div className="flex flex-wrap gap-2">
          {error && (
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </button>
          )}
          {isAuthenticated && (
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700"
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Write New Article
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-zinc-800 p-4 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="flex-grow px-4 py-2 rounded-l-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-fuchsia-600 rounded-r-md hover:bg-fuchsia-700 transition-colors"
              disabled={searchLoading}
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="appearance-none px-4 py-2 pr-8 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
              className="appearance-none px-4 py-2 pr-8 rounded-md bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>

        {searchResults && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-zinc-400">
              Found {searchResults.length} results for "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchResults(null)
                setSearchQuery("")
              }}
              className="text-fuchsia-400 hover:text-fuchsia-300 text-sm"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-fuchsia-400">Loading articles...</div>
        </div>
      ) : error && !displayBlogs.length ? (
        <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-2">Error</h3>
          <p className="text-zinc-400 mb-6">{error}</p>
        </div>
      ) : displayBlogs.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayBlogs.map((blog) => (
            <BlogCard key={blog.id} {...blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-2">No articles found</h3>
          <p className="text-zinc-400 mb-6">
            {searchResults
              ? "Try different search terms or clear your search"
              : selectedCategory
                ? "No articles in this category yet"
                : "Be the first to share your thoughts with the world!"}
          </p>
          {isAuthenticated ? (
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700"
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Create Your First Article
            </Link>
          ) : (
            <button
              onClick={handleSignIn}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700"
            >
              Sign In to Write
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default BlogPage
