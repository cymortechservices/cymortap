import { Schema, model, type HydratedDocument } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  displayName: string;
  status: 'active' | 'suspended';
  emailVerified: boolean;
  preferences: { defaultAnalyticsEnabled: boolean };
  createdAt: Date;
  updatedAt: Date;
}
export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    emailVerified: { type: Boolean, default: false },
    preferences: { defaultAnalyticsEnabled: { type: Boolean, default: true } },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
