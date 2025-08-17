import { inngest } from "./client";
import { anthropic, createAgent } from "@inngest/agent-kit";

const AI_KEY = process.env.ANTHROPIC_API_KEY || "";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const writer = createAgent({
      name: "writer",
      system:
        "You are an expert writer.  You write readable, concise, simple content.write in 10 words",
      model: anthropic({
        model: "claude-3-haiku-20240307",
        apiKey: AI_KEY,
        defaultParameters: {
          max_tokens: 100,
          temperature: 0.3,
        },
      }),
    });
    const { output } = await writer.run(
      `Write the following text : ${event?.data?.value}`
    );
    const text = (output[0] as any)?.content ?? "";

    console.log("AI output:", text);

    return { message: `outPut by ai ::::: ${text}` };
  }
);
