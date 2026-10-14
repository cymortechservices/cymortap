import { Schema, model, type Types } from 'mongoose';

export interface IReport {
  link: Types.ObjectId;
  reason: 'spam' | 'scam' | 'impersonation' | 'harassment' | 'other';
  details?: string;
  reporterHash: string;
  createdAt: Date;
}

const schema = new Schema<IReport>(
  {
    link: { type: Schema.Types.ObjectId, ref: 'Link', required: true },
    reason: { type: String, enum: ['spam', 'scam', 'impersonation', 'harassment', 'other'], required: true },
    details: { type: String, maxlength: 500 },
    reporterHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
// One report per reporter per link, so repeated reports cannot trigger auto-disable alone.
schema.index({ link: 1, reporterHash: 1 }, { unique: true });

export const Report = model<IReport>('Report', schema);
