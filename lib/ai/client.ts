import "server-only";
import OpenAI from "openai";
import { AiServiceError } from "@/lib/ai/types";

let cachedClient: OpenAI | null = null;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_ENV_PREFIX = "GROQ_API_KEY=";

type GroqApiKeyDiagnostics = {
  configured: boolean;
  normalizedFromPrefixedValue: boolean;
};

function getGroqApiKey() {
  const rawValue = process.env.GROQ_API_KEY?.trim();

  if (!rawValue) {
    throw new AiServiceError(
      "GROQ_API_KEY is missing. Set GROQ_API_KEY in your server environment (for example, in .env).",
      "CONFIG"
    );
  }

  const apiKey = rawValue.startsWith(GROQ_ENV_PREFIX)
    ? rawValue.slice(GROQ_ENV_PREFIX.length).trim()
    : rawValue;

  if (!apiKey) {
    throw new AiServiceError(
      "GROQ_API_KEY is present but empty after normalization. Store only the raw key value (without 'GROQ_API_KEY=' prefix).",
      "CONFIG"
    );
  }

  return apiKey;
}

export function getGroqApiKeyDiagnostics(): GroqApiKeyDiagnostics {
  const rawValue = process.env.GROQ_API_KEY?.trim() ?? "";
  const normalized = rawValue.startsWith(GROQ_ENV_PREFIX)
    ? rawValue.slice(GROQ_ENV_PREFIX.length).trim()
    : rawValue;

  return {
    configured: normalized.length > 0,
    normalizedFromPrefixedValue: rawValue.startsWith(GROQ_ENV_PREFIX)
  };
}

export function getOpenAIClient() {
  const apiKey = getGroqApiKey();

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey,
      baseURL: GROQ_BASE_URL
    });
  }

  return cachedClient;
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL || "openai/gpt-oss-20b";
}

export function getOpenAITimeoutMs() {
  const raw = process.env.OPENAI_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : 45_000;
  if (Number.isNaN(parsed) || parsed < 1_000) {
    return 45_000;
  }
  return parsed;
}
