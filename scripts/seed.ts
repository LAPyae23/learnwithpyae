/**
 * Seeds MongoDB with flashcard content and a demo student account.
 *
 *   npm run seed                              # uses MONGODB_URI from .env.local / .env
 *   npm run seed -- .env.production.local     # seed the Atlas DB pulled from Vercel
 *
 * Optional, to create an admin account (never commit these values):
 *   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='...' npm run seed
 *
 * Safe to re-run: decks/cards are upserted by slug/key, users are only created if missing.
 */
import fs from 'node:fs';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { decks, cards } from '../src/data/flashcards';
import { Deck, Card } from '../src/models/Flashcard';
import { User } from '../src/models/User';

// Optional env file argument wins (loadEnvFile never overwrites a variable already set):
//   npm run seed -- .env.production.local
for (const f of [process.argv[2], '.env.local', '.env'].filter(Boolean) as string[]) {
  if (fs.existsSync(f)) process.loadEnvFile(f);
}

const DEMO_STUDENT = {
  email: 'student@nihongoacademy.demo',
  password: 'Demo@2026',
  name: 'မောင်မောင်',
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'nihongoacademy' });
  console.info(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  await Promise.all([Deck.syncIndexes(), Card.syncIndexes(), User.syncIndexes()]);

  const deckIds = new Map<string, mongoose.Types.ObjectId>();
  for (const d of decks) {
    const doc = await Deck.findOneAndUpdate({ slug: d.slug }, d, {
      upsert: true,
      returnDocument: 'after',
    });
    deckIds.set(d.slug, doc._id as mongoose.Types.ObjectId);
  }

  let order = 0;
  for (const card of cards) {
    const deck = decks.find((d) => d.slug === card.deck);
    if (!deck) throw new Error(`Card ${card.key} references unknown deck ${card.deck}`);
    await Card.updateOne(
      { key: card.key },
      {
        ...card,
        deck: deckIds.get(card.deck),
        level: deck.level,
        type: deck.type,
        order: order++,
      },
      { upsert: true }
    );
  }
  console.info(`Upserted ${decks.length} decks, ${cards.length} cards`);

  async function ensureUser(
    email: string,
    password: string,
    name: string,
    role: 'student' | 'admin'
  ) {
    if (await User.exists({ email })) {
      console.info(`User exists: ${email}`);
      return;
    }
    await User.create({
      email,
      name,
      role,
      passwordHash: await bcrypt.hash(password, 12),
      targetLevel: 'N5',
    });
    console.info(`Created ${role}: ${email}`);
  }

  await ensureUser(DEMO_STUDENT.email, DEMO_STUDENT.password, DEMO_STUDENT.name, 'student');

  const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;
  if (SEED_ADMIN_EMAIL && SEED_ADMIN_PASSWORD) {
    await ensureUser(SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, 'Admin', 'admin');
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
