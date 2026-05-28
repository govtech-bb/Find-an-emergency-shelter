#!/usr/bin/env node
/**
 * Build the no-JS fallback HTML for the shelter list in find.html.
 *
 * The fallback HTML is what users see when JavaScript fails to load
 * (low-end devices, ad-blockers breaking things, connection drops mid-load).
 * Once JS runs, js/shelters.js replaces this static markup with the filterable
 * list — so the fallback only ever shows on the first paint.
 *
 * Usage:
 *   node scripts/build-fallback.js
 *
 * Output:
 *   Writes plain HTML to stdout. Paste the contents into find.html where you
 *   see the comment <!-- BEGIN no-JS shelter list (generated) -->.
 *
 * Run this after every change to the SHELTERS array in js/shelters.js.
 */

const fs = require('fs');
const path = require('path');

// Pull SHELTERS out of js/shelters.js by evaluating only that file section.
// Cheap but works: we extract the array literal text and JSON.parse-style it.
const src = fs.readFileSync(
  path.join(__dirname, '..', 'js', 'shelters.js'),
  'utf8'
);

const startMarker = 'const SHELTERS = [';
const startIdx = src.indexOf(startMarker);
if (startIdx === -1) throw new Error('SHELTERS not found in shelters.js');
// Find the matching closing bracket. Naive but works because the array
// contains only object literals with primitive values.
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
if (endIdx === -1) throw new Error('Could not match closing ] of SHELTERS');

// Wrap and eval in a sandboxed function. The literal contains only JS-safe
// strings (single quoted, double quoted, escaped) and number/boolean values.
const arrayLiteral = src.slice(startIdx + 'const SHELTERS = '.length, endIdx);
// eslint-disable-next-line no-new-func
const SHELTERS = new Function('return ' + arrayLiteral)();

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function mapsUrl(name, parish) {
  const q = encodeURIComponent(`${name}, ${parish}, Barbados`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function renderCard(s) {
  const tags = [
    `<span class="tag tag--cat${s.category}">Category ${s.category}</span>`,
    s.access ? '<span class="tag tag--access">Accessible bathroom</span>' : '',
    s.water ? '<span class="tag tag--water">Potable water</span>' : '',
    !s.water ? '<span class="tag tag--no-water">No potable water</span>' : '',
  ]
    .filter(Boolean)
    .join('');

  const notes = s.notes
    ? `\n                <p class="shelter__notes">${escapeHtml(s.notes)}</p>`
    : '';

  return `              <article class="shelter" role="listitem">
                <h3 class="shelter__name">
                  <a class="shelter__link" href="${mapsUrl(s.name, s.parish)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.name)}<span class="govbb-visually-hidden"> (opens in a new tab on Google Maps)</span></a>
                </h3>
                <p class="shelter__meta">${escapeHtml(s.parish)} &middot; ${
    s.ownership === 'Public' ? 'Public' : 'Privately owned'
  } &middot; Holds up to ${s.capacity} people</p>
                <div class="shelter__tags">${tags}</div>${notes}
              </article>`;
}

const sorted = [...SHELTERS].sort((a, b) => {
  if (a.parish !== b.parish) return a.parish.localeCompare(b.parish);
  return a.name.localeCompare(b.name);
});

process.stdout.write(sorted.map(renderCard).join('\n') + '\n');
