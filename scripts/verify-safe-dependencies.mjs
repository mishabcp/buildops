/**
 * Fails npm install if package-lock.json contains known-malicious dependency versions.
 * Extend BLOCKED_VERSIONS / BLOCKED_PACKAGES when new supply-chain incidents are confirmed.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** @type {Record<string, Set<string>>} empty set = any version blocked */
const BLOCKED_PACKAGES = {
  'plain-crypto-js': new Set(),
};

/** @type {Record<string, Set<string>>} */
const BLOCKED_VERSIONS = {
  axios: new Set(['1.14.1', '0.30.4']),
};

const RESOLVED_DENY = [/axios-1\.14\.1\.tgz/, /axios-0\.30\.4\.tgz/];

function packageNameFromKey(key) {
  if (!key.includes('node_modules')) return null;
  const segments = key.split('/node_modules/');
  return segments[segments.length - 1] || null;
}

function main() {
  const lockPath = resolve(process.cwd(), 'package-lock.json');
  if (!existsSync(lockPath)) {
    console.warn('verify-safe-dependencies: no package-lock.json in cwd; skip');
    process.exit(0);
  }

  let lock;
  try {
    lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  } catch {
    console.error('verify-safe-dependencies: could not parse package-lock.json');
    process.exit(1);
  }

  const packages = lock.packages;
  if (!packages || typeof packages !== 'object') {
    console.warn('verify-safe-dependencies: lockfile has no packages map; skip');
    process.exit(0);
  }

  const violations = [];

  for (const [key, meta] of Object.entries(packages)) {
    if (!meta || typeof meta.version !== 'string') continue;
    const name = packageNameFromKey(key);
    if (!name) continue;

    if (Object.prototype.hasOwnProperty.call(BLOCKED_PACKAGES, name)) {
      const allowed = BLOCKED_PACKAGES[name];
      if (allowed.size === 0 || allowed.has(meta.version)) {
        violations.push(`${name}@${meta.version} (${key})`);
      }
    }

    if (Object.prototype.hasOwnProperty.call(BLOCKED_VERSIONS, name)) {
      const bad = BLOCKED_VERSIONS[name];
      if (bad.has(meta.version)) {
        violations.push(`${name}@${meta.version} (${key})`);
      }
    }

    if (name === 'axios' && typeof meta.resolved === 'string') {
      for (const re of RESOLVED_DENY) {
        if (re.test(meta.resolved)) {
          violations.push(`axios resolved URL matches deny pattern (${key})`);
          break;
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error('verify-safe-dependencies: blocked packages detected in package-lock.json:');
    for (const v of violations) console.error(`  - ${v}`);
    console.error('Remove these versions or update scripts/verify-safe-dependencies.mjs after vendor confirmation.');
    process.exit(1);
  }
}

main();
