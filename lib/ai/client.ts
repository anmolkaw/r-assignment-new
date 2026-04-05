import OpenAI from "openai";
import { AiServiceError } from "@/lib/ai/types";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AiServiceError("OPENAI_API_KEY is missing from environment variables.", "CONFIG");
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
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
