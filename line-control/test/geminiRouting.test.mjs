import test from "node:test";
import assert from "node:assert/strict";
import { parseGeminiModels, rankGeminiModels } from "../src/geminiRouting.mjs";

test("parses Gemini model slugs", () => {
  const output = [
    "gemini-3.8-flash-high Gemini 3.8 Flash High",
    "gemini-4-argon-medium Gemini 4 Argon Medium",
    "gemini-4-argon-high Gemini 4 Argon High",
  ].join("\n");

  assert.deepEqual(parseGeminiModels(output), [
    "gemini-3.8-flash-high",
    "gemini-4-argon-medium",
    "gemini-4-argon-high",
  ]);
});

test("prefers newest version and then high reasoning tier", () => {
  assert.deepEqual(
    rankGeminiModels([
      "gemini-3.8-flash-high",
      "gemini-4-argon-medium",
      "gemini-4-argon-high",
      "gemini-3.1-pro-high",
      "gemini-4-argon-low",
    ]),
    [
      "gemini-4-argon-high",
      "gemini-4-argon-medium",
      "gemini-4-argon-low",
      "gemini-3.8-flash-high",
      "gemini-3.1-pro-high",
    ],
  );
});

test("compares version numbers numerically", () => {
  assert.deepEqual(
    rankGeminiModels(["gemini-3.9-flash-high", "gemini-3.10-flash-high"]),
    ["gemini-3.10-flash-high", "gemini-3.9-flash-high"],
  );
});
