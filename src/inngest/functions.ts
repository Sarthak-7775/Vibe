// src/inngest/functions.ts
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';
import { Sandbox } from "e2b";
import { getSandbox } from "./utils";

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

        // const agent = createAgent({
        //     name: 'Code writer',
        //     system: "You are an expert next.js developer. You write readable and mainatainable code. You write simple next.js and react snippets.",
        //     model: gemini({
        //         model: 'gemini-1.5-flash'
        //     }),
        // });

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
        return { sandboxUrl }
    }
);