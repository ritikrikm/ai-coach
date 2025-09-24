import { retrieveContext, buildGrounding } from "./rag";
import { interviewerAskStream } from "../agents/interviewer";
import { evaluateAnswer } from "../agents/evaluator";
import { tutorPlan } from "../agents/tutor";
import { createTurn, setUserAnswer } from "../repositories/turns";
import { insertScore } from "../repositories/scores";

export async function nextQuestionStream(
  sessionId: string,
  role: string,
  topicHint: string
) {
  const chunks = await retrieveContext(topicHint || role, 5);
  const { context, citations } = buildGrounding(chunks);

  // Create a turn with placeholder question; we'll update after finish on client if needed
  // For now, we create the turn once question text starts streaming on client.
  // Simpler approach: create a turn now with "pending..." and let UI update later.

  // Return interviewer SSE stream and citations to save once first chunk arrives.
  const streamResp = await interviewerAskStream(context, role);
  return { streamResp, citations };
}

export async function evaluateAndCoach(
  turnId: string,
  role: string,
  question: string,
  answer: string,
  topicHint: string
) {
  const chunks = await retrieveContext(topicHint || role, 5);
  const { context } = buildGrounding(chunks);

  await setUserAnswer(turnId, answer);
  const evalRes = await evaluateAnswer(context, question, answer);
  await insertScore(turnId, evalRes);

  const coach = await tutorPlan(evalRes.weak_subskills ?? [], role);
  return { eval: evalRes, coach };
}
