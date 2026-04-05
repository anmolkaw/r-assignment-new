import OpenAI from "openai";
import { AiServiceError } from "@/lib/ai/types";

let cachedClient: OpenAI | null = null;

function getApiKey() {
  return process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || "";
}

function getBaseUrl() {
  if (process.env.OPENAI_BASE_URL) {
    return process.env.OPENAI_BASE_URL;
  }

  // If only GROQ_API_KEY is present, default to Groq's OpenAI-compatible endpoint.
  if (!process.env.OPENAI_API_KEY && process.env.GROQ_API_KEY) {
    return "https://api.groq.com/openai/v1";
  }

  return undefined;
}

export function getOpenAIClient() {
  const apiKey = getApiKey();
  const baseURL = getBaseUrl();

  if (!apiKey) {
    throw new AiServiceError(
      "Missing API key. Set OPENAI_API_KEY or GROQ_API_KEY in environment variables.",
      "CONFIG"
    );
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey,
      baseURL
    });
  }

  return cachedClient;
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

export function getOpenAITimeoutMs() {
  const raw = process.env.OPENAI_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : 45_000;
  if (Number.isNaN(parsed) || parsed < 1_000) {
    return 45_000;
  }
  return parsed;
}
