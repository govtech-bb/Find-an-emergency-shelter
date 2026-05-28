# Find an emergency shelter

A government service for Barbados that lets people find a public or private emergency shelter to use during a hurricane or other emergency.

**Live:** https://govtech-bb.github.io/Find-an-emergency-shelter/

## What this is

A static website built to the [alpha.gov.bb design system](https://github.com/govtech-bb/design-system) and the [Barbados Digital Service Standards](https://github.com/govtech-bb/Barbados-Digital-Service-Standards). Pure HTML, CSS and JavaScript — no build step required to run.

## Service journey

| Page | Purpose |
|---|---|
| `index.html` | Start page. What the service does, when shelters open, emergency phone numbers, "Find a shelter" CTA. |
| `guidance.html` | What to bring, shelter rules, accessibility, what to expect, District Emergency Organisations, hurricane terms, all phone numbers. |
| `find.html` | Searchable, filterable list of all 70 shelters. Renders statically; JavaScript enhances with search, filter, sort, deep-link state. |

## Resilience

This service is designed to work when it matters most — during a hurricane, when internet and power may be down.

- **Offline first.** `sw.js` registers as a service worker on each page and caches the start, guidance and find pages, the design system CSS, the shelter data and the fonts on first visit. Open the service once during pre-season and it remains available offline.
- **No JavaScript needed.** `find.html` ships all 70 shelters as static HTML in the response body. JavaScript progressively enhances with search, filter and sort. Users with JS disabled or broken still see the full list and can use the browser's find-in-page.
- **Print-friendly.** `find.html` has a `@media print` stylesheet that drops the chrome and lays out the list on 2–3 pages of paper. Print a copy before the storm.
- **Lightweight.** The crest icon is a 210-byte SVG. The total critical path is small.

## Data source

Shelter information is taken from the **2026 Emergency Shelter Booklet**, published by the Department of Emergency Management in partnership with the Ministry of Education, Transformation.

The booklet is reviewed and republished annually before the start of hurricane season on 1 June.

**Next review:** May 1, 2027.

## Reporting issues with shelter data

If a shelter is wrong, closed, has moved, or is missing from the list, email <feedback@alpha.gov.bb> with the shelter name in the subject line.

## Updating shelter data

Shelter records live in `js/shelters.js` as the `SHELTERS` array.

When DEM publishes a new booklet:

1. Edit `js/shelters.js` and replace the `SHELTERS` array with the new data.
2. Regenerate the no-JS fallback HTML inside `find.html`:
   ```sh
   node scripts/build-fallback.js > /tmp/cards.html
   ```
   Paste the output between the `<!-- BEGIN no-JS shelter list -->` and `<!-- END no-JS shelter list -->` markers in `find.html`.
3. Bump `CACHE_VERSION` in `sw.js` so returning users get the new data on next visit.
4. Update the visible date and `<meta>` strings on `index.html`, `find.html` and `guidance.html`.
5. Update this README's review dates.

## Local development

The site is plain HTML, CSS and JavaScript. To preview locally:

```sh
npx http-server . -p 5173 -c-1
```

Open <http://localhost:5173>.

The CLAUDE Code launch config in `.claude/launch.json` runs this command automatically.

## File map

```
.
├── index.html                     # Start page
├── find.html                      # Find page (search and filter)
├── guidance.html                  # Guidance page (rules, what to bring, terms)
├── sw.js                          # Service worker for offline use
├── sitemap.xml                    # SEO sitemap
├── robots.txt                     # SEO crawler hints
├── css/
│   └── service.css                # Service-specific styles (cards, finder, etc.)
├── js/
│   └── shelters.js                # Shelter data + finder logic
├── dist/                          # Barbados design system (vendored)
│   ├── styles.css
│   └── assets/
│       ├── fonts/                 # Figtree subsets
│       └── images/                # Logo and small crest
├── scripts/
│   └── build-fallback.js          # Regenerate static shelter list HTML
├── audit/
│   └── EntryPageAudit.jsx         # Interactive React audit checklist
└── emergency_shelters_2026.csv    # Source data
```

## Maintainers

Maintained by GovTech Barbados in partnership with the Department of Emergency Management.

For service questions, contact the Department of Emergency Management on <tel:+12464387575> (438-7575).

## Licence

Open source. Licence to be confirmed by GovTech Barbados.
