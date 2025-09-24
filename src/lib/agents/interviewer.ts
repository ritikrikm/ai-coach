import { streamChat } from "../clients/llm";

export function interviewerPrompt(context: string, role: string) {
  return [
    {
      role: "system",
      content: `You are a senior interviewer for the role: ${role}.
Ask ONE concise question at a time. Base it ONLY on the provided CONTEXT.
If context is insufficient, say you need more context and propose a related question.
Return only the question sentence, no preface.`,
    },
    {
      role: "user",
      content: `CONTEXT:\n${context}\n\nAsk the next interview question.`,
    },
  ] as const;
}

export async function interviewerAskStream(context: string, role: string) {
  const messages = interviewerPrompt(context, role);
  return streamChat(messages as any);
}
