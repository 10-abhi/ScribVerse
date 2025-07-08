import { Hono } from "hono";
import { authMiddleware } from "../../middleware/middleware";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

const createOpenAI = (apiKey: string) => {
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey
    })
};

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

const handleOpenAiRequest = async (
    openai: OpenAI,
    model: string,
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    max_tokens: number
) => {
    const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens
    })
    // if(!completion)return ;
    return completion.choices[0].message.content;
}

airoute.get("get-topics", async (c) => {
    try {
        const openai = createOpenAI(c.env.aiapikey);
        const messages: ChatCompletionMessageParam[] = [
            {
                role: "user",
                content:
                    "Give 5 trending tech blog topics for 2025. Return as a comma-separated list.",
            },
        ];

        const topics = await handleOpenAiRequest(openai, "gpt-4o", messages, 50);
        // const completion = await openai.chat.completions.create({
        //     model: "gpt-4o",
        // messages: [
        //     {
        //         role: "user",
        //         content: "Give 5 trending tech blog topics for 2025. Return as a comma-separated list."
        //     }
        // ],
        //     max_tokens: 50
        // });

        // const topics = completion.choices[0].message.content;
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
        const openai = createOpenAI(c.env.aiapikey);

        if (!openai) { return c.json({ error: "Failed to create the new instance of openai" }, 500) }
        const messages : ChatCompletionMessageParam[]= [
            {
                role: "user",
                content: `Write a detailed blog post (in less than ~300 words) on the topic: "${title}". Make it engaging and well-structured , concise and well explained in the given words.`,
            }
        ];

        const blogcontent = await handleOpenAiRequest(openai, "mistralai/mistral-7b-instruct" , messages, 300);

        // const completion = await openai.chat.completions.create({
        //     model: "mistralai/mistral-7b-instruct",
        //     max_tokens: 500,
        //     messages: [
        // {
        //     role: "user",
        //     content: `Write a detailed blog post (~500 words) on the topic: "${title}". Make it engaging and well-structured.`,
        // }
        //     ]
        // })
        // if (!completion) { return c.json({ error: "Failed to generate the content for this topic" }, 500); }
        // const blogcontent = completion.choices[0].message.content;
        // console.log(blogcontent);
        return c.json({ content: blogcontent });

    } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to generate content" }, 500);
    }
})