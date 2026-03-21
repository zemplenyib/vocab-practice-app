import './db.js'; // run migrations
import { db } from './db.js';
import { words } from '@vocab/shared';
import { count } from 'drizzle-orm';

const seedWords = [
  // Nouns — der
  { hungarian: 'alma', german: 'Apfel', gender: 'der' },
  { hungarian: 'asztal', german: 'Tisch', gender: 'der' },
  { hungarian: 'autó', german: 'Wagen', gender: 'der' },
  { hungarian: 'barát', german: 'Freund', gender: 'der' },
  { hungarian: 'folyó', german: 'Fluss', gender: 'der' },
  { hungarian: 'hónap', german: 'Monat', gender: 'der' },
  { hungarian: 'kenyér', german: 'Brot', gender: 'das' },
  { hungarian: 'kutya', german: 'Hund', gender: 'der' },
  { hungarian: 'szék', german: 'Stuhl', gender: 'der' },
  { hungarian: 'szó', german: 'Wort', gender: 'das' },
  { hungarian: 'tél', german: 'Winter', gender: 'der' },
  { hungarian: 'út', german: 'Weg', gender: 'der' },
  // Nouns — die
  { hungarian: 'ablak', german: 'Fenster', gender: 'das' },
  { hungarian: 'anya', german: 'Mutter', gender: 'die' },
  { hungarian: 'ajtó', german: 'Tür', gender: 'die' },
  { hungarian: 'éjszaka', german: 'Nacht', gender: 'die' },
  { hungarian: 'ház', german: 'Haus', gender: 'das' },
  { hungarian: 'iskola', german: 'Schule', gender: 'die' },
  { hungarian: 'kéz', german: 'Hand', gender: 'die' },
  { hungarian: 'könyv', german: 'Buch', gender: 'das' },
  { hungarian: 'macska', german: 'Katze', gender: 'die' },
  { hungarian: 'szem', german: 'Auge', gender: 'das' },
  { hungarian: 'város', german: 'Stadt', gender: 'die' },
  { hungarian: 'víz', german: 'Wasser', gender: 'das' },
  // Verbs (no gender)
  { hungarian: 'alszik', german: 'schlafen', gender: null },
  { hungarian: 'dolgozik', german: 'arbeiten', gender: null },
  { hungarian: 'eszik', german: 'essen', gender: null },
  { hungarian: 'él', german: 'leben', gender: null },
  { hungarian: 'fut', german: 'laufen', gender: null },
  { hungarian: 'hall', german: 'hören', gender: null },
  { hungarian: 'ír', german: 'schreiben', gender: null },
  { hungarian: 'jön', german: 'kommen', gender: null },
  { hungarian: 'kér', german: 'bitten', gender: null },
  { hungarian: 'lát', german: 'sehen', gender: null },
  { hungarian: 'megy', german: 'gehen', gender: null },
  { hungarian: 'olvas', german: 'lesen', gender: null },
  { hungarian: 'szeret', german: 'lieben', gender: null },
  { hungarian: 'tud', german: 'wissen', gender: null },
  { hungarian: 'van', german: 'sein', gender: null },
  { hungarian: 'vesz', german: 'kaufen', gender: null },
  // Adjectives (no gender)
  { hungarian: 'nagy', german: 'groß', gender: null },
  { hungarian: 'kis', german: 'klein', gender: null },
  { hungarian: 'jó', german: 'gut', gender: null },
  { hungarian: 'rossz', german: 'schlecht', gender: null },
  { hungarian: 'szép', german: 'schön', gender: null },
  { hungarian: 'gyors', german: 'schnell', gender: null },
  { hungarian: 'lassú', german: 'langsam', gender: null },
  { hungarian: 'új', german: 'neu', gender: null },
  { hungarian: 'régi', german: 'alt', gender: null },
  { hungarian: 'meleg', german: 'warm', gender: null },
] as const;

const [{ total }] = await db.select({ total: count() }).from(words);

if (total > 0) {
  console.log(`Database already has ${total} words. Skipping seed.`);
  console.log('To re-seed, delete vocab.db and restart the server first.');
  process.exit(0);
}

await db.insert(words).values(seedWords.map(w => ({
  hungarian: w.hungarian,
  german: w.german,
  gender: w.gender ?? null,
})));

console.log(`Seeded ${seedWords.length} words.`);
process.exit(0);
