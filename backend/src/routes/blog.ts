import { Hono } from "hono";
import { Prisma, PrismaClient } from "@prisma/client/edge"
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
    //This c.set is setting user's Id
     c.set('jwtPayload' , payload.id)
      console.log(c.get('jwtPayload') + "inside the middleware with jwt payload(userID");  
     
    await next()
    
  })

  blogRoute.post('/blog', async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const userId = c.get('jwtPayload'); //got the users id 
    if(!userId){
        return c.text("UserId not Provided");
    }
    const body = await c.req.json();
    try{
    
      const user = await prisma.post.create({
        data:{
            title : body.title,
            content : body.content,
            authorId : userId ,    
        }
      })
      if(!user){
        return c.text("Error while creating User");
      }
      return c.json({"PostId" : user.id })
    }
    catch(e){
     console.log(e , "Error while creating user")
    }
    
  })
  
  blogRoute.put('/blog', async (c) => {

   const prisma = new PrismaClient({
    datasourceUrl : c.env.DATABASE_URL
   }).$extends(withAccelerate());

     const userId = c.get('jwtPayload');
     if(!userId){
      console.log("no userid found in localStorage");
     }
     const body = await c.req.json();
     if(!body){
      console.log("no body found");
     }
     try {
       const post = await prisma.post.update({
        where : {
           id : body.id
        }, data:{
          title : body.title,
          content: body.content,
          authorId : userId
        }
       })
       if(!post){
         return c.text("no changes have made")
       }
     } catch (error) {
      console.log(error);
     }
    return c.text('Hello Hono!')
  })
  
  // blogRoute.get('/api/v1/blog/:id', (c) => {
  //   return c.text('Hello Hono!')
  // })
  
  // blogRoute.get('/api/v1/blog/bulk', (c) => {
  //   return c.text('Hello Hono!')
  // })
  
  export default blogRoute;