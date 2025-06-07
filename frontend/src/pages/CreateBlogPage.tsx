
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { createBlog } from "../api"
import { useAuth } from "../context/AuthContext"
import { ArrowLeft, Save } from "lucide-react"

const CreateBlogPage = () => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { token, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  //Redirecting if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await createBlog(title, content, token)
      if (response && response.PostId) {
        navigate(`/blog/${response.PostId}`)
      } else {
        throw new Error("Failed to create blog post")
      }
    } catch (err) {
      console.error("Error creating blog:", err)
      setError(err instanceof Error ? err.message : "Failed to create blog post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/blogs" className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all articles
        </Link>
      </div>

      <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Create New Article</h1>

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
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBlogPage
