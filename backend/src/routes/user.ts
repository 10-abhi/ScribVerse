import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt"

const userRoute = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>()

userRoute.post('signup', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();


    try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password
            }
        })
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (e) {
        c.status(403);
        return c.json({ e: "error while sign up" })
    }

})

userRoute.post('signin', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const body = await c.req.json();

    try {
        const User = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })

        if (!User) {
            c.status(401);
            return c.json({ error: "User not found" });
        }
        const jwt = await sign({ id: User.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    }
    catch (e) {
        return c.json({ "Error While Input Authen": e });
    }

})

export default userRoute;