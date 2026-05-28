import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { URL } from "node:url";
import { validateTools } from "../scripts/validate-data.mjs";

const dataPath = new URL("../src/data/tools.json", import.meta.url);

test("tool data is valid", async () => {
  const tools = JSON.parse(await readFile(dataPath, "utf8"));
  assert.deepEqual(validateTools(tools), []);
});

test("every tool has a builder use case distinct from its summary", async () => {
  const tools = JSON.parse(await readFile(dataPath, "utf8"));

  for (const tool of tools) {
    assert.notEqual(tool.builderUseCase, tool.summary, `${tool.id} use case should add practical guidance`);
    assert.ok(tool.builderUseCase.length >= 60, `${tool.id} use case should be specific`);
  }
});

test("radar includes at least one adopt and one pilot candidate", async () => {
  const tools = JSON.parse(await readFile(dataPath, "utf8"));
  const readiness = new Set(tools.map((tool) => tool.readiness));

  assert.ok(readiness.has("Adopt"));
  assert.ok(readiness.has("Pilot"));
});

