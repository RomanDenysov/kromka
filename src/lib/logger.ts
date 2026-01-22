import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

const baseLogger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),

  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});

const MODULES = [
  "orders",
  "b2b",
  "blog",
  "auth",
  "email",
  "stores",
  "users",
  "cart",
  "db",
  "payments",
  "invoices",
] as const;

export type LogModule = (typeof MODULES)[number];

type ModuleLoggers = {
  [K in LogModule]: pino.Logger;
};

function createModuleLoggers(): ModuleLoggers {
  const loggers = {} as ModuleLoggers;

  for (const module of MODULES) {
    loggers[module] = baseLogger.child({ module });
  }

  return loggers;
}

export const log = createModuleLoggers();

export const logger = baseLogger;

/**
 * Create a logger for a specific request.
 * @param module - The module to log to.
 * @param context - Additional context to add to the logger.
 * @returns A logger for the specific request.
 */

export function createRequestLogger(
  module: LogModule,
  context?: Record<string, unknown>
) {
  return log[module].child({
    requestId: crypto.randomUUID(),
    ...context,
  });
}
