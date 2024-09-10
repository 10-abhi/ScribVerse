import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { sign } from "hono/jwt";
const blogRoute = new Hono<{
    Bindings : {
        DATABASE_URL: string,
    JWT_SECRET: string
    }
}>();

blogRoute.use( '/api/v1/blog/*' , async(c,next)=>{

    const jwt = c.req.header('Authorization');
    if(!jwt){
      return c.json({error : "jwt not found"});
    }
    const token = jwt.split(' ')[1];
    const payload = await verify(token , c.env.JWT_SECRET);
    if(!payload){
      return c.json({error : "Error while JWT auth"});
    }
    //This c.set is setting userId
     c. set('jwtPayload' , payload.id)
     
    await next()
    
  })

  blogRoute.post('blog', (c) => {
    return c.json( c.get('jwtPayload')) ;
  
  })
  
  // blogRoute.put('/api/v1/blog', (c) => {
  //   return c.text('Hello Hono!')
  // })
  
  // blogRoute.get('/api/v1/blog/:id', (c) => {
  //   return c.text('Hello Hono!')
  // })
  
  // blogRoute.get('/api/v1/blog/bulk', (c) => {
  //   return c.text('Hello Hono!')
  // })
  
  export default blogRoute;