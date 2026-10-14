import { Schema, model, type Types } from 'mongoose';
import { EVENT_RETENTION_DAYS } from '../config/constants';

export interface IClickEvent {
  link: Types.ObjectId;
  createdAt: Date;
  device: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';
  os: string;
  browser: string;
  referrerHost?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  visitorHash: string;
  isBot: boolean;
  isDuplicate: boolean;
}

const schema = new Schema<IClickEvent>(
  {
    link: { type: Schema.Types.ObjectId, ref: 'Link', required: true },
    createdAt: { type: Date, default: () => new Date() },
    device: { type: String, enum: ['mobile', 'tablet', 'desktop', 'bot', 'unknown'], required: true },
    os: { type: String, maxlength: 20, default: 'other' },
    browser: { type: String, maxlength: 20, default: 'other' },
    referrerHost: { type: String, maxlength: 100 },
    utmSource: { type: String, maxlength: 100 },
    utmMedium: { type: String, maxlength: 100 },
    utmCampaign: { type: String, maxlength: 100 },
    visitorHash: { type: String, required: true },
    isBot: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
  },
  { versionKey: false },
);

// Timeline and aggregation queries for one or many links.
schema.index({ link: 1, createdAt: -1 });
// Deduplication lookup (same visitor, same link, short window).
schema.index({ link: 1, visitorHash: 1, createdAt: -1 });
// Automatic retention.
schema.index({ createdAt: 1 }, { expireAfterSeconds: EVENT_RETENTION_DAYS * 86400 });

export const ClickEvent = model<IClickEvent>('ClickEvent', schema);
