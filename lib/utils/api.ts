import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AiServiceError } from "@/lib/ai/types";

export class InvalidJsonBodyError extends Error {
  constructor(message = "Invalid JSON body") {
    super(message);
    this.name = "InvalidJsonBodyError";
  }
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof InvalidJsonBodyError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.issues
      },
      { status: 400 }
    );
  }

  if (error instanceof AiServiceError) {
    const status = error.code === "CONFIG" ? 500 : error.code === "TIMEOUT" ? 504 : 502;
    return NextResponse.json({ error: error.message, code: error.code }, { status });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function parseJsonBody<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new InvalidJsonBodyError();
  }
}
