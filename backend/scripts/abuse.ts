/*
 * Abuse tooling.
 *   npm run abuse:list                 -> most-reported links
 *   npm run abuse:disable -- <slug>    -> disable a link (owner cannot re-enable)
 *   npm run abuse:enable -- <slug>     -> lift a moderation disable
 */
import mongoose from 'mongoose';
import { connectDb } from '../src/config/db';
import { Link, Report } from '../src/models';

async function main() {
  const [cmd, slug] = process.argv.slice(2);
  await connectDb();
  if (cmd === 'list') {
    const links = await Link.find({ reportCount: { $gt: 0 } }).sort({ reportCount: -1 }).limit(25);
    for (const l of links) {
      const reasons = await Report.find({ link: l._id }).select('reason details');
      console.log(`${l.slug}\t${l.status}\treports=${l.reportCount}\towner=${l.ownerType}\t${reasons.map((r) => r.reason).join(',')}`);
    }
    if (!links.length) console.log('No reported links.');
  } else if ((cmd === 'disable' || cmd === 'enable') && slug) {
    const link = await Link.findOne({ slug: slug.toLowerCase() });
    if (!link) throw new Error('Link not found');
    link.status = cmd === 'disable' ? 'disabled' : 'active';
    link.disabledReason = cmd === 'disable' ? 'moderation' : undefined;
    await link.save();
    console.log(`${cmd}d ${link.slug}`);
  } else {
    console.log('Usage: abuse.ts list | disable <slug> | enable <slug>');
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
