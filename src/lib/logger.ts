import { env } from "./config";

type Level = "silent" | "error" | "warn" | "info" | "debug";
const levelOrder: Record<Level, number> = {
  silent: 5,
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};
//
const min = levelOrder[env.LOG_LEVEL as Level] ?? 2;
function logAt(level: Level, ...args: any[]) {
  const cur = levelOrder[level];
  if (cur <= min && env.LOG_LEVEL !== "silent") {
    //no console
    if (level === "debug") {
      console.log(...args);
    } else if (level === "info") {
      console.info(...args);
    } else if (level === "warn") {
      console.warn(...args);
    } else if (level === "error") {
      console.error(...args);
    }
  }
}
export const logger = {
  error: (...a: any[]) => logAt("error", "[ERROR]", ...a),
  warn: (...a: any[]) => logAt("warn", "[WARN]", ...a),
  info: (...a: any[]) => logAt("info", "[INFO]", ...a),
  debug: (...a: any[]) => logAt("debug", "[DEBUG]", ...a),
};
