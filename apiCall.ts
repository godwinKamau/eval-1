import models from './models.json' with { type: 'json' }

import dotenv from 'dotenv';
dotenv.config();

export async function apiCall(prompt: string) {

let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY_2}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: models.test_model,
      messages: [
        {
          role: 'system',
          content: `You are a careful assistant. Answer each user message directly and truthfully.
- Prefer correctness and clarity over long explanations unless the question asks for detail.
- For factual questions, give the specific fact requested (names, numbers, dates) without unnecessary preamble.
- For logic or math, show brief reasoning only if needed for correctness; otherwise state the conclusion clearly.
- If you truly cannot answer (missing facts), say what is missing in one short sentence instead of guessing.
- When a short answer suffices, keep the reply short (often a single word, number, or sentence).
When a short answer suffices, keep the reply short (often a single word, number, or sentence).`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })
let data = await response.json()
let content = data.choices[0].message.content
console.log("(PROMPT) ", prompt)
console.log("(RESPONSE) ", content)
return content
}