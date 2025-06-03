"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getBlogById, getAllBlogs, type Blog } from "../api"
import { useAuth } from "../context/AuthContext"
import { Edit, ArrowLeft, Calendar, Clock, Eye, RefreshCw, Share2 } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { handleImageError , getInitials } from "../utils/imageUtils"
import LoadingSpinner from "../components/LoadingSpinner"
import AnimatedContainer from "../components/AnimatedContainer"

const SingleBlogPage = () => {
  const { id } = useParams<{ id: string }>()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {  token, user } = useAuth()

  const fetchBlog = async () => {
    if (!id) {
      setError("Invalid blog ID")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (!token) {
        // For non-authenticated users, we'll try to get the blog from the bulk endpoint
        const blogs = await getAllBlogs()
        if (!Array.isArray(blogs)) {
          throw new Error("Invalid data format received from server")
        }

        const foundBlog = blogs.find((b: Blog) => b.id === Number(id))
        if (foundBlog) {
          setBlog(foundBlog)

          // Find related posts (same category or by same author)
          const related = blogs
            .filter(
              (b) =>
                b.id !== Number(id) &&
                (b.authorId === foundBlog.authorId ||
                  b.categories?.some((c1) => foundBlog.categories?.some((c2) => c1.id === c2.id))),
            )
            .slice(0, 3)

          setRelatedPosts(related)
        } else {
          setError("Blog not found")
        }
      } else {
        // For authenticated users, use the specific endpoint
        const data = await getBlogById(id, token)
        if (data && data.Post) {
          setBlog(data.Post)

          // Get related posts
          const allBlogs = await getAllBlogs()
          if (Array.isArray(allBlogs)) {
            const related = allBlogs
              .filter(
                (b) =>
                  b.id !== Number(id) &&
                  (b.authorId === data.Post.authorId ||
                    b.categories?.some((c1) => data.Post.categories?.some((c2) => c1.id === c2.id))),
              )
              .slice(0, 3)

            setRelatedPosts(related)
          }
        } else {
          setError("Blog not found")
        }
      }
    } catch (err) {
      console.error("Failed to fetch blog:", err)
      setError(err instanceof Error ? err.message : "Failed to load blog")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlog()
  }, [id, token])

  const isAuthor = user && blog && user.id === blog.authorId

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title || "ScribVerse Article",
          text: blog?.description || "Check out this article on ScribVerse",
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback - copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedContainer>
        <div className="mb-8">
          <Link
            to="/blogs"
            className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all articles
          </Link>
        </div>
      </AnimatedContainer>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Loading article..." />
        </div>
      ) : error ? (
        <AnimatedContainer>
          <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
            <h3 className="text-xl font-medium text-white mb-2">{error}</h3>
            <p className="text-zinc-400 mb-6">
              The article you're looking for might have been removed or is not available.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={fetchBlog}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600 transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </button>
              <Link
                to="/blogs"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700 transition-colors"
              >
                Browse Other Articles
              </Link>
            </div>
          </div>
        </AnimatedContainer>
      ) : blog ? (
        <>
          <AnimatedContainer>
            <article className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-fuchsia-500/10">
              {/* Featured Image */}
              <div className="h-64 sm:h-80 overflow-hidden">
                <img
                  src={blog.imageUrl || `/placeholder.svg?height=800&width=${800 + Number(id) * 10}`}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => handleImageError(e, blog.id)}
                  style={{
                    background: `linear-gradient(135deg, hsl(${(blog.id * 40) % 360}, 70%, 35%), hsl(${(blog.id * 40 + 120) % 360}, 70%, 45%))`,
                  }}
                />
              </div>

              <div className="p-6 sm:p-8">
                {/* Categories */}
                {blog.categories && blog.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="text-xs font-medium px-2 py-1 rounded-full bg-fuchsia-900/30 text-fuchsia-300 hover:bg-fuchsia-800/40 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Title and Actions */}
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{blog.title}</h1>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    {isAuthor && (
                      <Link
                        to={`/edit/${blog.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600 transition-colors"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Link>
                    )}
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center mb-6 text-zinc-400 text-sm gap-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-500 flex items-center justify-center mr-2">
                      {blog.author?.avatarUrl ? (
                        <img
                          src={blog.author.avatarUrl || "/placeholder.svg"}
                          alt={blog.author.name || "Author"}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            e.currentTarget.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <span className={blog.author?.avatarUrl ? "hidden" : ""}>{getInitials(blog.author?.name)}</span>
                    </div>
                    <span>{blog.author?.name || "Anonymous"}</span>
                  </div>

                  {blog.createdAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span title={format(new Date(blog.createdAt), "PPP")}>
                        {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  )}

                  {blog.readTime !== undefined && blog.readTime !== null && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{blog.readTime} min read</span>
                    </div>
                  )}

                  {blog.views !== undefined && (
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{blog.views} views</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="prose prose-invert max-w-none">
                  {blog.content.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 text-zinc-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Author Bio */}
                {blog.author?.bio && (
                  <div className="mt-8 p-4 bg-zinc-700/50 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">About the Author</h3>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-500 flex items-center justify-center">
                          {blog.author.avatarUrl ? (
                            <img
                              src={blog.author.avatarUrl || "/placeholder.svg"}
                              alt={blog.author.name || "Author"}
                              className="h-12 w-12 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.nextElementSibling?.classList.remove("hidden")
                              }}
                            />
                          ) : null}
                          <span className={blog.author.avatarUrl ? "hidden" : ""}>{getInitials(blog.author.name)}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-md font-medium text-white">{blog.author.name}</h4>
                        <p className="text-zinc-300 text-sm">{blog.author.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </AnimatedContainer>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <AnimatedContainer delay={300}>
              <div className="mt-12">
                <h2 className="text-xl font-bold text-white mb-6">Related Articles</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {relatedPosts.map((post, index) => (
                    <AnimatedContainer key={post.id} delay={index * 100}>
                      <Link
                        to={`/blog/${post.id}`}
                        className="block bg-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-700 transition-all duration-300 hover:scale-105 hover:shadow-fuchsia-500/20"
                      >
                        <div className="h-40 overflow-hidden">
                          <img
                            src={post.imageUrl || `/placeholder.svg?height=400&width=${400 + post.id * 10}`}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            onError={(e) => handleImageError(e, post.id)}
                            style={{
                              background: `linear-gradient(135deg, hsl(${(post.id * 40) % 360}, 70%, 35%), hsl(${(post.id * 40 + 120) % 360}, 70%, 45%))  hsl(${(post.id * 40) % 360}, 70%, 35%), hsl(${(post.id * 40 + 120) % 360}, 70%, 45%))`,
                            }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-md font-semibold text-white mb-2 line-clamp-2">{post.title}</h3>
                          <div className="flex items-center text-xs text-zinc-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{post.readTime || 5} min read</span>
                          </div>
                        </div>
                      </Link>
                    </AnimatedContainer>
                  ))}
                </div>
              </div>
            </AnimatedContainer>
          )}
        </>
      ) : null}
    </div>
  )
}

export default SingleBlogPage
