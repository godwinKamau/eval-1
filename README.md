# eval-1 — LLM-as-Judge Evaluation Pipeline

A lightweight evaluation framework that runs a **test model** against a curated benchmark dataset and scores its responses using a separate **evaluation model** as an LLM judge. Results can be viewed locally in the terminal or logged to [Braintrust](https://www.braintrust.dev/) for experiment tracking.

---

## How It Works

1. Each question in `evaluation_dataset.json` is sent to the **test model** via [OpenRouter](https://openrouter.ai/).
2. The model's response is passed — along with the question and a reference answer — to the **evaluation model**, which scores it on a 1–4 scale.
3. Scores and feedback are either printed to the console (local run) or logged as a Braintrust experiment.

The dataset covers five categories across easy / medium / hard difficulty:
- Factual recall
- Logical reasoning
- Common sense reasoning
- Language understanding
- Multi-step problem solving

---

## Swapping Models

Models are configured in `models.json`:

```json
{
    "test_model": "nvidia/nemotron-3-nano-30b-a3b:free",
    "evaluation_model": "z-ai/glm-4.5-air:free"
}
```

| Key | Purpose |
|---|---|
| `test_model` | The model being evaluated |
| `evaluation_model` | The LLM judge that scores responses |

Replace either value with any model slug available on OpenRouter (e.g. `openai/gpt-4o`, `anthropic/claude-3.5-sonnet`). No code changes required — just edit the file and re-run.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```
OPENROUTER_API_KEY=<your-openrouter-key>
OPENROUTER_API_KEY_2=<your-second-openrouter-key-if-youre-broke>
BRAINTRUST_API_KEY=<your-braintrust-key>
```

`BRAINTRUST_API_KEY` is only required for the `upload` and `braintrust` scripts.

---

## npm Scripts

### Run evaluation locally

Runs all 20 dataset items through the test model and judge, printing each question, model response, reference answer, and evaluation score/feedback to the console.

```bash
npm run "run local"
```

### Upload dataset to Braintrust

Pushes `evaluation_dataset.json` to a Braintrust dataset named **Evaluation Dataset** under the project **My Project**. Run this once before using the Braintrust eval script.

```bash
npm run upload
```

### Run evaluation and log to Braintrust

Pulls items from the Braintrust dataset, runs them through the test model and judge, and logs results as an experiment in Braintrust (scores are normalized to 0–1).

```bash
npm run braintrust
```

---

## GitHub Action

The workflow at `.github/workflows/eval.yml` automatically runs the Braintrust evaluation on every push to any branch.

**What it does:**
1. Checks out the repository
2. Sets up Node.js 22
3. Installs dependencies
4. Runs `evalToBraintrust.ts` with the required API keys injected from GitHub secrets

**Required GitHub secrets** (set under *Settings → Secrets and variables → Actions*):

| Secret | Description |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_API_KEY_2` | Second OpenRouter API key (used at runtime) |
| `BRAINTRUST_API_KEY` | Braintrust API key |

Each push will produce a new experiment entry in Braintrust, making it easy to compare model performance across commits or model swaps.

Test
