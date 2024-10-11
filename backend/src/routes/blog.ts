import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { BlogPostInput , BlogUpdateInput } from "@10-abhi/zodvalidator";

const blogRoute = new Hono<{
    Bindings : {
       DATABASE_URL: string,
       JWT_SECRET: string
    }, Variables : {
      userrID : any
  }
}>();
    
//this is a middleware 
   blogRoute.use("*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            c.set("userrID", user.id);
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }
    } catch(e) {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
});
   

  blogRoute.post('/post', async (c)=>{

    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL
    }).$extends(withAccelerate());

  const userId = c.get("userrID");

    const body = await c.req.json();

    const {success} = BlogPostInput.safeParse(body);
    if(!success){
      c.status(411);
      c.json("incorrect inputs");
    }

    try{
    
      const post = await prisma.post.create({
        data:{
            title : body.title,
            content : body.content,
            authorId : userId ,    
        }
      })
      if(!post){
        return c.text("Error while creating Post");
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

     const userId = c.get("userrID");

     const body = await c.req.json();
     const {success} = BlogUpdateInput.safeParse(body);
     if(!success){
        c.status(411);
        c.json("incorrect inputs");
     }
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
  
  blogRoute.get('/blogg/:id', async (c) => {
   
    const prisma = new PrismaClient({
      datasourceUrl : c.env?.DATABASE_URL
    }).$extends(withAccelerate()); 

    const id = c.req.param('id');


    if(!id){
      c.json("no params are given || postid doesnot exist");
    }
    c.json("at the middle")
  
      const Post = await prisma.post.findUnique({
        where : {
           id : Number(id)
        }
      });
      c.json("Post Found : ");
      return c.json({Post});
  })
  
  blogRoute.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany({});
    return c.json(posts);
  })

  
  export default blogRoute;