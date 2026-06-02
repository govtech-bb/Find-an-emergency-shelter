#!/usr/bin/env node
/**
 * Geocode the SHELTERS array via OpenStreetMap Nominatim.
 *
 * The 2026 booklet doesn't publish street addresses, so users currently have
 * to click out to Google Maps just to find out *where* a shelter is. This
 * script enriches each shelter with {lat, lon, address} so the find page
 * can show an address inline.
 *
 * Politeness:
 *   - 1 request per second (Nominatim ToS)
 *   - Identifying User-Agent header
 *   - Result cache so re-runs don't re-query
 *
 * Usage:
 *   node scripts/geocode-shelters.js
 *
 * Output:
 *   data/shelter-locations.json    (committed; loaded by js/shelters.js)
 *
 * Re-run when shelters change. Existing entries are reused from the cache.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SHELTERS_SRC = path.join(__dirname, '..', 'js', 'shelters.js');
const OUT_FILE = path.join(__dirname, '..', 'data', 'shelter-locations.json');

function extractShelters() {
  const src = fs.readFileSync(SHELTERS_SRC, 'utf8');
  const startMarker = 'const SHELTERS = [';
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) throw new Error('SHELTERS not found in shelters.js');
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx + startMarker.length - 1; i < src.length; i++) {
    if (src[i] === '[') depth++;
    if (src[i] === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  const literal = src.slice(startIdx + 'const SHELTERS = '.length, endIdx);
  // eslint-disable-next-line no-new-func
  return new Function('return ' + literal)();
}

function nominatim(query) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bb&q=' +
    encodeURIComponent(query);
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'find-an-emergency-shelter/1.0 (govtech-bb; alpha)',
          'Accept-Language': 'en'
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          }
          try {
            const json = JSON.parse(data);
            resolve(json[0] || null);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
  });
}

function loadCache() {
  if (!fs.existsSync(OUT_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveCache(cache) {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(cache, null, 2) + '\n');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shortenAddress(displayName) {
  // Nominatim's display_name is verbose, e.g.:
  // "Combermere School, Pickwick Gap, Wildey, St. Michael, Barbados"
  // We want just the locality up to the parish.
  if (!displayName) return null;
  const parts = displayName.split(',').map((s) => s.trim());
  // Drop the shelter name itself (first part) and the country (last).
  // Keep up to 3 of the middle parts (locality, district, parish).
  const middle = parts.slice(1, -1);
  // Trim to first 3 useful pieces and dedupe.
  const seen = new Set();
  const kept = [];
  for (const p of middle) {
    if (p && !seen.has(p)) {
      seen.add(p);
      kept.push(p);
      if (kept.length === 3) break;
    }
  }
  return kept.join(', ') || null;
}

async function main() {
  const shelters = extractShelters();
  const cache = loadCache();

  let hits = 0;
  let misses = 0;
  let queried = 0;

  for (const s of shelters) {
    const key = s.name;
    if (cache[key] && cache[key].lat) {
      hits++;
      continue;
    }
    const query = `${s.name}, ${s.parish}, Barbados`;
    process.stdout.write(`Geocoding [${queried + hits + misses + 1}/${shelters.length}]: ${query} … `);
    try {
      const r = await nominatim(query);
      if (r) {
        cache[key] = {
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          address: shortenAddress(r.display_name),
          display_name: r.display_name,
          osm_id: r.osm_id,
          osm_type: r.osm_type,
          confidence: r.importance
        };
        console.log('OK');
        hits++;
      } else {
        cache[key] = { lat: null, lon: null, address: null };
        console.log('NO RESULT');
        misses++;
      }
      saveCache(cache); // checkpoint after each request
    } catch (e) {
      console.log('ERROR: ' + e.message);
      cache[key] = cache[key] || { lat: null, lon: null, address: null };
      misses++;
    }
    queried++;
    await sleep(1100); // Nominatim politeness: <1 rps
  }

  console.log(`\nDone. ${hits} cached/found, ${misses} missing. Cache: ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
