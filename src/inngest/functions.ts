import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import {
  anthropic,
  createAgent,
  createNetwork,
  createState,
  createTool,
  Message,
  type Tool,
} from "@inngest/agent-kit";
import { getSandbox, lastAssitMessage } from "./ultis";
import z from "zod";
import { PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

const AI_KEY = process.env.ANTHROPIC_API_KEY || "";

export const codeAgentFunction = inngest.createFunction(
  { id: "code agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("aee4ci7q65yoagbk3ra8", {
        apiKey: process.env.E2B_API_KEY,
      });
      console.log("Connected to sandbox:", sandbox.sandboxId);
      await sandbox.setTimeout(60_000 * 10);
      return sandbox.sandboxId;
    });

    const previousMessage = await step.run(
      "get=previous-messages",
      async () => {
        const formattedMessage: Message[] = [];
        const messages = await prisma.message.findMany({
          where: {
            projectId: event?.data?.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        });

        for (const message of messages) {
          formattedMessage.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }
        return formattedMessage.reverse();
      }
    );
    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessage,
      }
    );

    const codingAgent = createAgent<AgentState>({
      name: "coding agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: anthropic({
        model: "claude-3-5-sonnet-latest",
        apiKey: AI_KEY,
        defaultParameters: {
          max_tokens: 4096,
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use terminal to run commands",
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
                const output = result.stdout || buffers.stdout;
                const errors = result.stderr || buffers.stderr;

                if (errors) {
                  return `${output}\nStderr: ${errors}`;
                }

                return output || "Command completed successfully";
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
          description: "Create or Update files in sandbox and start dev server",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            if (!files || !files.length) throw new Error("No files provided");

            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);

                  for (const file of files) {
                    if (!file.path || !file.content) {
                      throw new Error("File path or content missing");
                    }
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  console.error("Error updating files:", error);
                  return { error: error?.toString() };
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
          description: "Read files from the sandbox",
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
                return "Error: " + error;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssMessageText = lastAssitMessage(result);
          if (lastAssMessageText && network) {
            if (lastAssMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codingAgent],
      maxIter: 3,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) return;
        return codingAgent;
      },
    });

    const result = await network.run(
      `Build a working and beautiful clerk ui level  ${event?.data?.value} application. Use React components, proper styling, and implement all features. Create the necessary files in the sandbox.`,
      { state }
    );
    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    console.log("AI output:", result);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    const messageContent =
      result?.state?.data?.summary || "No content generated";
    await step.run("save to db", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wroong please try again!",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: messageContent,
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: "Fragment",
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      message: `outPut by AI ::::: ${result.state.data.summary}`,
      sandboxUrl,
      files: network.state.data.files,
      summary: network.state.data.summary,
    };
  }
);
