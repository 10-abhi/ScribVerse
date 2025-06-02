"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getBlogsByCategory, type Blog } from "../api"
import BlogCard from "../components/BlogCard"
import { ArrowLeft, RefreshCw } from "lucide-react"

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState("")

  const fetchBlogs = async () => {
    if (!slug) {
      setError("Invalid category")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getBlogsByCategory(slug)

      if (Array.isArray(data)) {
        setBlogs(data)

        // Get category name from the first blog
        if (data.length > 0 && data[0].categories) {
          const category = data[0].categories.find((c) => c.slug === slug)
          if (category) {
            setCategoryName(category.name)
          }
        }
      } else {
        setError("Failed to load blogs for this category")
      }
    } catch (error) {
      console.error("Failed to fetch blogs by category:", error)
      setError("Failed to load blogs. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [slug])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/blogs" className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all articles
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">{categoryName || slug} Articles</h1>

        {error && (
          <button
            onClick={fetchBlogs}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-fuchsia-400">Loading articles...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-2">Error</h3>
          <p className="text-zinc-400 mb-6">{error}</p>
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} {...blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-2">No articles found</h3>
          <p className="text-zinc-400 mb-6">There are no articles in this category yet.</p>
          <Link
            to="/blogs"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700"
          >
            Browse Other Articles
          </Link>
        </div>
      )}
    </div>
  )
}

export default CategoryPage
