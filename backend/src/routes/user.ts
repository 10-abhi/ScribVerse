import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt"
//importing from my own package which i published on npm.. hehe
import {SiginInInput , SignupInput} from "@10-abhi/zodvalidator";

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

    const {success} = SignupInput.safeParse(body);
    if(!success){
        c.status(411);
        c.json("incorrect inputs");
    }
    try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                name : body.name ? body.name : undefined
            }
        })
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (e) {
        c.status(403);
        console.log(e);
        return c.json({ e: "error while sign up" })
    }

})

userRoute.post('signin', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const{success} = SiginInInput.safeParse(body);
    if(!success){
        c.status(411);
        c.json("wrong inputs");
    }
    try {
        const User = await prisma.user.findUnique({
            where: {
                email: body.email,
                password : body.password
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