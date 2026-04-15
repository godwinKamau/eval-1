import { initExperiment, initDataset } from "braintrust";
import { evaluator } from "./evaluator.ts";
import { apiCall } from "./apiCall.ts";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const experiment = initExperiment("My Project", {
    experiment: "My custom experiment",
  });

  const dataset = initDataset("My Project", { dataset: "Evaluation Dataset" });

  const maxRows = 5;
  let row = 0;
  for await (const item of dataset) {
    if (row >= maxRows) break;
    row++;
    const question = item.input.question;
    const answer = await apiCall(question);
    const reference_answer = item.expected.answer;
    const evaluation = await evaluator(question, answer, reference_answer);
    experiment.log({
      input: { question },
      output: answer,
      expected: reference_answer,
      scores: {
        llm_judge: (evaluation.score - 1) / 3,
      },
      metadata: {
        source: "custom-eval",
        feedback: evaluation.feedback,
        score_1_to_4: evaluation.score,
      },
    });
  }

  await experiment.flush();
}

main();