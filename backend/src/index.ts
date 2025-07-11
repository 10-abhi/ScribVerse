import { Hono } from "hono"
import { cors } from "hono/cors"
import userRoute from "./routes/user"
import blogRoute from "./routes/blog"
import { airoute } from "./routes/airoute"

const app = new Hono()

app.use("*", cors())

app.route("/api/v1/user", userRoute)
app.route("/api/v1/blog", blogRoute)
app.route("api/v1/airoute", airoute)

app.get("/", (c) => {
  return c.json({ status: "ok", message: "ScribVerse API is running" })
})

export default app
