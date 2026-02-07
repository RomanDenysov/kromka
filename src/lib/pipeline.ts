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
 * Assert a condition, throwing PipelineError if falsy.
 * Works as a type guard — narrows the condition to truthy after the call.
 */
export function guard(
  condition: unknown,
  error: string,
  code: ErrorCode
): asserts condition {
  if (!condition) {
    throw new PipelineError(error, code);
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


export function fail(error: string, code: ErrorCode): StepResult<never> {
  return { ok: false, error, code };
}

export function succeed<T>(data: T): StepResult<T> {
  return { ok: true, data };
}
