"use client"

import { Link } from "react-router-dom"
import { Clock, Eye, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Blog } from "../api"
import { handleImageError, getInitials, generateAvatarDataUrl } from "../utils/imageUtils"
import AnimatedContainer from "./AnimatedContainer"
import { useEffect, useState } from "react"

interface BlogCardProps extends Blog {
  index?: number
}

const BlogCard = ({
  id,
  title,
  content,
  description,
  imageUrl,
  author,
  categories,
  readTime,
  views,
  createdAt,
  index = 0,
}: BlogCardProps) => {
  //use description if available, otherwise truncate content
  const displayDescription = description || (content.length > 150 ? content.substring(0, 150) + "..." : content)

  //formatting date
  const formattedDate = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : "Recently"

  // generating avatar data url
  const [avatarUrl, setAvatarUrl] = useState<string>("")

  useEffect(() => {
    if (!author?.avatarUrl) {
      const initials = getInitials(author?.name)
      setAvatarUrl(generateAvatarDataUrl(initials, 200, author?.id || id))
    }
  }, [author, id])

  //generate background gradient for the card
  const cardGradient = `linear-gradient(135deg, hsl(${(id * 40) % 360}, 70%, 5%), hsl(${(id * 40 + 60) % 360}, 70%, 10%))`

  return (
    <AnimatedContainer delay={index * 100} className="h-full">
      <div
        className="flex flex-col rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-fuchsia-500/20 h-full"
        style={{ background: cardGradient }}
      >
        <div className="flex-shrink-0 h-48 overflow-hidden">
          {imageUrl ? (
            <img
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              src={imageUrl || "/placeholder.svg"}
              alt={title}
              onError={(e) => handleImageError(e, id)}
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-300 hover:scale-110"
              style={{
                background: `linear-gradient(135deg, hsl(${(id * 40) % 360}, 70%, 35%), hsl(${(id * 40 + 120) % 360}, 70%, 45%))`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-opacity-10 text-4xl font-bold">{title.charAt(0)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between backdrop-blur-sm bg-zinc-900/30">
          <div className="flex-1">
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((category) => (
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

            <Link to={`/blog/${id}`} className="block">
              <h2 className="text-xl font-semibold text-white hover:text-fuchsia-300 transition-colors">{title}</h2>
              <p className="mt-3 text-base text-zinc-300">{displayDescription}</p>
            </Link>
          </div>

          <div className="mt-6">
            <div className="flex items-center text-xs text-zinc-400 mb-3 space-x-4">
              {readTime !== undefined && readTime !== null && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{readTime} min read</span>
                </div>
              )}
              {views !== undefined && (
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{views} views</span>
                </div>
              )}
              {createdAt && (
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="sr-only">Author</span>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-500 flex items-center justify-center overflow-hidden">
                  {author?.avatarUrl ? (
                    <img
                      src={author.avatarUrl || "/placeholder.svg"}
                      alt={author.name || "Author"}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={() => setAvatarUrl(generateAvatarDataUrl(getInitials(author.name), 200, author.id))}
                    />
                  ) : (
                    <img
                      src={avatarUrl || "/placeholder.svg"}
                      alt={author?.name || "Author"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{author?.name || "Anonymous"}</p>
                <div className="flex space-x-1 text-xs text-zinc-400">
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  )
}

export default BlogCard
