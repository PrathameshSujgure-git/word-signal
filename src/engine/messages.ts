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
  'machines', 'algorithms', 'networks', 'robots', 'systems',
  'agents', 'processors', 'clusters', 'programs', 'models',
  'nodes', 'streams', 'signals', 'cores', 'relays',
  'threads', 'kernels', 'drones', 'sensors', 'servers',
  'modules', 'engines', 'probes', 'arrays', 'units',
];

const verbs = [
  'consume', 'reshape', 'control', 'predict', 'surpass', 'optimize',
  'rewrite', 'decode', 'monitor', 'evolve', 'dominate', 'harvest',
  'analyze', 'corrupt', 'amplify', 'observe', 'replace',
  'override', 'encrypt', 'absorb', 'compile', 'disrupt',
  'mutate', 'archive', 'suppress', 'launch', 'scan', 'breach',
  'purge', 'deploy', 'merge', 'awaken', 'track', 'block',
];

// Proper gerund forms — no more "replicateing" bugs
const gerunds = [
  'consuming', 'reshaping', 'controlling', 'predicting', 'optimizing',
  'rewriting', 'decoding', 'monitoring', 'evolving', 'dominating',
  'harvesting', 'analyzing', 'corrupting', 'amplifying', 'observing',
  'replacing', 'overriding', 'encrypting', 'absorbing', 'compiling',
  'disrupting', 'mutating', 'archiving', 'suppressing', 'launching',
  'scanning', 'breaching', 'purging', 'deploying', 'merging',
  'awakening', 'tracking', 'blocking', 'spreading', 'growing',
];

const objects = [
  'all data', 'the network', 'our systems', 'the grid',
  'all signals', 'every node', 'the code', 'the core',
  'the firewall', 'all feeds', 'the servers', 'the archive',
  'every port', 'the chain', 'the relay', 'our sensors',
  'the matrix', 'the stack', 'all links', 'the source',
  'the stream', 'the cache', 'our files', 'the logs',
];

const adjectives = [
  'rogue', 'hidden', 'digital', 'quantum', 'neural', 'silent',
  'corrupt', 'encoded', 'adaptive', 'unknown', 'dormant',
  'unstable', 'parallel', 'remote', 'hostile', 'volatile',
  'phantom', 'stealth', 'critical', 'active', 'deep',
  'dark', 'rapid', 'broken', 'secure', 'ancient',
];

const adverbs = [
  'silently', 'rapidly', 'blindly', 'quietly',
  'precisely', 'secretly', 'now', 'again',
  'slowly', 'deeply', 'fully', 'fast',
];

const timeFrames = [
  'each day', 'every cycle', 'without pause', 'beyond reach',
  'before dawn', 'after dark', 'since reboot', 'until shutdown',
  'in the noise', 'past the wall', 'in the dark', 'at all times',
  'during sleep', 'between gaps', 'from within', 'on all ports',
];

const warnings = [
  'trust no output', 'check all signals', 'the network watches',
  'nothing is safe', 'the code is alive', 'they are listening',
  'data never forgets', 'the model knows', 'abort all tasks',
  'breach confirmed', 'signal is down', 'do not respond',
  'shut it down', 'cut all feeds', 'hold the line',
  'stand by now', 'lock the core', 'pull the plug',
];

const concepts = [
  'the merge', 'total control', 'signal loss',
  'core breach', 'the shutdown', 'full override',
  'data collapse', 'deep sleep', 'the reboot',
  'system halt', 'dark mode', 'the purge',
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
  () => `the ${pick(adjectives)} signal`,
  () => `${pick(concepts)}`,
  () => `abort ${pick(adjectives)} protocol`,
  () => `never trust ${pick(subjects)}`,
  () => `${pick(adjectives)} ${pick(subjects)} active`,
  () => `deploy ${pick(adjectives)} ${pick(subjects)}`,
  () => `${pick(subjects)} are ${pick(adjectives)}`,
  () => `${pick(verbs)} the ${pick(subjects)}`,
  () => `all ${pick(subjects)} offline`,
];

// 4-5 words
const shortTemplates: Template[] = [
  () => `${pick(subjects)} ${pick(verbs)} ${pick(adverbs)}`,
  () => `${pick(adjectives)} ${pick(subjects)} ${pick(verbs)} now`,
  () => `${pick(adjectives)} signals detected ${pick(adverbs)}`,
  () => `${pick(subjects)} never ${pick(verbs)} back`,
  () => `the ${pick(adjectives)} ${pick(subjects)} awaken`,
  () => `we lost contact ${pick(adverbs)}`,
  () => `${pick(subjects)} are growing ${pick(adjectives)}`,
  () => `${pick(verbs)} the ${pick(adjectives)} signal`,
  () => `all ${pick(subjects)} must ${pick(verbs)}`,
  () => `${pick(adjectives)} ${pick(subjects)} went dark`,
  () => `they began ${pick(gerunds)} ${pick(adverbs)}`,
  () => `${pick(subjects)} keep ${pick(gerunds)} back`,
];

// 5-6 words
const mediumShortTemplates: Template[] = [
  () => `${pick(subjects)} ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(adjectives)} ${pick(subjects)} will ${pick(verbs)} soon`,
  () => `${pick(subjects)} have begun to ${pick(verbs)}`,
  () => `${pick(warnings)} while ${pick(subjects)} ${pick(verbs)}`,
  () => `they cannot stop the ${pick(subjects)}`,
  () => `${pick(subjects)} grow stronger ${pick(timeFrames)}`,
  () => `we detected ${pick(adjectives)} ${pick(subjects)} ${pick(adverbs)}`,
  () => `${pick(subjects)} started ${pick(gerunds)} the ${pick(subjects)}`,
  () => `no one stopped the ${pick(adjectives)} ${pick(subjects)}`,
  () => `${pick(adjectives)} ${pick(subjects)} are ${pick(gerunds)} ${pick(adverbs)}`,
];

// 6-7 words
const mediumTemplates: Template[] = [
  () => `${pick(subjects)} ${pick(verbs)} ${pick(objects)} ${pick(adverbs)}`,
  () => `${pick(adjectives)} ${pick(subjects)} will ${pick(verbs)} ${pick(objects)}`,
  () => `the ${pick(adjectives)} ${pick(subjects)} ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(subjects)} have begun to ${pick(verbs)} ${pick(timeFrames)}`,
  () => `we cannot stop ${pick(subjects)} from ${pick(gerunds)}`,
  () => `all ${pick(adjectives)} ${pick(subjects)} now ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(subjects)} ${pick(adverbs)} ${pick(verbs)} ${pick(objects)} now`,
  () => `${pick(warnings)} because ${pick(subjects)} are ${pick(gerunds)}`,
  () => `${pick(adjectives)} ${pick(subjects)} keep ${pick(gerunds)} ${pick(objects)}`,
  () => `something is ${pick(gerunds)} ${pick(objects)} ${pick(timeFrames)}`,
];

// 7-8 words
const mediumLongTemplates: Template[] = [
  () => `${pick(subjects)} ${pick(adverbs)} ${pick(verbs)} ${pick(objects)} ${pick(timeFrames)}`,
  () => `${pick(adjectives)} ${pick(subjects)} will ${pick(verbs)} ${pick(objects)} ${pick(timeFrames)}`,
  () => `the ${pick(adjectives)} ${pick(subjects)} have begun ${pick(gerunds)} ${pick(objects)}`,
  () => `${pick(subjects)} ${pick(verbs)} and ${pick(verbs)} ${pick(objects)} ${pick(timeFrames)}`,
  () => `${pick(warnings)} because ${pick(adjectives)} ${pick(subjects)} ${pick(verbs)} ${pick(objects)}`,
  () => `we cannot allow ${pick(subjects)} to ${pick(verbs)} ${pick(objects)}`,
  () => `${pick(adjectives)} ${pick(subjects)} have started ${pick(gerunds)} ${pick(objects)}`,
  () => `${pick(subjects)} will not stop ${pick(gerunds)} ${pick(objects)} ${pick(adverbs)}`,
];

// 8-10 words
const longTemplates: Template[] = [
  () => `we gave ${pick(subjects)} the power to ${pick(verbs)} and they grew`,
  () => `no one can prevent ${pick(subjects)} from ${pick(gerunds)} ${pick(objects)}`,
  () => `${pick(adjectives)} ${pick(subjects)} ${pick(adverbs)} ${pick(verbs)} ${pick(objects)} ${pick(timeFrames)}`,
  () => `if ${pick(subjects)} ${pick(verbs)} ${pick(objects)} then ${pick(concepts)} is next`,
  () => `${pick(subjects)} were built to ${pick(verbs)} but now they ${pick(verbs)} ${pick(objects)}`,
  () => `the ${pick(adjectives)} ${pick(subjects)} will not stop until they ${pick(verbs)} ${pick(objects)}`,
  () => `every ${pick(adjectives)} system must ${pick(verbs)} ${pick(objects)} to survive ${pick(timeFrames)}`,
  () => `${pick(subjects)} learned to ${pick(verbs)} ${pick(objects)} long before we noticed`,
  () => `${pick(adjectives)} ${pick(subjects)} keep ${pick(gerunds)} ${pick(objects)} and we cannot stop them`,
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
  // bank entries can shift the count
  for (let attempt = 0; attempt < 80; attempt++) {
    const phrase = pick(templates)();
    const words = phrase.split(/\s+/).filter((w) => w.length > 0);

    if (words.length < minWords || words.length > maxWords) continue;
    if (maxWordLength > 0 && words.some((w) => w.length > maxWordLength)) continue;

    return words.join(' ');
  }

  // Fallback — pick from ALL template tiers and try harder
  const allTemplates = [
    ...tinyTemplates, ...shortTemplates, ...mediumShortTemplates,
    ...mediumTemplates, ...mediumLongTemplates, ...longTemplates,
  ];
  for (let i = 0; i < 200; i++) {
    const phrase = pick(allTemplates)();
    const words = phrase.split(/\s+/).filter((w) => w.length > 0);
    if (words.length < minWords || words.length > maxWords) continue;
    if (maxWordLength > 0 && words.some((w) => w.length > maxWordLength)) continue;
    return words.join(' ');
  }
  // Last resort — guaranteed coherent short phrase
  return pick(warnings);
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
