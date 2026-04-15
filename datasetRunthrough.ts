import { evaluator } from './evaluator.ts';
import { apiCall } from './apiCall.ts';
import evaluation_dataset from './evaluation_dataset.json' with { type: 'json' }

for (const item of evaluation_dataset) {
    let question = item.question
    let answer = await apiCall(question)
    let reference_answer = item.answer
    let evaluation = await evaluator(question, answer, reference_answer)
    console.log("(QUESTION) ", question)
    console.log("(ANSWER) ", answer)
    console.log("(REFERENCE ANSWER) ", reference_answer)
    console.log("(EVALUATION) ", evaluation)
}