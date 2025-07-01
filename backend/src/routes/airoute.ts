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
            ]
        });

        const topics = completion.choices[0].message.content;
        return c.json({ topics });

    } catch (error) {
        console.error("Error fetching topics:", error);
        return c.json({ error: "Failed to generate topics" }, 500);
    }
})