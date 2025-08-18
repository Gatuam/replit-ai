import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import {
  anthropic,
  createAgent,
  createNetwork,
  createTool,
  type Tool,
} from "@inngest/agent-kit";
import { getSandbox, lastAssitMessage } from "./ultis";
import z from "zod";
import { PROMPT } from "@/prompt";

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

    const codingAgent = createAgent({
      name: "coding agent",
      description: "An expert coding angent",
      system: PROMPT,
      model: anthropic({
        model: "claude-3-haiku-20240307",
        apiKey: AI_KEY,
        defaultParameters: {
          max_tokens: 4096,
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "use terminal to run cammands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.error(
                  `Command failed: ${error} error: ${buffers.stderr}`
                );
                return `Error: ${error}\nStderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFile",
          description: "Create or Update file in sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.file || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (error) {
                  return "Error" + error;
                }
              }
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandboxed",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (error) {
                return "Error, " + error;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssMessageText = lastAssitMessage(result);
          if (lastAssMessageText && network) {
            if (lastAssMessageText.includes("<task_summary")) {
              network.state.data.summary = lastAssMessageText;
            }
          }
          return result;
        },
      },
    });
    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codingAgent],
      maxIter: 2,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codingAgent;
      },
    });
    const result = await network.run(
      `Build a working ${event?.data?.value} application. Use React components, proper styling, and implement all features. Create the necessary files in the sandbox.`
    );

    const text = (result as any)?.content ?? "";

    console.log("AI output:", text);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return {
      message: `outPut by ai ::::: ${text}`,
      sandboxUrl,
      files: result.state.data.file,
      summary: result.state.data.summary,
    };
  }
);
