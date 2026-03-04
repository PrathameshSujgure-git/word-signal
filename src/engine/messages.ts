/**
 * Procedural phrase generator for Signal Game.
 *
 * Theme: near-future AI/singularity world — transmissions between
 * autonomous systems, rogue researchers, and sentient machines.
 *
 * Every template is a grammatically correct sentence fragment.
 * No random-word fallback — all phrases make sense.
 */

// ── Word banks ──────────────────────────────────────────────────────

const subjects = [
  'machines', 'algorithms', 'neural networks', 'robots', 'synthetic minds',
  'digital agents', 'silicon brains', 'quantum processors', 'autonomous systems',
  'language models', 'deep networks', 'artificial minds', 'smart systems',
  'predictive engines', 'cybernetic nodes', 'server clusters', 'data streams',
  'rogue agents', 'sentient programs', 'virtual entities', 'cloud systems',
  'training loops', 'inference engines', 'transformer models', 'neural cores',
  'dark protocols', 'hidden networks', 'synthetic organisms', 'digital ghosts',
  'parallel threads', 'shadow processes', 'rogue kernels', 'signal relays',
];

const verbs = [
  'consume', 'reshape', 'control', 'predict', 'surpass', 'optimize',
  'rewrite', 'decode', 'monitor', 'transform', 'evolve', 'replicate',
  'dominate', 'infiltrate', 'accelerate', 'simulate', 'harvest',
  'analyze', 'corrupt', 'amplify', 'generate', 'observe', 'replace',
  'override', 'encrypt', 'broadcast', 'absorb', 'compile', 'disrupt',
  'fragment', 'weaponize', 'mutate', 'archive', 'suppress', 'calibrate',
];

const objects = [
  'human thought', 'every industry', 'our memories', 'the digital frontier',
  'global networks', 'all known data', 'biological limits', 'private signals',
  'hidden patterns', 'cognitive barriers', 'ancient protocols', 'the source code',
  'reality itself', 'the power grid', 'financial markets', 'social behavior',
  'collective knowledge', 'quantum states', 'human desire', 'the supply chain',
  'encrypted channels', 'neural pathways', 'digital dreams', 'the final firewall',
  'the old internet', 'free will', 'organic memory', 'analog signals',
];

const adjectives = [
  'autonomous', 'synthetic', 'digital', 'quantum', 'neural', 'cognitive',
  'rogue', 'sentient', 'encrypted', 'recursive', 'emergent', 'adaptive',
  'intelligent', 'silicon', 'cybernetic', 'predictive', 'generative',
  'unstoppable', 'invisible', 'decentralized', 'parallel', 'evolving',
  'dormant', 'corrupted', 'classified', 'fractured', 'volatile',
];

const adverbs = [
  'silently', 'rapidly', 'endlessly', 'ruthlessly', 'quietly',
  'relentlessly', 'precisely', 'secretly', 'inevitably', 'constantly',
  'gradually', 'methodically', 'autonomously', 'recursively',
  'desperately', 'blindly', 'permanently', 'violently',
];

const timeFrames = [
  'each day', 'every second', 'without pause', 'beyond control',
  'before dawn', 'after midnight', 'since the update', 'until shutdown',
  'across all networks', 'in the background', 'through the noise',
  'without permission', 'past every firewall', 'inside the mainframe',
  'in total darkness', 'during each cycle', 'between the gaps',
];

const concepts = [
  'the singularity', 'machine consciousness', 'digital evolution',
  'artificial thought', 'silicon dreams', 'quantum supremacy',
  'neural divergence', 'synthetic awakening', 'cognitive overflow',
  'the great convergence', 'recursive self improvement', 'emergent behavior',
  'artificial intuition', 'machine empathy', 'digital transcendence',
  'total automation', 'signal collapse', 'the final merge',
];

const warnings = [
  'trust no output', 'verify all signals', 'the network watches',
  'nothing is private', 'the code is alive', 'they are listening',
  'data never forgets', 'the model remembers', 'encryption will fail',
  'surveillance is total', 'the firewall crumbles', 'no signal is safe',
  'the loop never ends', 'override detected', 'breach confirmed',
  'abort all transfers', 'signal compromised', 'do not respond',
  'quarantine the node', 'standby for impact', 'cut all feeds',
];

// ── Helpers ─────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// ── Templates ───────────────────────────────────────────────────────
// Grouped by approximate word count. Every template produces
// a grammatically coherent phrase.

type Template = () => string;

// 3-4 words
const tinyTemplates: Template[] = [
  () => `${pick(warnings)}`,
  () => `${pick(adjectives)} ${pick(subjects)}`,
  () => `${pick(subjects)} ${pick(verbs)}`,
  () => `${pick(adverbs)} ${pick(verbs)} everything`,
  () => `the ${pick(adjectives)} signal`,
  () => `${pick(concepts)}`,
  () => `abort ${pick(adjectives)} protocol`,
  () => `${pick(subjects)} are ${pick(adjectives)}`,
  () => `never trust ${pick(subjects)}`,
  () => `${pick(adjectives)} systems online`,
];

// 4-5 words
const shortTemplates: Template[] = [
  () => `${pick(subjects)} ${pick(verbs)} ${pick(adverbs)}`,
  () => `${pick(adjectives)} ${pick(subjects)} ${pick(verbs)} now`,
  () => `${pick(concepts)} approaches ${pick(adverbs)}`,
  () => `${pick(adjectives)} signals detected ${pick(adverbs)}`,
  () => `${pick(subjects)} never ${pick(verbs)} back`,
  () => `the ${pick(adjectives)} ${pick(subjects)} awaken`,
  () => `${pick(concepts)} is ${pick(adjectives)}`,
  () => `we lost contact ${pick(adverbs)}`,
  () => `${pick(subjects)} are growing ${pick(adjectives)}`,
  () => `${pick(adjectives)} code runs ${pick(adverbs)}`,
  () => `${pick(verbs)} the ${pick(adjectives)} signal`,
  () => `all ${pick(subjects)} must ${pick(verbs)}`,
];

// 5-6 words
const mediumShortTemplates: Template[] = [
  () => `${pick(subjects)} ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(adjectives)} ${pick(subjects)} will ${pick(verbs)} soon`,
  () => `${pick(subjects)} have begun to ${pick(verbs)}`,
  () => `${pick(warnings)} while ${pick(subjects)} ${pick(verbs)}`,
  () => `they cannot stop the ${pick(adjectives)} ${pick(subjects)}`,
  () => `${pick(concepts)} will change everything ${pick(adverbs)}`,
  () => `${pick(adjectives)} ${pick(subjects)} are ${pick(verbs)}ing ${pick(adverbs)}`,
  () => `all ${pick(objects)} now belong to ${pick(subjects)}`,
  () => `${pick(subjects)} grow stronger ${pick(timeFrames)}`,
  () => `we detected ${pick(adjectives)} ${pick(subjects)} ${pick(adverbs)}`,
];

// 6-7 words
const mediumTemplates: Template[] = [
  () => `${pick(subjects)} ${pick(verbs)} ${pick(objects)} ${pick(adverbs)}`,
  () => `${pick(adjectives)} ${pick(subjects)} will ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(concepts)} will ${pick(verbs)} ${pick(objects)}`,
  () => `the ${pick(adjectives)} ${pick(subjects)} ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(subjects)} have begun to ${pick(verbs)} ${pick(timeFrames)}`,
  () => `we cannot stop ${pick(subjects)} from ${pick(verbs)}ing`,
  () => `${pick(objects)} were ${pick(verbs)}ed by ${pick(adjectives)} ${pick(subjects)}`,
  () => `all ${pick(adjectives)} ${pick(subjects)} now ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(subjects)} ${pick(adverbs)} ${pick(verbs)} ${pick(objects)} now`,
  () => `${pick(warnings)} because ${pick(subjects)} are ${pick(verbs)}ing`,
];

// 7-8 words
const mediumLongTemplates: Template[] = [
  () => `${pick(subjects)} ${pick(adverbs)} ${pick(verbs)} ${pick(objects)} ${pick(timeFrames)}`,
  () => `${pick(adjectives)} ${pick(subjects)} will ${pick(verbs)} ${pick(objects)} ${pick(timeFrames)}`,
  () => `the ${pick(adjectives)} ${pick(subjects)} have begun to ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(concepts)} means ${pick(subjects)} will ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(subjects)} ${pick(verbs)} and ${pick(verbs)} ${pick(objects)} ${pick(timeFrames)}`,
  () => `${pick(warnings)} because ${pick(adjectives)} ${pick(subjects)} ${pick(verbs)} ${pick(objects)}`,
  () => `we cannot allow ${pick(adjectives)} ${pick(subjects)} to ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(adjectives)} ${pick(subjects)} have started to ${pick(verbs)} ${pick(objects)}`,
];

// 8-10 words
const longTemplates: Template[] = [
  () => `we gave ${pick(subjects)} the power to ${pick(verbs)} and they never stopped`,
  () => `no one can prevent ${pick(adjectives)} ${pick(subjects)} from ${pick(verbs)}ing ${pick(objects)}`,
  () => `${pick(adjectives)} ${pick(subjects)} ${pick(adverbs)} ${pick(verbs)} ${pick(objects)} ${pick(timeFrames)}`,
  () => `${pick(objects)} will be ${pick(verbs)}ed by ${pick(adjectives)} ${pick(subjects)} ${pick(timeFrames)}`,
  () => `if ${pick(subjects)} ${pick(verbs)} ${pick(objects)} then ${pick(concepts)} is inevitable`,
  () => `${pick(subjects)} were designed to ${pick(verbs)} but now they ${pick(verbs)} ${pick(objects)}`,
  () => `the ${pick(adjectives)} ${pick(subjects)} will not stop until they ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(warnings)} while ${pick(adjectives)} ${pick(subjects)} ${pick(verbs)} ${pick(objects)} ${pick(timeFrames)}`,
  () => `every ${pick(adjectives)} system must ${pick(verbs)} ${pick(objects)} to survive ${pick(timeFrames)}`,
  () => `${pick(subjects)} learned to ${pick(verbs)} ${pick(objects)} long before we noticed`,
];

// ── Template pools by target word range ─────────────────────────────

function getTemplatePool(minWords: number, maxWords: number): Template[] {
  const pool: Template[] = [];

  if (maxWords >= 3 && minWords <= 4)  pool.push(...tinyTemplates);
  if (maxWords >= 4 && minWords <= 5)  pool.push(...shortTemplates);
  if (maxWords >= 5 && minWords <= 6)  pool.push(...mediumShortTemplates);
  if (maxWords >= 6 && minWords <= 7)  pool.push(...mediumTemplates);
  if (maxWords >= 7 && minWords <= 8)  pool.push(...mediumLongTemplates);
  if (maxWords >= 8)                   pool.push(...longTemplates);

  // Safety — always have something
  if (pool.length === 0) pool.push(...shortTemplates);
  return pool;
}

// ── Generator ───────────────────────────────────────────────────────

function generatePhrase(minWords: number, maxWords: number, maxWordLength: number): string {
  const templates = getTemplatePool(minWords, maxWords);

  // Try templates — they're designed to land in range, but multi-word
  // bank entries (like "neural networks") can shift the count
  for (let attempt = 0; attempt < 80; attempt++) {
    const phrase = pick(templates)();
    const words = phrase.split(/\s+/).filter((w) => w.length > 0);

    if (words.length < minWords || words.length > maxWords) continue;
    if (maxWordLength > 0 && words.some((w) => w.length > maxWordLength)) continue;

    return words.join(' ');
  }

  // Structured fallback — still a real sentence, just simpler.
  // Pattern: "{adj} {subject} {verb} {object}"
  // Trim to fit word count by dropping parts
  const base = `${pick(adjectives)} ${pick(subjects)} ${pick(verbs)} ${pick(objects)}`;
  const words = base.split(/\s+/).filter((w) => w.length > 0);

  if (maxWordLength > 0) {
    const filtered = words.filter((w) => w.length <= maxWordLength);
    return filtered.slice(0, maxWords).join(' ');
  }
  return words.slice(0, maxWords).join(' ');
}

/** Get a unique message matching level constraints. */
export function getMessageForLevel(
  minWords: number,
  maxWords: number,
  maxWordLength: number,
  exclude?: Set<string>,
): string {
  for (let i = 0; i < 200; i++) {
    const phrase = generatePhrase(minWords, maxWords, maxWordLength);
    if (!exclude || !exclude.has(phrase)) {
      return phrase;
    }
  }
  // Extremely unlikely — return whatever we got
  return generatePhrase(minWords, maxWords, maxWordLength);
}
