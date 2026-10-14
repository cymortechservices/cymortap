import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { EXPIRED_LINK_PURGE_DAYS, LINK_THEMES, MAX_DESCRIPTION_LENGTH, MAX_MESSAGE_LENGTH, MAX_TITLE_LENGTH } from '../config/constants';

export interface ILink {
  slug: string;
  phone: string;
  message: string;
  title?: string;
  description?: string;
  theme: (typeof LINK_THEMES)[number];
  ownerType: 'guest' | 'user';
  owner?: Types.ObjectId;
  status: 'active' | 'disabled' | 'deleted';
  disabledReason?: 'owner' | 'moderation';
  expiresAt?: Date | null;
  deletedAt?: Date;
  analyticsEnabled: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}
export type LinkDocument = HydratedDocument<ILink>;

const linkSchema = new Schema<ILink>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 40 },
    phone: { type: String, required: true, match: /^\d{7,15}$/ },
    message: { type: String, default: '', maxlength: MAX_MESSAGE_LENGTH },
    title: { type: String, trim: true, maxlength: MAX_TITLE_LENGTH },
    description: { type: String, trim: true, maxlength: MAX_DESCRIPTION_LENGTH },
    theme: { type: String, enum: [...LINK_THEMES], default: 'midnight' },
    ownerType: { type: String, enum: ['guest', 'user'], required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'disabled', 'deleted'], default: 'active' },
    disabledReason: { type: String, enum: ['owner', 'moderation'] },
    expiresAt: { type: Date, default: null },
    deletedAt: { type: Date },
    analyticsEnabled: { type: Boolean, default: true },
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Dashboard listing and counts per owner.
linkSchema.index({ owner: 1, status: 1, createdAt: -1 });
// Guest links are removed from the database a while after they expire. Links without
// expiresAt (account links) are never touched by this index.
linkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: EXPIRED_LINK_PURGE_DAYS * 86400 });

export const Link = model<ILink>('Link', linkSchema);
