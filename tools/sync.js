#!/usr/bin/env node
/**
 * tools/sync.js
 * Récupère le data.json du site Render, et si modifié, commit + push vers GitHub.
 * Usage: node tools/sync.js [--once]
 * Env (dans .env.sync ou variables d'env):
 *   SITE_URL=https://ton-site.onrender.com
 *   GIT_REMOTE=origin
 *   GIT_BRANCH=main
 *   INTERVAL_MS=120000
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// charge .env.sync à la main (pas de dep)
const envFile = path.join(process.cwd(), '.env.sync');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}

const SITE_URL = process.env.SITE_URL;
const REMOTE = process.env.GIT_REMOTE || 'origin';
const BRANCH = process.env.GIT_BRANCH || 'main';
const INTERVAL = parseInt(process.env.INTERVAL_MS || '120000', 10);
const ONCE = process.argv.includes('--once');
const LOCAL_FILE = path.join(process.cwd(), 'data', 'site.json');

if (!SITE_URL) {
  console.error('[sync] SITE_URL manquant. Crée .env.sync.');
  process.exit(1);
}

function log(...a) { console.log(`[${new Date().toISOString()}]`, ...a); }

async function fetchRemote() {
  const r = await fetch(`${SITE_URL}/api/data`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function readLocal() {
  try { return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8')); }
  catch { return null; }
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function gitCommitPush() {
  try {
    execSync('git add data/site.json', { stdio: 'inherit' });
    execSync('git commit -m "sync: mise à jour du contenu depuis admin"', { stdio: 'inherit' });
    execSync(`git push ${REMOTE} ${BRANCH}`, { stdio: 'inherit' });
    log('✓ push effectué');
  } catch (e) {
    log('! git:', e.message.split('\n')[0]);
  }
}

async function tick() {
  try {
    const remote = await fetchRemote();
    const local = readLocal();
    if (same(remote, local)) {
      log('rien à faire');
      return;
    }
    fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(remote, null, 2), 'utf8');
    log('✓ data.json mis à jour localement');
    gitCommitPush();
  } catch (e) {
    log('erreur:', e.message);
  }
}

(async () => {
  if (ONCE) { await tick(); return; }
  log(`watch start — interval ${INTERVAL}ms`);
  await tick();
  setInterval(tick, INTERVAL);
})();
