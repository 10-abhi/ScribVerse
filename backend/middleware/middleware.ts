import type { Context } from "hono"
import { verify } from "hono/jwt"

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const authHeader = c.req.header("Authorization")

  const publicRoutes = ["/bulk", "/categories", "/category/", "/search"]

  const isPublicRoute = publicRoutes.some((route) => c.req.path.includes(route))

  if (!authHeader) {
    if (isPublicRoute) {
      return next()
    }

    c.status(401)
    return c.json({ error: "Unauthorized - No token provided" })
  }

  try {
    const token = authHeader
    const payload = await verify(token, c.env.JWT_SECRET)
    c.set("userId", payload.id)
    await next()
  } catch (e) {
    c.status(401)
    return c.json({ error: "Unauthorized - Invalid token" })
  }
}
