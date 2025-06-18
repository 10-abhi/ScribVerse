"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { ArrowLeft, Save, X } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

const EditProfilePage = () => {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatarUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      //only include fields that have changed
      const updates: Record<string, string> = {}
      if (formData.name !== user?.name) updates.name = formData.name
      if (formData.bio !== user?.bio) updates.bio = formData.bio
      if (formData.avatarUrl !== user?.avatarUrl) updates.avatarUrl = formData.avatarUrl

      if (Object.keys(updates).length === 0) {
        setSuccess(true)
        setLoading(false)
        return
      }

      await updateProfile(updates)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="Loading profile..." fullScreen />
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 bg-zinc-800/50 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-2">You need to be signed in to edit your profile</h3>
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
        <Link to="/profile" className="inline-flex items-center text-fuchsia-400 hover:text-fuchsia-300">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to profile
        </Link>
      </div>

      <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Edit Your Profile</h1>

        {error && <div className="mb-6 p-3 bg-red-900/50 text-red-200 rounded">{error}</div>}
        {success && (
          <div className="mb-6 p-3 bg-green-900/50 text-green-200 rounded">Profile updated successfully!</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-zinc-700 block w-full px-3 py-2 border border-zinc-600 rounded-md text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:border-fuchsia-500"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-zinc-300 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="bg-zinc-700 block w-full px-3 py-2 border border-zinc-600 rounded-md text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:border-fuchsia-500"
              placeholder="Tell us about yourself"
            />
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-zinc-300 mb-1">
              Avatar URL
            </label>
            <div className="flex">
              <input
                type="text"
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                className="bg-zinc-700 block w-full px-3 py-2 border border-zinc-600 rounded-l-md text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:border-fuchsia-500"
                placeholder="https://example.com/avatar.jpg"
              />
              <button
                type="button"
                className="px-3 py-2 bg-zinc-600 rounded-r-md hover:bg-zinc-500 transition-colors"
                onClick={() => setFormData({ ...formData, avatarUrl: "" })}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formData.avatarUrl && (
              <div className="mt-4 flex items-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-500 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.avatarUrl || "/placeholder.svg"}
                    alt="Avatar Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      e.currentTarget.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                  <span className="hidden">{getInitials(formData.name)}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-zinc-300">Avatar Preview</p>
                  {formData.avatarUrl !== user.avatarUrl && (
                    <p className="text-xs text-fuchsia-400">New avatar will be applied when you save</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="mr-4 px-4 py-2 border border-zinc-600 rounded-md text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-sky-600 hover:from-fuchsia-600 hover:to-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

//helper function to get initials from name
const getInitials = (name: string): string => {
  if (!name) return "?"

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export default EditProfilePage
