"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createBlog, gettrendingTopics , generateContentByAi} from "../api"
import { useAuth } from "../context/AuthContext"
import { Save } from "lucide-react"

export default function CreateBlogPage() {

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [titleLoading, setTitleLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(false)
  const [error, setError] = useState("")
  const { token, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // For scroll indicator
  const [showScrollIcon, setShowScrollIcon] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Check if textarea is scrollable
  const checkScrollable = () => {
    const el = textareaRef.current;
    if (el) {
      setShowScrollIcon(el.scrollHeight > el.clientHeight && el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    }
  };

  React.useEffect(() => {
    checkScrollable();
  }, [content]);


  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  const handleGenerateTitle = async () => {
    setTitleLoading(true);
    setError("");
    try {
      if (!token) {
        setError("Authentication required");
        setTitleLoading(false);
        return;
      }
      const topics = await gettrendingTopics(token);
      if (topics && topics.length > 0) {
        setTitle(topics[0]);
      } else {
        setError("No trending topics found");
      }
    } catch (error) {
      setError("Failed to generate title");
    } finally {
      setTitleLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    setContentLoading(true);
    setError("");
    try {
      if (!token) {
        setError("Authentication required");
        setContentLoading(false);
        return;
      }
      if (!title.trim()) {
        setError("Please enter a title before generating content");
        setContentLoading(false);
        return;
      }
      const data = await generateContentByAi(token, title);
      if (!data) {
        setError("No content generated");
      } else if (typeof data === "string") {
        setContent(data);
      } else {
        setError("Unexpected response from AI");
      }
    } catch (error) {
      setError("Failed to generate content");
    } finally {
      setContentLoading(false);
    }
  };

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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create New Blog</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Blog Title */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            className="flex-1 border border-gray-300 rounded-md p-2"
            disabled={titleLoading || loading}
          />
          <button
            type="button"
            onClick={handleGenerateTitle}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
            disabled={titleLoading || loading}
          >
            {titleLoading ? (
              <span className="loader mr-2"></span>
            ) : null}
            {titleLoading ? "Generating..." : "Generate Title using AI"}
          </button>
        </div>

        {/* Blog Content */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-lg font-medium">Content</label>
            <button
              type="button"
              onClick={handleGenerateContent}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
              disabled={contentLoading || loading}
            >
              {contentLoading ? (
                <span className="loader mr-2"></span>
              ) : null}
              {contentLoading ? "Generating..." : "Generate Content using AI"}
            </button>
          </div>
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={12}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setTimeout(checkScrollable, 0);
              }}
              onScroll={checkScrollable}
              placeholder="Write your blog content here..."
              className="w-full border border-gray-300 rounded-md p-3 resize-y min-h-[120px] max-h-[600px] overflow-auto pr-10"
              disabled={contentLoading || loading}
            />
            {showScrollIcon && (
              <div className="pointer-events-none absolute bottom-2 right-4 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 8L10 13L15 8" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || titleLoading || contentLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
      {/* Simple loader CSS for inline spinner */}
      <style>{`
        .loader {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
