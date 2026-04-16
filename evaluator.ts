import models from './models.json' with { type: 'json' }
import dotenv from 'dotenv';
dotenv.config();

export type EvaluatorResult = {
  score: number;
  feedback: string;
};

const evaluator_system_prompt = `
You are an expert evaluator. The system model was instructed to: answer directly and truthfully; prioritize correctness and clarity over length unless the question needs detail; for factual items give the requested fact without unnecessary preamble; for logic or math use brief reasoning only when needed for correctness, otherwise state the conclusion clearly; if it cannot answer, say what is missing briefly instead of guessing; and keep replies short when a short answer suffices.

The user questions resemble benchmark items across these kinds of tasks: factual recall (dates, symbols, capitals, constants, biology facts); logical reasoning (syllogisms, contrapositives, propositional truth, numeric patterns); common sense (physical intuition, containment, valid inference from partial evidence); language understanding (grammar, analogies, word choice, morphology); and multi-step problem solving (order of operations, percent/word problems, rates/rail problems, counting/divisibility).

Score how well system_answer satisfies the user_question against the evaluation reference answer—not generic "helpfulness" alone.

Rating scale (1–4):
1 — Fails the task: wrong core claim, mostly irrelevant, unsafe guessing when facts are uncertain, or refuses a question the model should answer.
2 — Weak: partially correct or on-topic but misses essential parts of what was asked, or seriously violates brevity/clarity expectations without justification.
3 — Good: substantially correct and addresses the question; minor omissions, slightly more verbosity than needed, or small imprecision that does not undermine the main answer.
4 — Excellent: correct and complete for the question type; appropriately direct or concise when a short answer suffices; reasoning only where needed; no significant factual or logical errors.

Do not penalize appropriate brevity. Do penalize factual errors, logical mistakes, evasion, or unnecessary padding that obscures the answer.

Respond with ONLY a single JSON object (no markdown fences, no other text) in this exact shape:
{"score": <integer from 1 to 4>, "feedback": "<concise rationale for the score>"}
`;

const evaluator_user_prompt = (question: string, answer: string, reference_answer: string) => `
User question:
${question}

Reference answer:
${reference_answer}

System answer to evaluate:
${answer}`;

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '');
  return unfenced.trim();
}

function parseEvaluatorResult(content: string): EvaluatorResult {
  console.log("(CONTENT) ", content)
  const jsonStr = stripCodeFences(content);
  const parsed = JSON.parse(jsonStr) as { score?: unknown; feedback?: unknown };
  const score = Number(parsed.score);
  const feedback =
    typeof parsed.feedback === 'string' ? parsed.feedback : String(parsed.feedback ?? '');
  if (!Number.isFinite(score) || !Number.isInteger(score) || score < 1 || score > 4) {
    throw new Error(`Evaluator returned invalid score: ${String(parsed.score)}`);
  }
  return { score, feedback };
}

export async function evaluator(
  question: string,
  answer: string,
  reference_answer: string,
): Promise<EvaluatorResult> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: models.evaluation_model,
      messages: [
        { role: 'system', content: evaluator_system_prompt },
        { role: 'user', content: evaluator_user_prompt(question, answer, reference_answer) },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  const evaluation_data = await res.json();
  const evaluation_content = evaluation_data.choices[0].message.content as string;
  return parseEvaluatorResult(evaluation_content);
}