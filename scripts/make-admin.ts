/**
 * Promotes an existing account to admin (register on the website first).
 *
 *   npm run make-admin -- you@example.com .env.production.local
 */
import fs from 'node:fs';
import mongoose from 'mongoose';
import { User } from '../src/models/User';

const [email, envFile] = process.argv.slice(2);
for (const f of [envFile, '.env.local', '.env'].filter(Boolean) as string[]) {
  if (fs.existsSync(f)) process.loadEnvFile(f);
}

async function main() {
  if (!email) throw new Error('Usage: npm run make-admin -- <email> [env-file]');
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'nihongoacademy' });
  const res = await User.updateOne({ email: email.toLowerCase().trim() }, { role: 'admin' });
  console.info(
    res.matchedCount
      ? `✓ ${email} is now an admin (sign out and in again)`
      : `No account for ${email} — register on the website first`
  );
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect();
  process.exit(1);
});
