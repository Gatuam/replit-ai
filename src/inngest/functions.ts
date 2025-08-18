import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { anthropic, createAgent } from "@inngest/agent-kit";
import { getSandbox } from "./ultis";

const AI_KEY = process.env.ANTHROPIC_API_KEY || "";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("aee4ci7q65yoagbk3ra8", {
        apiKey: process.env.E2B_API_KEY,
      });
      console.log("Connected to sandbox:", sandbox.sandboxId);
      return sandbox.sandboxId;
    });

    const writer = createAgent({
      name: "writer",
      system:
        "You are an expert nextjs developer .  You write production ready, concise, simple code .",
      model: anthropic({
        model: "claude-3-haiku-20240307",
        apiKey: AI_KEY,
        defaultParameters: {
          max_tokens: 700,
          temperature: 0.3,
        },
      }),
    });
    const { output } = await writer.run(
      `Write the following text : ${event?.data?.value}`
    );

    const text = (output[0] as any)?.content ?? "";

    console.log("AI output:", text);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { message: `outPut by ai ::::: ${text}`, sandboxUrl };
  }
);
