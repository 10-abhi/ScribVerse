"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getBlogById, updateBlog } from "../api"
import { useAuth } from "../context/AuthContext"
import { ArrowLeft, Save } from "lucide-react"

interface Blog {
  id: number
  title: string
  content: string
  published: boolean
  authorId: string
}

const EditBlogPage = () => {
  const { id } = useParams<{ id: string }>()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { token, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id || !token) return

      try {
        const data = await getBlogById(id, token)
        if (data && data.Post) {
          setBlog(data.Post)
          setTitle(data.Post.title)
          setContent(data.Post.content)

          // Check if user is the author
          if (user && user.id !== data.Post.authorId) {
            navigate(`/blog/${id}`)
          }
        } else {
          setError("Blog not found")
        }
      } catch (err) {
        console.error("Failed to fetch blog:", err)
        setError("Failed to load blog")
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [id, token, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }

    setSaving(true)
    setError("")

    try {
      if (!token || !id || !blog) {
        throw new Error("Missing required data")
      }

      await updateBlog(blog.id, title, content, token)
      navigate(`/blog/${id}`)
    } catch (err) {
      console.error("Error updating blog:", err)
      setError(err instanceof Error ? err.message : "Failed to update blog post")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to={`/blog/${id}`} className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to article
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-fuchsia-400">Loading article...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-2">{error}</h3>
          <Link
            to="/blogs"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700"
          >
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Edit Article</h1>

          {error && <div className="mb-6 p-3 bg-red-900/50 text-red-200 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-700 block w-full px-3 py-2 border border-zinc-600 rounded-md text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:border-fuchsia-500"
                placeholder="Enter article title"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-zinc-300 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="bg-zinc-700 block w-full px-3 py-2 border border-zinc-600 rounded-md text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:border-fuchsia-500"
                placeholder="Write your article content here..."
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500 disabled:opacity-50"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default EditBlogPage
