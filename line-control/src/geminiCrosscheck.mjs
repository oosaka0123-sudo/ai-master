#!/usr/bin/env node
import { runLatestGeminiReview } from "./geminiRouting.mjs";

const prompt = process.argv.slice(2).join(" ").trim();

if (!prompt) {
  console.error('Usage: node src/geminiCrosscheck.mjs "review prompt"');
  process.exit(2);
}

try {
  const result = runLatestGeminiReview(prompt);
  console.error(`[Gemini model] ${result.model}`);
  if (result.attempts.length) {
    console.error("[Fallbacks]");
    for (const attempt of result.attempts) {
      console.error(`- ${attempt.model}: ${attempt.error || attempt.stderr || attempt.exitCode}`);
    }
  }
  process.stdout.write(result.output + "\n");
} catch (error) {
  console.error(error?.stack || String(error));
  process.exit(1);
}
