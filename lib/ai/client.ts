import "server-only";
import OpenAI from "openai";
import { AiServiceError } from "@/lib/ai/types";

let cachedClient: OpenAI | null = null;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new AiServiceError(
      "GROQ_API_KEY is missing. Set GROQ_API_KEY in your server environment (for example, in .env).",
      "CONFIG"
    );
  }

  return apiKey;
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
