import { readFile } from "node:fs/promises";
import { URL } from "node:url";

const dataPath = new URL("../src/data/tools.json", import.meta.url);
const allowedReadiness = new Set(["Adopt", "Pilot", "Watch"]);
const allowedConfidence = new Set(["High", "Medium", "Low"]);
const requiredStringFields = [
  "id",
  "name",
  "company",
  "category",
  "status",
  "readiness",
  "summary",
  "builderUseCase",
  "watchItem",
  "sourceUrl",
  "sourceType",
  "confidence",
  "lastVerified"
];

const tools = JSON.parse(await readFile(dataPath, "utf8"));
const errors = validateTools(tools);

if (errors.length > 0) {
  console.error("Tool data validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${tools.length} tools.`);

export function validateTools(value) {
  const errors = [];

  if (!Array.isArray(value)) {
    return ["Top-level data must be an array."];
  }

  const ids = new Set();

  value.forEach((tool, index) => {
    const label = tool?.id || `tool at index ${index}`;

    if (!tool || typeof tool !== "object" || Array.isArray(tool)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    for (const field of requiredStringFields) {
      if (typeof tool[field] !== "string" || tool[field].trim() === "") {
        errors.push(`${label}.${field} must be a non-empty string.`);
      }
    }

    if (ids.has(tool.id)) {
      errors.push(`${label}.id must be unique.`);
    }
    ids.add(tool.id);

    if (!/^[a-z0-9-]+$/.test(tool.id)) {
      errors.push(`${label}.id must be kebab-case.`);
    }

    if (!allowedReadiness.has(tool.readiness)) {
      errors.push(`${label}.readiness must be Adopt, Pilot, or Watch.`);
    }

    if (!allowedConfidence.has(tool.confidence)) {
      errors.push(`${label}.confidence must be High, Medium, or Low.`);
    }

    if (!isValidUrl(tool.sourceUrl)) {
      errors.push(`${label}.sourceUrl must be a valid URL.`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(tool.lastVerified)) {
      errors.push(`${label}.lastVerified must use YYYY-MM-DD format.`);
    }

    if (!Array.isArray(tool.tags) || tool.tags.length === 0) {
      errors.push(`${label}.tags must be a non-empty array.`);
    } else {
      tool.tags.forEach((tag, tagIndex) => {
        if (typeof tag !== "string" || tag.trim() === "") {
          errors.push(`${label}.tags[${tagIndex}] must be a non-empty string.`);
        }
      });
    }
  });

  return errors;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

