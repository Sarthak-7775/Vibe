// src/inngest/functions.ts
import { inngest } from "./client";
import { createAgent, gemini } from '@inngest/agent-kit';

export const processTask = inngest.createFunction(
    { id: "process-task", triggers: { event: "app/task.created" } },
    async ({ event, step }) => {
        // const result = await step.run("handle-task", async () => {
        //     return { processed: true, id: event.data.value };
        // });

        // await step.sleep("handle-task", "10s");

        // return { message: `Task ${event.data.value} complete`, result };

        const agent = createAgent({
            name: 'Code writer',
            system: "You are an expert next.js developer. You write readable and mainatainable code. You write simple next.js and react snippets.",
            model: gemini({
                model: 'gemini-1.5-flash'
            }),
        });

        const { output } = await agent.run(
            `Write the following snippet: ${event.data.value}`,
        );

        return { output };
    }
);