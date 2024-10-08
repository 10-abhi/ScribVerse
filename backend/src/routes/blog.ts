import { Hono } from "hono";
import { Prisma, PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { sign } from "hono/jwt";
import { auth } from "hono/utils/basic-auth";

const blogRoute = new Hono<{
    Bindings : {
       DATABASE_URL: string,
       JWT_SECRET: string
    }
}>();
     //this is middlware which is not working..bad bad
  //  blogRoute.use("/*", async (c, next) => {
  //   const authHeader = c.req.header("authorization") || "";
  //   try {
  //       const user = await verify(authHeader, c.env.JWT_SECRET);
  //       if (user) {
  //           c.set("jwtPayload", user.id);
  //            next();
  //       } else {
  //           c.status(403);
  //           return c.json({
  //               message: "You are not logged in"
  //           })
  //       }
  //   } catch(e) {
  //       c.status(403);
  //       return c.json({
  //           message: "You are not logged in"
  //       })
//     }
// });
   

  blogRoute.post('/posting', async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate());

   //checking the authorization
   const authHeader = c.req.header("Authorization") || "";
   //getting the user
    const user = await verify(authHeader , c.env.JWT_SECRET);
    if(!user){
      c.json("authentication failed, incorrect Authorization");
    }
  const userId : any = user.id;

    const body = await c.req.json();
    try{
    
      const post = await prisma.post.create({
        data:{
            title : body.title,
            content : body.content,
            authorId : userId ,    
        }
      })
      if(!user){
        return c.text("Error while creating User");
      }
      return c.json({"PostId" : post.id })
    }
    catch(e){
     console.log(e , "Error while creating user")
    }
    
  })
  
  blogRoute.put('/update', async (c) => {

   const prisma = new PrismaClient({
    datasourceUrl : c.env.DATABASE_URL
   }).$extends(withAccelerate());

     const authHeader = c.req.header("Authorization") || "";
     const user = await verify(authHeader , c.env.JWT_SECRET);
     if(!user){
      c.json("no user found in localStorage || incorrect Authorization");
      console.log("no user found in localStorage || incorrect Authorization");
     }
     const userId : any = user.id;
     
     const body = await c.req.json();
     if(!body){
      c.json("no body found");
      console.log("no body found");
     }
     try {
       const newPost = await prisma.post.update({
        where : {
           id : body.id ,
           authorId : userId
           }, 
           data:{
          title : body.title,
          content: body.content
        
        }
       })
       if(!newPost){
         return c.text("no changes have made")
       }
       return c.json("updated successfully");

     } catch (error) {
      console.log(error);
     }
   
  })
  
  // blogRoute.get('/api/v1/blog/:id', (c) => {
  //   return c.text('Hello Hono!')
  // })
  
  // blogRoute.get('/api/v1/blog/bulk', (c) => {
  //   return c.text('Hello Hono!')
  // })
  
  export default blogRoute;