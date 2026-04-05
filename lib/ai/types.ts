export class AiServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "CONFIG" | "TIMEOUT" | "BAD_RESPONSE" | "API_ERROR"
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

export type AiGenerationResult<T> = {
  prompt: string;
  rawResponse: string;
  parsedResponse: T;
  model: string;
};
