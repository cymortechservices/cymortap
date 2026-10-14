import { env } from '../config/env';

type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const SENSITIVE = /pass|secret|token|authorization|cookie|mongodb|uri|hash/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE.test(k) ? '[redacted]' : redact(v, depth + 1);
  }
  return out;
}

const configured = (process.env.LOG_LEVEL as Level | undefined) ?? 'info';
const threshold = env.isTest ? 100 : ORDER[configured] ?? 20;

function write(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (ORDER[level] < threshold) return;
  const line = JSON.stringify({ level, time: new Date().toISOString(), msg, ...(redact(meta) as object) });
  (level === 'error' ? process.stderr : process.stdout).write(line + '\n');
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => write('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => write('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => write('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write('error', msg, meta),
};
