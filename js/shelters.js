(function () {
  'use strict';

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
    { name: 'Tamarind Hall Branch Library (Eric Holder Municipal Complex)', parish: 'St. Joseph', category: 1, ownership: 'Public', capacity: 54, water: true, access: true, notes: 'Only used in the event of a hurricane' },
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
    { name: 'The Salvation Army Lighthouse Centre', parish: 'St. Peter', category: 2, ownership: 'Privately Owned', capacity: 12, water: false, access: false, notes: 'Women & Children Only' },
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

  function renderShelter(s) {
    const tags = [
      `<span class="tag tag--cat${s.category}">Category ${s.category}</span>`,
      s.access ? '<span class="tag tag--access">Accessible bathroom</span>' : '',
      s.water ? '<span class="tag tag--water">Potable water</span>' : '',
      !s.water ? '<span class="tag tag--no-water">No potable water</span>' : ''
    ].filter(Boolean).join('');

    const notes = s.notes
      ? `<p class="shelter__notes">${escapeHtml(s.notes)}</p>`
      : '';

    const href = mapsUrl(s.name, s.parish);

    return `
      <article class="shelter" role="listitem">
        <h3 class="shelter__name">
          <a class="shelter__link" href="${href}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(s.name)}
            <span class="govbb-visually-hidden">(opens in a new tab on Google Maps)</span>
          </a>
        </h3>
        <p class="shelter__meta">${escapeHtml(s.parish)} &middot; ${s.ownership === 'Public' ? 'Public' : 'Privately owned'} &middot; Holds up to ${s.capacity} people</p>
        <div class="shelter__tags">${tags}</div>
        ${notes}
      </article>
    `;
  }

  function readFilters() {
    const parishEl = document.getElementById('filter-parish');
    const accessEl = document.getElementById('filter-access');
    return {
      parish: parishEl ? parishEl.value : '',
      category: (document.querySelector('input[name="category"]:checked') || {}).value || '',
      access: accessEl ? accessEl.checked : false
    };
  }

  function filterShelters(shelters, f) {
    return shelters.filter(function (s) {
      if (f.parish && s.parish !== f.parish) return false;
      if (f.category && String(s.category) !== f.category) return false;
      if (f.access && !s.access) return false;
      return true;
    });
  }

  function render() {
    const list = document.getElementById('shelter-list');
    const count = document.getElementById('result-count');
    if (!list || !count) return; // not on the find page — nothing to render

    const f = readFilters();
    const matched = filterShelters(SHELTERS, f);
    matched.sort(function (a, b) {
      if (a.parish !== b.parish) return a.parish.localeCompare(b.parish);
      return a.name.localeCompare(b.name);
    });

    if (matched.length === 0) {
      list.innerHTML = `
        <div class="shelter__empty">
          <p><strong>No shelters match your filters.</strong></p>
          <p>Try removing a filter, or call the Department of Emergency Management on <a href="tel:+12464387575" class="govbb-link">438-7575</a> for help.</p>
        </div>`;
      count.textContent = 'No shelters match your filters';
    } else {
      list.innerHTML = matched.map(renderShelter).join('');
      const total = SHELTERS.length;
      count.textContent = matched.length === total
        ? `Showing all ${total} shelters`
        : `Showing ${matched.length} of ${total} shelters`;
    }
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
    const ids = ['filter-parish', 'filter-access'];
    ids.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', render);
    });
    document.querySelectorAll('input[name="category"]').forEach(function (el) {
      el.addEventListener('change', render);
    });
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        document.getElementById('filter-parish').value = '';
        document.getElementById('cat-any').checked = true;
        document.getElementById('filter-access').checked = false;
        render();
      });
    }
    window.addEventListener('hashchange', openAccordionFromHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bind();
      render();
      openAccordionFromHash();
    });
  } else {
    bind();
    render();
    openAccordionFromHash();
  }
})();
