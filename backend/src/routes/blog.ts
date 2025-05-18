import { Hono } from "hono"
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { authMiddleware } from "../../middleware/middleware"
const blogRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
  }
}>()

blogRoute.use("*", authMiddleware)

blogRoute.get("bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return c.json(posts)
  } catch (e) {
    console.error("Get all blogs error:", e)
    c.status(500)
    return c.json({ error: "Internal server error" })
  }
})

blogRoute.get("blogg/:id", async (c) => {
  const id = c.req.param("id")
  const userId = c.get("userId")

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
        categories: true,
      },
    })

    if (!post) {
      c.status(404)
      return c.json({ error: "Blog not found" })
    }

    await prisma.post.update({
      where: {
        id: Number(id),
      },
      data: {
        views: (post.views || 0) + 1,
      },
    })

    return c.json({ Post: post })
  } catch (e) {
    console.error("Get blog by ID error:", e)
    c.status(500)
    return c.json({ error: "Internal server error" })
  }
})


blogRoute.post("post", async (c) => {
  const userId = c.get("userId")

  if (!userId) {
    c.status(401)
    return c.json({ error: "Unauthorized" })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const body = await c.req.json()

    if (!body.title || !body.content) {
      c.status(400)
      return c.json({ error: "Title and content are required" })
    }

    // Create or connect categories
    let categoryConnect = undefined
    if (body.categories && Array.isArray(body.categories) && body.categories.length > 0) {
      categoryConnect = {
        connectOrCreate: body.categories.map((categoryName: string) => ({
          where: {
            name: categoryName,
          },
          create: {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
          },
        })),
      }
    }

    // calculating read time (approx 200 words per minute)
    const wordCount = body.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        description: body.description,
        imageUrl: body.imageUrl,
        readTime: readTime,
        views: 0,
        published: true,
        author: {
          connect: {
            id: userId,
          },
        },
        categories: categoryConnect,
      },
    })

    return c.json({ message: "Blog created successfully", PostId: post.id })
  } catch (e) {
    console.error("Create blog error:", e)
    c.status(500)
    return c.json({ error: "Internal server error" })
  }
})

blogRoute.put("update", async (c) => {
  const userId = c.get("userId")

  if (!userId) {
    c.status(401)
    return c.json({ error: "Unauthorized" })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const body = await c.req.json()

    if (!body.id || !body.title || !body.content) {
      c.status(400)
      return c.json({ error: "ID, title, and content are required" })
    }

    //checking if the post exists and belongs to the user
    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(body.id),
      },
    })

    if (!existingPost) {
      c.status(404)
      return c.json({ error: "Blog not found" })
    }

    if (existingPost.authorId !== userId) {
      c.status(403)
      return c.json({ error: "You don't have permission to update this blog" })
    }

    // Create or connect categories
    let categoryConnect = undefined
    if (body.categories && Array.isArray(body.categories) && body.categories.length > 0) {
      categoryConnect = {
        set: [], // clearing existing categories
        connectOrCreate: body.categories.map((categoryName: string) => ({
          where: {
            name: categoryName,
          },
          create: {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
          },
        })),
      }
    }

    //read time
    const wordCount = body.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    const post = await prisma.post.update({
      where: {
        id: Number(body.id),
      },
      data: {
        title: body.title,
        content: body.content,
        description: body.description,
        imageUrl: body.imageUrl,
        readTime: readTime,
        categories: categoryConnect,
        updatedAt: new Date(),
      },
    })

    return c.json({ message: "Blog updated successfully", post })
  } catch (e) {
    console.error("Update blog error:", e)
    c.status(500)
    return c.json({ error: "Internal server error" })
  }
})

// to get all cat 
blogRoute.get("categories", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    return c.json(categories)
  } catch (e) {
    console.error("Get categories error:", e)
    c.status(500)
    return c.json({ error: "Internal server error" })
  }
})

// getblogs by cat
blogRoute.get("category/:slug", async (c) => {
  const slug = c.req.param("slug")

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const category = await prisma.category.findUnique({
      where: {
        slug: slug,
      },
    })

    if (!category) {
      c.status(404)
      return c.json({ error: "Category not found" })
    }

    const posts = await prisma.post.findMany({
      where: {
        published: true,
        categories: {
          some: {
            slug: slug,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return c.json(posts)
  } catch (e) {
    console.error("Get blogs by category error:", e)
    c.status(500)
    return c.json({ error: "Internal server error" })
  }
})

//search
blogRoute.get("search", async (c) => {
  const query = c.req.query("q")

  if (!query) {
    c.status(400)
    return c.json({ error: "Search query is required" })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return c.json(posts)
  } catch (e) {
    console.error("Search blogs error:", e)
    c.status(500)
    return c.json({ error: "Internal server error" })
  }
})

export default blogRoute
