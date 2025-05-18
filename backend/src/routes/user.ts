import { Hono } from "hono"
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { sign , verify} from "hono/jwt"
import { SiginInInput, SignupInput } from "@10-abhi/zodvalidator"

const userRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
}>()

userRoute.post("signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json()

  const { success } = SignupInput.safeParse(body)
  if (!success) {
    c.status(411)
    return c.json({ error: "Invalid input format" })
  }

  try {
   
    const existingUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (existingUser) {
      c.status(409)
      return c.json({ error: "User with this email already exists" })
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password, // in production, should use hash passwords but not using rn(seddy)
        name: body.name || undefined,
      },
    })

    const jwt = await sign({ id: user.id, email: user.email, name: user.name }, c.env.JWT_SECRET)
    return c.json({ jwt })
  } catch (e) {
    c.status(500)
    console.error("Signup error:", e)
    return c.json({ error: "Internal server error during signup" })
  }
})

userRoute.post("signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json()
  const { success } = SiginInInput.safeParse(body)

  if (!success) {
    c.status(411)
    return c.json({ error: "Invalid input format" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password, // in prod use hashed passwords
      },
    })

    if (!user) {
      c.status(401)
      return c.json({ error: "Invalid email or password" })
    }

    const jwt = await sign({ id: user.id, email: user.email, name: user.name }, c.env.JWT_SECRET)
    return c.json({ jwt })
  } catch (e) {
    c.status(500)
    console.error("Signin error:", e)
    return c.json({ error: "Internal server error during signin" })
  }
})

userRoute.get("profile", async (c) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader) {
    c.status(401)
    return c.json({ error: "Unauthorized - No token provided" })
  }

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    // verifying token and extracting user ID
    const payload = await verify(authHeader, c.env.JWT_SECRET)
    const userId = typeof payload.id === 'string' ? payload.id : undefined;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    })

    if (!user) {
      c.status(404)
      return c.json({ error: "User not found" })
    }

    return c.json({ user })
  } catch (e) {
    c.status(401)
    console.error("Profile error:", e)
    return c.json({ error: "Invalid or expired token" })
  }
})


userRoute.put("update-profile", async (c) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader) {
    c.status(401)
    return c.json({ error: "Unauthorized - No token provided" })
  }

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const payload = await verify(authHeader, c.env.JWT_SECRET)
    const userId = payload.id as string | undefined

    const body = await c.req.json()

    if (typeof body !== "object" || body === null) {
      c.status(400)
      return c.json({ error: "Invalid request body" })
    }

    //only allowing updating specific fields
    const allowedUpdates: Record<string, any> = {}
    if (typeof body.name === "string") allowedUpdates.name = body.name
    if (typeof body.bio === "string") allowedUpdates.bio = body.bio
    if (typeof body.avatarUrl === "string") allowedUpdates.avatarUrl = body.avatarUrl

    if (Object.keys(allowedUpdates).length === 0) {
      c.status(400)
      return c.json({ error: "No valid fields to update" })
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: allowedUpdates,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    })

    return c.json({ user: updatedUser })
  } catch (e) {
    c.status(500)
    console.error("Update profile error:", e)
    return c.json({ error: "Failed to update profile" })
  }
})

export default userRoute