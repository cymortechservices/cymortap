import { Schema, model, type Types } from 'mongoose';

export interface ISession {
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String, maxlength: 200 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
// MongoDB removes expired sessions automatically.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<ISession>('Session', sessionSchema);
