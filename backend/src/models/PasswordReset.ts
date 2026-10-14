import { Schema, model, type Types } from 'mongoose';

export interface IPasswordReset {
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
}

const schema = new Schema<IPasswordReset>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: true },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordReset = model<IPasswordReset>('PasswordReset', schema);
