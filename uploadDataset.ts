import { initDataset } from "braintrust";
import evaluation_dataset from './evaluation_dataset.json' with { type: 'json' }
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const dataset = initDataset("My Project", { dataset: "Evaluation Dataset" });

  for (const item of evaluation_dataset) {
    dataset.insert({
      input: { question: item.question },
      expected: { answer: item.answer },
      metadata: { category: item.category, difficulty: item.difficulty },
    });
  }

  await dataset.flush();
}

main();