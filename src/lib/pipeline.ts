import type { ErrorCode } from "./errors";

export type StepResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ErrorCode };

class PipelineError extends Error {
  code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.code = code;
    this.name = "PipelineError";
  }
}
/**
 * Unwrap a StepResult, throwing PipelineError if not ok
 */
export function unwrap<T>(result: StepResult<T>): T {
  if (!result.ok) {
    throw new PipelineError(result.error, result.code);
  }
  return result.data;
}
/**
 * Run an async function and catch PipelineErrors into StepResult
 */
export async function runPipeline<T>(
  fn: () => Promise<T>
): Promise<StepResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    if (e instanceof PipelineError) {
      return { ok: false, error: e.message, code: e.code };
    }
    throw e;
  }
}

/**
 * Run multiple steps in sequence, stopping on first error
 */
export async function pipeline<T>(
  steps: Array<() => Promise<StepResult<T>>>,
  onSuccess: (results: unknown[]) => T
): Promise<StepResult<T>> {
  const results: unknown[] = [];
  for (const step of steps) {
    const result = await step();
    if (!result.ok) {
      return result;
    }
    results.push(result.data);
  }

  return { ok: true, data: onSuccess(results) };
}

export function fail(error: string, code: ErrorCode): StepResult<never> {
  return { ok: false, error, code };
}

export function succeed<T>(data: T): StepResult<T> {
  return { ok: true, data };
}
