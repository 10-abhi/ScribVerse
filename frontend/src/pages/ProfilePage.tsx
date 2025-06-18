"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { ArrowLeft, Edit, User, Mail, Clock, Calendar, Eye } from "lucide-react"
import { format } from "date-fns"
import { getAllBlogs, type Blog } from "../api"

const ProfilePage = () => {
  const { user , isAuthenticated, isLoading, logout } = useAuth()
  const [userBlogs, setUserBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (!user) return

      try {
        const blogs = await getAllBlogs()
        //filter blogs by current user
        const filteredBlogs = blogs.filter((blog) => blog.authorId === user.id)
        setUserBlogs(filteredBlogs)
      } catch (err) {
        console.error("Failed to fetch user blogs:", err)
        setError("Failed to load your blogs")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchUserBlogs()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-fuchsia-400">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-2">You need to be signed in to view your profile</h3>
          <button
            onClick={() => navigate("/")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg">
        {/* Profile Header */}
        <div className="relative h-40 bg-gradient-to-r from-fuchsia-500/30 to-sky-600/30">
          <div className="absolute -bottom-16 left-8">
            <div className="h-32 w-32 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-500 flex items-center justify-center border-4 border-zinc-800">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl || "/placeholder.svg"}
                  alt={user.name || "User"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-white" />
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <button
              onClick={() => navigate("/edit-profile")}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-zinc-700/50 hover:bg-zinc-600/50"
            >
              <Edit className="mr-1 h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <h1 className="text-2xl font-bold text-white">{user.name || "User"}</h1>
          <div className="mt-2 flex items-center text-zinc-400">
            <Mail className="h-4 w-4 mr-1" />
            <span>{user.email}</span>
          </div>

          {user.bio && (
            <div className="mt-4 text-zinc-300">
              <p>{user.bio}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-zinc-700/50 px-4 py-2 rounded-md">
              <div className="text-lg font-semibold text-white">{userBlogs.length}</div>
              <div className="text-sm text-zinc-400">Articles</div>
            </div>
            <div className="bg-zinc-700/50 px-4 py-2 rounded-md">
              <div className="text-lg font-semibold text-white">
                {userBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0)}
              </div>
              <div className="text-sm text-zinc-400">Total Views</div>
            </div>
            {user.createdAt && (
              <div className="bg-zinc-700/50 px-4 py-2 rounded-md">
                <div className="text-lg font-semibold text-white">
                  {user.createdAt ? format(new Date(user.createdAt), "MMM yyyy") : ""}
                </div>
                <div className="text-sm text-zinc-400">Joined</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User's Articles */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Your Articles</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-fuchsia-400">Loading your articles...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
            <h3 className="text-xl font-medium text-white mb-2">{error}</h3>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-fuchsia-600 rounded-md hover:bg-fuchsia-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : userBlogs.length > 0 ? (
          <div className="space-y-6">
            {userBlogs.map((blog) => (
              <div key={blog.id} className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <Link to={`/blog/${blog.id}`} className="block">
                      <h3 className="text-xl font-semibold text-white hover:text-fuchsia-300 transition-colors">
                        {blog.title}
                      </h3>
                    </Link>
                    <Link
                      to={`/edit/${blog.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Link>
                  </div>

                  <p className="mt-2 text-zinc-400 line-clamp-2">
                    {blog.description || blog.content.substring(0, 150) + "..."}
                  </p>

                  <div className="mt-4 flex items-center text-xs text-zinc-400 space-x-4">
                    {blog.createdAt && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(blog.createdAt), "PPP")}</span>
                      </div>
                    )}
                    {blog.readTime !== undefined && blog.readTime !== null && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{blog.readTime} min read</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      <span>{blog.views || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
            <h3 className="text-xl font-medium text-white mb-2">You haven't written any articles yet</h3>
            <p className="text-zinc-400 mb-6">Share your thoughts with the world by creating your first article!</p>
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700"
            >
              Create Your First Article
            </Link>
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="mt-12 border-t border-zinc-700 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/edit-profile")}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-zinc-700 rounded-md hover:bg-zinc-600 text-white"
          >
            Edit Profile
          </button>
          <button
            onClick={() => {
              logout()
              navigate("/")
            }}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-red-700 rounded-md hover:bg-red-600 text-white"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
