// src/inngest/functions.ts
import { z } from 'zod';
import { inngest } from "./client";
import { createAgent, gemini, openai, grok, createTool, createNetwork } from '@inngest/agent-kit';
import { Sandbox } from "e2b";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";

export const processTask = inngest.createFunction(
    { id: "process-task", triggers: { event: "app/task.created" } },
    async ({ event, step }) => {
        // const result = await step.run("handle-task", async () => {
        //     return { processed: true, id: event.data.value };
        // });

        // await step.sleep("handle-task", "10s");

        // return { message: `Task ${event.data.value} complete`, result };

        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("sarthaks-default-team-c318/vibe-nextjs-sarthak-dev");
            return sandbox.sandboxId;
        });

        const agent = createAgent({
            name: 'Code writer',
            system: PROMPT,
            // model: openai({
            //     model: "llama-3.3-70b-versatile",
            //     apiKey: process.env.XAI_API_KEY, // since your gsk_ key is here
            //     baseUrl: "https://api.groq.com/openai/v1",
            // }),
            model: gemini({
                model: "gemini-1.5-pro",
                apiKey: process.env.GEMINI_API_KEY,
            }),
            tools: [
                createTool({
                    name: "terminal",
                    description: "Use the terminal to run commands",
                    parameters: z.object({
                        command: z
                            .string()
                            .regex(/^npm install [\w./@-]+(?:\s+--yes)?$/, "Only npm install <package> --yes is allowed"),
                    }),
                    handler: async ({ command }, { step }) => {
                        if (!/^npm install [\w./@-]+(?:\s+--yes)?$/.test(command)) {
                            throw new Error("Unsupported terminal command");
                        }

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
                                    }
                                });
                                return result.stdout;
                            } catch (e) {
                                console.error(
                                    `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`,
                                );
                                return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
                            }
                        });
                    },
                }),
                createTool({
                    name: "createOrUpdateFiles",
                    description: "Create or update files in the sandbox",
                    parameters: z.object({
                        files: z.array(
                            z.object({
                                path: z.string(),
                                content: z.string(),
                            }),
                        ),
                    }),
                    handler: async (
                        { files },
                        { step, network }
                    ) => {
                        const newFiles = await step?.run("createOrUpdateFiles", async () => {
                            try {
                                const updatedFiles = network.state.data.files || {};
                                const sandbox = await getSandbox(sandboxId);
                                for (const file of files) {
                                    if (
                                        file.path.startsWith("/") ||
                                        file.path.includes("..") ||
                                        file.path === "app/layout.tsx" ||
                                        file.path === "package.json" ||
                                        /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(file.path)
                                    ) {
                                        throw new Error(`Disallowed file path: ${file.path}`);
                                    }

                                    await sandbox.files.write(file.path, file.content);
                                    updatedFiles[file.path] = file.content;
                                }

                                return updatedFiles;
                            } catch (e) {
                                return "Error: " + e;
                            }
                        });

                        if (typeof newFiles === "object") {
                            network.state.data.files = newFiles;
                        }
                    }
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
                            } catch (e) {
                                return "Error: " + e;
                            }
                        })
                    },
                })
            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    const lastAssistantMessageText =
                        lastAssistantTextMessageContent(result);

                    if (lastAssistantMessageText && network) {
                        if (lastAssistantMessageText.includes("<task_summary>")) {
                            network.state.data.summary = lastAssistantMessageText;
                        }
                    }

                    return result;
                },
            },
        });

        const network = createNetwork({
            name: "coding-agent-network",
            agents: [agent],
            maxIter: 15,
            router: async ({ network }) => {
                const summary = network.state.data.summary;

                if (summary) {
                    return;
                }

                return agent;
            },
        });

        const resultFinal = await network.run(event.data.value);


        // const { output } = await agent.run(
        //     `Write the following snippet: ${event.data.value}`,
        // );

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId);
            await sandbox.commands.run("npm run dev", { background: true });
            const host = sandbox.getHost(3000);
            return `https://${host}`;
        })

        // return { output, sandboxUrl };
        // return { sandboxUrl }

        return {
            url: sandboxUrl,
            title: "Fragment",
            files: resultFinal.state.data.files,
            summary: resultFinal.state.data.summary,
        };
    }
);