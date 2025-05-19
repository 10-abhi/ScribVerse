const API_BASE_URL = (import.meta as any).env.VITE_API_URL

//types
export interface Category {
  id: number
  name: string
  slug: string
  _count?: {
    posts: number
  }
}

export interface Author {
  id: string
  name: string | null
  email?: string
  avatarUrl?: string | null
  bio?: string | null
  createdAt?: string
}

export interface Blog {
  id: number
  title: string
  content: string
  description?: string | null
  imageUrl?: string | null
  published: boolean
  authorId: string
  author?: Author
  categories?: Category[]
  readTime?: number | null
  views?: number
  createdAt?: string
  updatedAt?: string
}

export interface UserProfile {
  id: string
  name: string | null
  email: string
  avatarUrl?: string | null
  bio?: string | null
  createdAt?: string
}

interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

//helper function for api calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    const data = await response.json()

    return {
      data: data as T,
      status: response.status,
    }
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error)
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      status: 500,
    }
  }
}

// Auth API
export const signUp = async (name: string, email: string, password: string): Promise<{ jwt: string }> => {
  const response = await apiCall<{ jwt: string; error?: string }>("/api/v1/user/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  })

  if (response.error || response.status >= 400 || !response.data?.jwt) {
    throw new Error(response.data?.error || response.error || "Failed to sign up")
  }

  return { jwt: response.data.jwt }
}

export const signIn = async (email: string, password: string): Promise<{ jwt: string }> => {
  const response = await apiCall<{ jwt: string; error?: string }>("/api/v1/user/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  if (response.error || response.status >= 400 || !response.data?.jwt) {
    throw new Error(response.data?.error || response.error || "Failed to sign in")
  }

  return { jwt: response.data.jwt }
}

// User Profile API
export const getUserProfile = async (token: string): Promise<UserProfile> => {
  const response = await apiCall<{ user: UserProfile; error?: string }>("/api/v1/user/profile", {
    headers: {
      Authorization: token,
    },
  })

  if (response.error || response.status >= 400 || !response.data?.user) {
    throw new Error(response.data?.error || response.error || "Failed to fetch user profile")
  }

  return response.data.user
}

export const updateUserProfile = async (
  token: string,
  updates: {
    name?: string
    bio?: string
    avatarUrl?: string
  },
): Promise<UserProfile> => {
  const response = await apiCall<{ user: UserProfile; error?: string }>("/api/v1/user/update-profile", {
    method: "PUT",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify(updates),
  })

  if (response.error || response.status >= 400 || !response.data?.user) {
    throw new Error(response.data?.error || response.error || "Failed to update user profile")
  }

  return response.data.user
}

// Blog API
export const getAllBlogs = async (): Promise<Blog[]> => {
  const response = await apiCall<Blog[] | { error: string }>("/api/v1/blog/bulk")

  if (response.error || response.status >= 400) {
    console.error("Failed to fetch blogs:", response.error || response.data)
    return []
  }

  return Array.isArray(response.data) ? response.data : []
}

export const getBlogById = async (id: string, token: string): Promise<{ Post: Blog }> => {
  const response = await apiCall<{ Post: Blog; error?: string }>(`/api/v1/blog/blogg/${id}`, {
    headers: {
      Authorization: token,
    },
  })

  if (response.error || response.status >= 400 || !response.data?.Post) {
    throw new Error(response.data?.error || response.error || "Failed to fetch blog")
  }

  return response.data
}

interface CreateBlogResponse {
  message?: string
  PostId: number
  error?: string
}

export const createBlog = async (
  title: string,
  content: string,
  token: string,
  description?: string,
  imageUrl?: string,
  categories?: string[],
): Promise<CreateBlogResponse> => {
  const response = await apiCall<CreateBlogResponse>("/api/v1/blog/post", {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      title,
      content,
      description: description || content.substring(0, 150) + "...",
      imageUrl,
      categories,
    }),
  })

  if (response.error || response.status >= 400 || !response.data?.PostId) {
    throw new Error(response.data?.error || response.error || "Failed to create blog")
  }

  return response.data
}

interface UpdateBlogResponse {
  message: string
  post?: Blog
  error?: string
}

export const updateBlog = async (
  id: number,
  title: string,
  content: string,
  token: string,
  description?: string,
  imageUrl?: string,
  categories?: string[],
): Promise<UpdateBlogResponse> => {
  const response = await apiCall<UpdateBlogResponse>("/api/v1/blog/update", {
    method: "PUT",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      id,
      title,
      content,
      description,
      imageUrl,
      categories,
    }),
  })

  if (response.error || response.status >= 400) {
    throw new Error(response.data?.error || response.error || "Failed to update blog")
  }

  return response.data as UpdateBlogResponse
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiCall<Category[] | { error: string }>("/api/v1/blog/categories")

  if (response.error || response.status >= 400) {
    console.error("Failed to fetch categories:", response.error || response.data)
    return []
  }

  return Array.isArray(response.data) ? response.data : []
}

export const getBlogsByCategory = async (slug: string): Promise<Blog[]> => {
  const response = await apiCall<Blog[] | { error: string }>(`/api/v1/blog/category/${slug}`)

  if (response.error || response.status >= 400) {
    console.error("Failed to fetch blogs by category:", response.error || response.data)
    return []
  }

  return Array.isArray(response.data) ? response.data : []
}

export const searchBlogs = async (query: string): Promise<Blog[]> => {
  const response = await apiCall<Blog[] | { error: string }>(`/api/v1/blog/search?q=${encodeURIComponent(query)}`)

  if (response.error || response.status >= 400) {
    console.error("Failed to search blogs:", response.error || response.data)
    return []
  }

  return Array.isArray(response.data) ? response.data : []
}
