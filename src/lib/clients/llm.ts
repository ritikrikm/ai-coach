import OpenAI from "openai";
import { env } from "../config";

export type ChatMsg = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/** Fire-and-forget completion (no streaming) */
export async function chatOnce(
  messages: ChatMsg[],
  model = "gpt-4o-mini",
  temperature = 0
) {
  const started = Date.now();
  const res = await openai.chat.completions.create({
    model,
    messages,
    temperature,
  });
  const text = res.choices[0]?.message?.content ?? "";
  const latencyMs = Date.now() - started;
  // Hook: add metrics here (tokens/cost) if you want
  return { text, latencyMs };
}

/** Server-Sent Events stream for App Router */
export async function streamChat(
  messages: ChatMsg[],
  model = "gpt-4o-mini",
  temperature = 0
) {
  const started = Date.now();
  const stream = await openai.chat.completions.create({
    model,
    temperature,
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) controller.enqueue(encoder.encode(`data: ${delta}\n\n`));
      }
      controller.enqueue(encoder.encode("event: end\ndata: [DONE]\n\n"));
      controller.close();
      // Hook: record latency (Date.now()-started)
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
