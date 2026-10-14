import { spawnSync } from "node:child_process";

function parseVersion(slug) {
  const match = slug.match(/^gemini-(\d+)(?:\.(\d+))?/i);
  if (!match) return null;
  return [Number(match[1]), Number(match[2] ?? 0)];
}

function tierScore(slug) {
  if (/-high(?:$|-)/i.test(slug)) return 3;
  if (/-medium(?:$|-)/i.test(slug)) return 2;
  if (/-low(?:$|-)/i.test(slug)) return 1;
  return 0;
}

export function parseGeminiModels(output) {
  const seen = new Set();
  const models = [];
  for (const rawLine of String(output ?? "").split(/\r?\n/)) {
    const slug = rawLine.trim().split(/\s+/)[0];
    if (!/^gemini-/i.test(slug)) continue;
    if (!parseVersion(slug) || seen.has(slug)) continue;
    seen.add(slug);
    models.push(slug);
  }
  return models;
}

export function rankGeminiModels(models) {
  return [...models]
    .map((slug, index) => ({ slug, index, version: parseVersion(slug), tier: tierScore(slug) }))
    .filter((item) => item.version)
    .sort((a, b) => {
      if (a.version[0] !== b.version[0]) return b.version[0] - a.version[0];
      if (a.version[1] !== b.version[1]) return b.version[1] - a.version[1];
      if (a.tier !== b.tier) return b.tier - a.tier;
      return a.index - b.index;
    })
    .map((item) => item.slug);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    windowsHide: true,
    ...options,
  });
}

export function getAvailableGeminiModels({ agyCommand = "agy" } = {}) {
  const result = run(agyCommand, ["models"]);
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`agy models failed with exit ${result.status}: ${result.stderr || result.stdout}`);
  }
  const ranked = rankGeminiModels(parseGeminiModels(result.stdout));
  if (ranked.length === 0) throw new Error("No Gemini models found in agy models output.");
  return ranked;
}

function executePrompt({ agyCommand, prompt, model, useEffort }) {
  const args = ["-p", prompt, "--model", model, "--output-format", "text"];
  if (useEffort) args.push("--effort", "high");
  return run(agyCommand, args);
}

export function runLatestGeminiReview(prompt, { agyCommand = "agy" } = {}) {
  if (!String(prompt ?? "").trim()) throw new Error("A non-empty review prompt is required.");

  const models = getAvailableGeminiModels({ agyCommand });
  const attempts = [];

  for (const model of models) {
    let result = executePrompt({ agyCommand, prompt, model, useEffort: true });

    const effortUnsupported =
      result.status !== 0 &&
      /(?:unknown|unrecognized|invalid).{0,40}(?:--effort|effort)/i.test(
        `${result.stderr ?? ""}\n${result.stdout ?? ""}`,
      );

    if (effortUnsupported) {
      result = executePrompt({ agyCommand, prompt, model, useEffort: false });
    }

    if (!result.error && result.status === 0 && String(result.stdout ?? "").trim()) {
      return {
        model,
        output: result.stdout.trim(),
        attempts,
      };
    }

    attempts.push({
      model,
      exitCode: result.status,
      error: result.error?.message ?? null,
      stderr: String(result.stderr ?? "").trim(),
    });
  }

  const summary = attempts
    .map((attempt) => `${attempt.model}: ${attempt.error || attempt.stderr || `exit ${attempt.exitCode}`}`)
    .join("\n");
  throw new Error(`All available Gemini models failed.\n${summary}`);
}
