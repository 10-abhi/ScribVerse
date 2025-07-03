import { Hono } from "hono";
import { authMiddleware } from "../../middleware/middleware";
import OpenAI from "openai";

export const airoute = new Hono<{
    Bindings: {
        DATABASE_URL: string
        // JWT_SECRET: string
        // openroutekey : string
        aiapikey: string
    }
    //   Variables: {
    //     userId: string
    //   }
}>

airoute.use("*", authMiddleware);

airoute.get("get-topics", async (c) => {
    try {
        const openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: c.env.aiapikey
        })
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: "Give 5 trending tech blog topics for 2025. Return as a comma-separated list."
                }
            ],
            max_tokens: 50
        });

        const topics = completion.choices[0].message.content;
        return c.json({ topics });

    } catch (error) {
        console.error("Error fetching topics:", error);
        return c.json({ error: "Failed to generate topics" }, 500);
    }
})

airoute.get("generate-content", async (c) => {
    try {
        const title = c.req.query("title");
        if (!title) {
            return c.json({ error: "Failed to get the title" }, 500);
        }
        const openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: c.env.aiapikey
        })
        if (!openai) { return c.json({ error: "Failed to create the new instance of openai" }, 500) }
        const completion = await openai.chat.completions.create({
            model: "mistralai/mistral-7b-instruct",
            max_tokens: 500,
            messages: [
                {
                    role: "user",
                    content: `Write a detailed blog post (~500 words) on the topic: "${title}". Make it engaging and well-structured.`,
                }
            ]
        })
        if (!completion) { return c.json({ error: "Failed to generate the content for this topic" }, 500); }
        const blogcontent = completion.choices[0].message.content;
        // console.log(blogcontent);
        return c.json({ content: blogcontent });

    } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to generate content" }, 500);
    }
})