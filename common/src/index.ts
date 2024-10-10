import zod from "zod";

//singup

export const SignupInput = zod.object({
    email: zod.string().email(),
    password: zod.string().min(4),
    name: zod.string().optional()
});

export type SignupType = zod.infer<typeof SignupInput>;

//sigin

export const SiginInInput = zod.object({
    email: zod.string().email(),
    password: zod.string()
});

export type SigninType = zod.infer<typeof SiginInInput>;

//blog-post

export const BlogPostInput = zod.object({
    title : zod.string(),
    content : zod.string()
});

export type BlogPostType = zod.infer<typeof BlogPostInput>;

//Blog-update 

export const BlogUpdateInput = zod.object({
    title : zod.string().optional(),
    content : zod.string().optional()
});

export type BlogUpdateType = zod.infer<typeof BlogUpdateInput>;

