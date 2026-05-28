(function () {
  'use strict';

  // Approximate centre coordinates of each Barbados parish, used to estimate
  // distance from the user to each shelter. Barbados is small (~21 × 14 km)
  // so parish-centre accuracy is fine for "near me" ordering. Replace with
  // per-shelter coordinates if DEM publishes them in a future booklet.
  // Coordinates sourced from OpenStreetMap parish boundary centroids.
  const PARISH_CENTROIDS = {
    'Christ Church': { lat: 13.0689, lon: -59.5469 },
    'St. Andrew':    { lat: 13.2167, lon: -59.5667 },
    'St. George':    { lat: 13.1564, lon: -59.5294 },
    'St. James':     { lat: 13.1833, lon: -59.6333 },
    'St. John':      { lat: 13.1833, lon: -59.4833 },
    'St. Joseph':    { lat: 13.2167, lon: -59.5500 },
    'St. Lucy':      { lat: 13.3000, lon: -59.6167 },
    'St. Michael':   { lat: 13.1000, lon: -59.6167 },
    'St. Peter':     { lat: 13.2667, lon: -59.6333 },
    'St. Philip':    { lat: 13.1500, lon: -59.4500 },
    'St. Thomas':    { lat: 13.1833, lon: -59.5833 }
  };

  // Set when the user grants location access; null otherwise.
  let USER_LOCATION = null;

  // Shelter data extracted from the 2026 Emergency Shelter Booklet.
  const SHELTERS = [
    { name: 'Blackman and Gollop Primary School', parish: 'Christ Church', category: 1, ownership: 'Public', capacity: 80, water: true, access: true, notes: '' },
    { name: 'Gordon Walters Primary School', parish: 'Christ Church', category: 1, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'St. Christopher Primary School', parish: 'Christ Church', category: 1, ownership: 'Public', capacity: 75, water: true, access: false, notes: '' },
    { name: 'Cuthbert Moore Primary School', parish: 'St. George', category: 1, ownership: 'Public', capacity: 36, water: true, access: false, notes: '' },
    { name: 'Gordon Greenidge Primary School', parish: 'St. James', category: 1, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'Queens College', parish: 'St. James', category: 1, ownership: 'Public', capacity: 100, water: true, access: false, notes: '' },
    { name: 'St. Silas Primary School', parish: 'St. James', category: 1, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'The Lodge School', parish: 'St. John', category: 1, ownership: 'Public', capacity: 195, water: true, access: true, notes: '' },
    { name: 'Mount Tabor Primary School', parish: 'St. John', category: 1, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'Tamarind Hall Branch Library (Eric Holder Municipal Complex)', parish: 'St. Joseph', category: 1, ownership: 'Public', capacity: 54, water: true, access: true, notes: '' },
    { name: 'Ignatius Byer Primary School', parish: 'St. Lucy', category: 1, ownership: 'Public', capacity: 35, water: true, access: false, notes: '' },
    { name: 'Combermere School', parish: 'St. Michael', category: 1, ownership: 'Public', capacity: 100, water: true, access: true, notes: '' },
    { name: 'George Lamming Primary School', parish: 'St. Michael', category: 1, ownership: 'Public', capacity: 79, water: true, access: true, notes: '' },
    { name: 'Harrison College', parish: 'St. Michael', category: 1, ownership: 'Public', capacity: 81, water: true, access: false, notes: '' },
    { name: 'Lloyd Erskine Sandiford Centre', parish: 'St. Michael', category: 1, ownership: 'Public', capacity: 365, water: true, access: true, notes: '' },
    { name: 'The University of the West Indies (Sagicor Building)', parish: 'St. Michael', category: 1, ownership: 'Public', capacity: 100, water: true, access: true, notes: '' },
    { name: 'Westbury Primary School', parish: 'St. Michael', category: 1, ownership: 'Public', capacity: 61, water: true, access: true, notes: '' },
    { name: 'Coleridge and Parry School', parish: 'St. Peter', category: 1, ownership: 'Public', capacity: 140, water: true, access: true, notes: '' },
    { name: 'Lester Vaughan School', parish: 'St. Thomas', category: 1, ownership: 'Public', capacity: 115, water: true, access: true, notes: '' },
    { name: 'Hillaby Seventh Day Adventist Church', parish: 'St. Andrew', category: 1, ownership: 'Privately Owned', capacity: 32, water: true, access: false, notes: '' },
    { name: 'Ellerton Wesleyan Holiness Church', parish: 'St. George', category: 1, ownership: 'Privately Owned', capacity: 24, water: true, access: false, notes: '' },
    { name: 'Church of God Orange Hill', parish: 'St. James', category: 1, ownership: 'Privately Owned', capacity: 106, water: true, access: false, notes: '' },
    { name: 'Connell Town Pentecostal House of Prayer', parish: 'St. Lucy', category: 1, ownership: 'Privately Owned', capacity: 21, water: true, access: false, notes: '' },
    { name: 'William Donald George Parish Centre (St. Lucy Parish Church)', parish: 'St. Lucy', category: 1, ownership: 'Privately Owned', capacity: 20, water: true, access: true, notes: '' },
    { name: 'Black Rock Seventh Day Adventist Church', parish: 'St. Michael', category: 1, ownership: 'Privately Owned', capacity: 32, water: true, access: false, notes: '' },
    { name: 'Faith Wesleyan Holiness Church', parish: 'St. Michael', category: 1, ownership: 'Privately Owned', capacity: 30, water: true, access: false, notes: '' },
    { name: 'St. Barnabas Senior Citizens Centre', parish: 'St. Michael', category: 1, ownership: 'Privately Owned', capacity: 46, water: true, access: false, notes: '' },
    { name: 'Ruby Church of the Nazarene', parish: 'St. Philip', category: 1, ownership: 'Privately Owned', capacity: 45, water: true, access: false, notes: '' },
    { name: 'Six Roads Church of Christ', parish: 'St. Philip', category: 1, ownership: 'Privately Owned', capacity: 40, water: true, access: false, notes: '' },
    { name: 'Christ Church Foundation School', parish: 'Christ Church', category: 2, ownership: 'Public', capacity: 75, water: true, access: false, notes: '' },
    { name: 'Deighton Griffith School', parish: 'Christ Church', category: 2, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'St. Bartholomew Primary School', parish: 'Christ Church', category: 2, ownership: 'Public', capacity: 35, water: true, access: false, notes: '' },
    { name: 'Ellerton Primary School', parish: 'St. George', category: 2, ownership: 'Public', capacity: 25, water: true, access: false, notes: '' },
    { name: 'St. George Secondary', parish: 'St. George', category: 2, ownership: 'Public', capacity: 80, water: true, access: false, notes: '' },
    { name: 'West Terrace Primary School', parish: 'St. James', category: 2, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: "St. Margaret's Primary School", parish: 'St. John', category: 2, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'Grantley Adams Memorial', parish: 'St. Joseph', category: 2, ownership: 'Public', capacity: 120, water: true, access: false, notes: '' },
    { name: 'St. Bernard Primary School', parish: 'St. Joseph', category: 2, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'St. Joseph Primary School', parish: 'St. Joseph', category: 2, ownership: 'Public', capacity: 35, water: true, access: false, notes: '' },
    { name: 'Daryll Jordan Secondary', parish: 'St. Lucy', category: 2, ownership: 'Public', capacity: 150, water: true, access: true, notes: '' },
    { name: 'Selah Primary School', parish: 'St. Lucy', category: 2, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'Barbados Community College (Commerce Division)', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 244, water: false, access: true, notes: '' },
    { name: 'Bay Primary School', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 50, water: true, access: false, notes: '' },
    { name: 'The Ellerslie School', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 55, water: true, access: false, notes: '' },
    { name: 'Grazettes Primary School', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 50, water: true, access: false, notes: '' },
    { name: 'Lawrence T. Gay Memorial', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'Luther Thorne Memorial', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 100, water: true, access: false, notes: '' },
    { name: 'Parkinson Memorial School', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 215, water: true, access: false, notes: '' },
    { name: 'Springer Memorial School', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 66, water: true, access: false, notes: '' },
    { name: 'St. Ambrose Primary School', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: "St. Leonard's Boys' School", parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 55, water: true, access: false, notes: '' },
    { name: 'The St. Michael School', parish: 'St. Michael', category: 2, ownership: 'Public', capacity: 37, water: true, access: false, notes: '' },
    { name: 'Princess Margaret Secondary', parish: 'St. Philip', category: 2, ownership: 'Public', capacity: 60, water: true, access: false, notes: '' },
    { name: 'Reynold Weekes Primary School', parish: 'St. Philip', category: 2, ownership: 'Public', capacity: 45, water: true, access: false, notes: '' },
    { name: 'Sharon Primary School', parish: 'St. Thomas', category: 2, ownership: 'Public', capacity: 40, water: true, access: false, notes: '' },
    { name: 'Welches Primary School', parish: 'St. Thomas', category: 2, ownership: 'Public', capacity: 22, water: true, access: false, notes: '' },
    { name: 'Hawthorn Methodist Church', parish: 'Christ Church', category: 2, ownership: 'Privately Owned', capacity: 27, water: true, access: false, notes: '' },
    { name: 'Ivan Harewood Centre (Christ Church Parish Church)', parish: 'Christ Church', category: 2, ownership: 'Privately Owned', capacity: 75, water: true, access: false, notes: '' },
    { name: 'Salvation Army Church (Wotton)', parish: 'Christ Church', category: 2, ownership: 'Privately Owned', capacity: 14, water: true, access: false, notes: '' },
    { name: 'St. Christopher Anglican Church', parish: 'Christ Church', category: 2, ownership: 'Privately Owned', capacity: 35, water: true, access: false, notes: '' },
    { name: 'St. Matthias Anglican Church', parish: 'Christ Church', category: 2, ownership: 'Privately Owned', capacity: 23, water: false, access: true, notes: '' },
    { name: 'St. George Anglican Church', parish: 'St. George', category: 2, ownership: 'Privately Owned', capacity: 22, water: false, access: false, notes: '' },
    { name: 'Salvation Army Checker Hall Church', parish: 'St. Lucy', category: 2, ownership: 'Privately Owned', capacity: 14, water: true, access: false, notes: '' },
    { name: "St. Clement's Centre (St. Clement's Anglican Church)", parish: 'St. Lucy', category: 2, ownership: 'Privately Owned', capacity: 30, water: true, access: false, notes: '' },
    { name: 'Dalkeith Methodist Church', parish: 'St. Michael', category: 2, ownership: 'Privately Owned', capacity: 34, water: true, access: false, notes: '' },
    { name: "People's Cathedral Primary", parish: 'St. Michael', category: 2, ownership: 'Privately Owned', capacity: 60, water: true, access: false, notes: '' },
    { name: 'The Salvation Army Lighthouse Centre', parish: 'St. Peter', category: 2, ownership: 'Privately Owned', capacity: 12, water: false, access: false, notes: '', restriction: 'Women and children only' },
    { name: 'St. Philip-the-Less Anglican Church', parish: 'St. Peter', category: 2, ownership: 'Privately Owned', capacity: 45, water: false, access: false, notes: '' },
    { name: 'Gemswick Nazarene Church', parish: 'St. Philip', category: 2, ownership: 'Privately Owned', capacity: 45, water: false, access: false, notes: '' },
    { name: "St. Catherine's Anglican Church", parish: 'St. Philip', category: 2, ownership: 'Privately Owned', capacity: 45, water: true, access: false, notes: '' }
  ];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function mapsUrl(name, parish) {
    const q = encodeURIComponent(name + ', ' + parish + ', Barbados');
    return 'https://www.google.com/maps/search/?api=1&query=' + q;
  }

  // Great-circle distance between two {lat, lon} points in kilometres.
  function haversineKm(a, b) {
    const R = 6371; // Earth radius in km
    const toRad = function (d) { return d * Math.PI / 180; };
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  // Largest possible distance between any two points in Barbados is ~30 km.
  // If the user is further than this from every parish centroid, they are
  // not on the island and parish-centre distances are meaningless.
  const MAX_PLAUSIBLE_DISTANCE_KM = 50;

  function shelterDistance(s) {
    if (!USER_LOCATION) return null;
    const c = PARISH_CENTROIDS[s.parish];
    if (!c) return null;
    return haversineKm(USER_LOCATION, c);
  }

  function userIsOnIsland() {
    if (!USER_LOCATION) return false;
    let min = Infinity;
    for (const parish in PARISH_CENTROIDS) {
      const d = haversineKm(USER_LOCATION, PARISH_CENTROIDS[parish]);
      if (d < min) min = d;
    }
    return min <= MAX_PLAUSIBLE_DISTANCE_KM;
  }

  function formatDistance(km) {
    if (km == null) return '';
    if (km < 0.5) return 'In your parish';
    return km.toFixed(1) + ' km from your parish';
  }

  function setLocationStatus(message) {
    const el = document.getElementById('location-status');
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.hidden = false;
    } else {
      el.textContent = '';
      el.hidden = true;
    }
  }

  function resetSortToParish() {
    const sortEl = document.getElementById('filter-sort');
    if (sortEl && sortEl.value === 'distance') sortEl.value = 'parish';
  }

  function clearLocation() {
    USER_LOCATION = null;
    resetSortToParish();
    setLocationStatus(null);
    render();
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('Your device does not support location. ' +
        'You can still filter by parish.');
      resetSortToParish();
      render();
      return;
    }
    setLocationStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        USER_LOCATION = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        if (!userIsOnIsland()) {
          USER_LOCATION = null;
          setLocationStatus('You appear to be outside Barbados, so distance ' +
            'isn\'t meaningful. Filter by parish instead.');
          resetSortToParish();
          render();
          return;
        }
        setLocationStatus(
          'Sorted by distance from your parish. ' +
          'Two shelters in the same parish show the same distance.'
        );
        const sortEl = document.getElementById('filter-sort');
        if (sortEl) sortEl.value = 'distance';
        render();
      },
      function (err) {
        let msg = 'Could not get your location. Filter by parish instead.';
        if (err && err.code === 1) {
          msg = 'You blocked location access. Allow location in your browser, ' +
            'or filter by parish instead.';
        } else if (err && err.code === 2) {
          msg = 'Your location is unavailable. Filter by parish instead.';
        } else if (err && err.code === 3) {
          msg = 'The location request timed out. Filter by parish instead.';
        }
        setLocationStatus(msg);
        resetSortToParish();
        render();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  function renderShelter(s) {
    // Amenity tags. Only show "no potable water" as a warning when the
    // shelter actually lacks water — different visual treatment from positive
    // tags so a glance doesn't confuse a warning with a feature.
    const tags = [
      `<span class="tag tag--cat${s.category}">Category ${s.category}</span>`,
      s.access ? '<span class="tag tag--access">Accessible bathroom</span>' : '',
      s.water ? '<span class="tag tag--water">Potable water</span>' : ''
    ].filter(Boolean).join('');

    const warningTags = !s.water
      ? '<span class="tag tag--warning">⚠ No potable water</span>'
      : '';

    // Eligibility restriction (e.g., women & children only) — critical info,
    // styled as a red pill so it can't be missed.
    const restriction = s.restriction
      ? `<p class="shelter__restriction"><strong>Restricted:</strong> ${escapeHtml(s.restriction)}</p>`
      : '';

    const distance = shelterDistance(s);
    const distanceHtml = distance !== null
      ? `<p class="shelter__distance" aria-label="Distance from your location"><svg class="shelter__distance-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>${escapeHtml(formatDistance(distance))}</p>`
      : '';

    const notes = s.notes
      ? `<p class="shelter__notes">${escapeHtml(s.notes)}</p>`
      : '';

    const href = mapsUrl(s.name, s.parish);

    // Activation status. We have no live activation feed, so every shelter
    // shows "Not currently open" by default. Real services would flip this
    // to "Open now" via a DEM data feed during an active emergency.
    const statusHtml =
      '<p class="shelter__status shelter__status--closed">' +
        '<span class="shelter__status-dot" aria-hidden="true"></span>' +
        'Not currently open' +
      '</p>';

    return `
      <article class="shelter${s.restriction ? ' shelter--restricted' : ''}" role="listitem">
        ${statusHtml}
        ${restriction}
        <h3 class="shelter__name">
          <a class="shelter__link" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.name)}</a>
        </h3>
        <p class="shelter__meta">${escapeHtml(s.parish)}, ${s.ownership === 'Public' ? 'public' : 'privately owned'}, capacity about ${s.capacity}</p>
        ${distanceHtml}
        <div class="shelter__tags">${tags}${warningTags}</div>
        ${notes}
      </article>
    `;
  }

  function readFilters() {
    const parishEl = document.getElementById('filter-parish');
    const accessEl = document.getElementById('filter-access');
    const searchEl = document.getElementById('filter-search');
    const sortEl = document.getElementById('filter-sort');
    return {
      parish: parishEl ? parishEl.value : '',
      category: (document.querySelector('input[name="category"]:checked') || {}).value || '',
      access: accessEl ? accessEl.checked : false,
      search: searchEl ? searchEl.value.trim() : '',
      sort: sortEl ? sortEl.value : 'parish'
    };
  }

  function filterShelters(shelters, f) {
    const q = f.search.toLowerCase();
    return shelters.filter(function (s) {
      if (f.parish && s.parish !== f.parish) return false;
      if (f.category && String(s.category) !== f.category) return false;
      if (f.access && !s.access) return false;
      if (q && !(s.name.toLowerCase().includes(q) || s.parish.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  function sortShelters(list, sort) {
    const copy = list.slice();
    if (sort === 'name') {
      copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else if (sort === 'capacity') {
      copy.sort(function (a, b) { return b.capacity - a.capacity; });
    } else if (sort === 'distance' && USER_LOCATION) {
      copy.sort(function (a, b) {
        const da = shelterDistance(a);
        const db = shelterDistance(b);
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db;
      });
    } else {
      copy.sort(function (a, b) {
        if (a.parish !== b.parish) return a.parish.localeCompare(b.parish);
        return a.name.localeCompare(b.name);
      });
    }
    return copy;
  }

  function activeFilterChips(f) {
    const out = [];
    if (f.search) out.push({ key: 'search', label: 'Search: "' + f.search + '"' });
    if (f.parish) out.push({ key: 'parish', label: f.parish });
    if (f.category) out.push({ key: 'category', label: 'Category ' + f.category });
    if (f.access) out.push({ key: 'access', label: 'Accessible bathroom' });
    return out;
  }

  function clearFilter(key) {
    if (key === 'search') { const el = document.getElementById('filter-search'); if (el) el.value = ''; }
    if (key === 'parish') { const el = document.getElementById('filter-parish'); if (el) el.value = ''; }
    if (key === 'category') { const el = document.getElementById('cat-any'); if (el) el.checked = true; }
    if (key === 'access') { const el = document.getElementById('filter-access'); if (el) el.checked = false; }
  }

  function clearAllFilters() {
    clearFilter('search');
    clearFilter('parish');
    clearFilter('category');
    clearFilter('access');
  }

  function renderActiveFilters(f) {
    const wrap = document.getElementById('active-filters');
    if (!wrap) return;
    const chips = activeFilterChips(f);
    if (chips.length === 0) {
      wrap.hidden = true;
      wrap.innerHTML = '';
      return;
    }
    wrap.hidden = false;
    const chipHtml = chips.map(function (x) {
      return '<button type="button" class="active-filter__chip" data-key="' + escapeHtml(x.key) + '">' +
        escapeHtml(x.label) +
        ' <span aria-hidden="true">×</span>' +
        '<span class="govbb-visually-hidden"> — remove</span></button>';
    }).join('');
    wrap.innerHTML =
      '<span class="active-filters__label">Filters:</span>' + chipHtml +
      '<button type="button" class="active-filters__clear" id="active-filters-clear">Clear all</button>';
  }

  function render() {
    const list = document.getElementById('shelter-list');
    const count = document.getElementById('result-count');
    if (!list || !count) return; // not on the find page — nothing to render

    const f = readFilters();
    const matched = sortShelters(filterShelters(SHELTERS, f), f.sort);

    renderActiveFilters(f);
    updateUrl(f);

    if (matched.length === 0) {
      list.innerHTML =
        '<div class="shelter__empty">' +
          '<p>Try clearing a filter above, or call the Department of Emergency Management on <a href="tel:+12464387575" class="govbb-link">438-7575</a> for help.</p>' +
        '</div>';
      count.textContent = 'No shelters match your filters';
    } else {
      list.innerHTML = matched.map(renderShelter).join('');
      const total = SHELTERS.length;
      count.textContent = matched.length === total
        ? 'Showing all ' + total + ' shelters'
        : 'Showing ' + matched.length + ' of ' + total + ' shelters';
    }
  }

  function updateUrl(f) {
    try {
      const params = new URLSearchParams();
      if (f.search) params.set('q', f.search);
      if (f.parish) params.set('parish', f.parish);
      if (f.category) params.set('cat', f.category);
      if (f.access) params.set('access', '1');
      if (f.sort && f.sort !== 'parish') params.set('sort', f.sort);
      const qs = params.toString();
      const url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      window.history.replaceState(null, '', url);
    } catch (e) { /* history API may be unavailable */ }
  }

  function applyUrlState() {
    try {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('q');
      const parish = params.get('parish');
      const cat = params.get('cat');
      const access = params.get('access');
      const sort = params.get('sort');

      const searchEl = document.getElementById('filter-search');
      if (search && searchEl) searchEl.value = search;
      const parishEl = document.getElementById('filter-parish');
      if (parish && parishEl) parishEl.value = parish;
      if (cat === '1') { const el = document.getElementById('cat-1'); if (el) el.checked = true; }
      else if (cat === '2') { const el = document.getElementById('cat-2'); if (el) el.checked = true; }
      if (access === '1') { const el = document.getElementById('filter-access'); if (el) el.checked = true; }
      const sortEl = document.getElementById('filter-sort');
      if (sort && sortEl) sortEl.value = sort;
    } catch (e) { /* URLSearchParams unavailable on ancient browsers */ }
  }

  function openAccordionFromHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target || target.tagName !== 'DETAILS') return;
    // Walk up the tree and open every ancestor <details> too, so a deep
    // link to a sub-accordion also opens the wrapping 'Need to know' panel.
    let el = target;
    while (el) {
      if (el.tagName === 'DETAILS') el.open = true;
      el = el.parentElement;
    }
    requestAnimationFrame(function () {
      target.scrollIntoView({ block: 'start' });
    });
  }

  function bind() {
    ['filter-parish', 'filter-access'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', render);
    });

    const sortEl = document.getElementById('filter-sort');
    if (sortEl) {
      sortEl.addEventListener('change', function () {
        if (sortEl.value === 'distance' && !USER_LOCATION) {
          requestLocation();
        } else {
          render();
        }
      });
    }

    const locBtn = document.getElementById('use-my-location');
    if (locBtn) {
      locBtn.addEventListener('click', requestLocation);
    }

    const searchEl = document.getElementById('filter-search');
    if (searchEl) {
      let timer;
      searchEl.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(render, 150);
      });
    }

    document.querySelectorAll('input[name="category"]').forEach(function (el) {
      el.addEventListener('change', render);
    });

    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', function (e) {
        e.preventDefault();
        clearAllFilters();
        render();
      });
    }

    // Delegated handler for the active-filter chips and the clear-all link
    document.addEventListener('click', function (e) {
      const chip = e.target.closest && e.target.closest('.active-filter__chip');
      if (chip) {
        clearFilter(chip.getAttribute('data-key'));
        render();
        return;
      }
      if (e.target && e.target.id === 'active-filters-clear') {
        clearAllFilters();
        render();
      }
    });

    window.addEventListener('hashchange', openAccordionFromHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyUrlState();
      bind();
      render();
      openAccordionFromHash();
    });
  } else {
    applyUrlState();
    bind();
    render();
    openAccordionFromHash();
  }
})();
