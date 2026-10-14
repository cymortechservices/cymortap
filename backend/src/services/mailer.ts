import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const mailConfigured = env.smtp.configured;

const transport = env.smtp.configured
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : null;

/** Returns true only when the provider accepted the message. */
export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  if (!transport) return false;
  try {
    await transport.sendMail({ from: env.smtp.from, to, subject, text });
    return true;
  } catch (err) {
    logger.error('Email delivery failed', { err: err instanceof Error ? err : String(err) });
    return false;
  }
}
