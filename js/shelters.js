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

  // Per-shelter coordinates and addresses, geocoded from OpenStreetMap via
  // Nominatim (see scripts/geocode-shelters.js). 49 of 70 shelters have a
  // confident match; the rest fall back to the parish centroid for distance
  // and show no address on the card. © OpenStreetMap contributors.
  const SHELTER_LOCATIONS = {
    "Blackman and Gollop Primary School": { lat: 13.09797, lon: -59.5572201, address: "Staple Grove, Christ Church, BB17003" },
    "Gordon Walters Primary School": { lat: 13.0962666, lon: -59.4945239, address: "Highway P, Bright Hill, St. Patrick's" },
    "St. Christopher Primary School": { lat: 13.0532305, lon: -59.5177023, address: "St Christopher's Road, St. Christopher, Hopewell" },
    "Cuthbert Moore Primary School": { lat: 13.1525839, lon: -59.5649785, address: "Highway 3, Astoria, Market Hill" },
    "Gordon Greenidge Primary School": { lat: 13.2292129, lon: -59.6233299, address: "Ronald Mapp Highway, Westmoreland, Saint Peter" },
    "The Lodge School": { lat: 13.1675413, lon: -59.4878405, address: "Highway H, Green Point, Society" },
    "Mount Tabor Primary School": { lat: 13.1821049, lon: -59.5237049, address: "Mount Tabor Church Road, Mount Tabor, Sherbourne" },
    "Tamarind Hall Branch Library (Eric Holder Municipal Complex)": { lat: 13.1931231, lon: -59.5437155, address: "Eric J Holder Municipal Complex, Surinam, Bowling Alley Hill" },
    "Ignatius Byer Primary School": { lat: 13.3091402, lon: -59.5946079, address: "Lowlands Road, Lowland, Pie Corner" },
    "Combermere School": { lat: 13.1167423, lon: -59.6021111, address: "Garlow Path, Bush Hall, Bridgetown" },
    "George Lamming Primary School": { lat: 13.1056377, lon: -59.6019488, address: "Bridge Road, Carrington Village, Saint Michael" },
    "Harrison College": { lat: 13.1001042, lon: -59.6100881, address: "Crumpton's Street, Bridgetown, Saint Michael" },
    "Lloyd Erskine Sandiford Centre": { lat: 13.1039434, lon: -59.5830398, address: "Two Mile Hill, Bridgetown, Saint Michael" },
    "Westbury Primary School": { lat: 13.1055624, lon: -59.6199231, address: "Westbury Road, New Orleans, Bridgetown" },
    "Coleridge and Parry School": { lat: 13.2598169, lon: -59.6383268, address: "Douglas Road, Speightstown, Saint Peter" },
    "Hillaby Seventh Day Adventist Church": { lat: 13.2128905, lon: -59.5878026, address: "Highway D, Gregg Farm, Hillaby" },
    "Ellerton Wesleyan Holiness Church": { lat: 13.1290645, lon: -59.5411593, address: "Eustace Lashley Road, Ellerton, Saint George" },
    "Church of God Orange Hill": { lat: 13.2041326, lon: -59.6051784, address: "Endeavour Cul-de-sac, Endeavour, Orange Hill" },
    "Black Rock Seventh Day Adventist Church": { lat: 13.1282351, lon: -59.6258395, address: "Ellerslie School Road, Black Rock, Saint Michael" },
    "Faith Wesleyan Holiness Church": { lat: 13.1369325, lon: -59.592313, address: "Highway E, Lears Court, Jackmans" },
    "Ruby Church of the Nazarene": { lat: 13.1274867, lon: -59.4479606, address: "Highway 5, Ruby Tenantry, Robinsons" },
    "Christ Church Foundation School": { lat: 13.0661926, lon: -59.540469, address: "Church Hill Main Road, Oistins, Christ Church" },
    "Deighton Griffith School": { lat: 13.079015, lon: -59.5522755, address: "Kingsland, Christ Church, BB15028" },
    "St. Bartholomew Primary School": { lat: 13.0749627, lon: -59.5141774, address: "Parish Land Road, Parish Land, Chancery Lane" },
    "Ellerton Primary School": { lat: 13.1317408, lon: -59.5411571, address: "Ellerton Road, Ellerton, Saint George" },
    "St. George Secondary": { lat: 13.1272196, lon: -59.563281, address: "Highway W, Constant, Saint George" },
    "West Terrace Primary School": { lat: 13.1450271, lon: -59.6311782, address: "Wanstead Drive, West Terrace, Bagatelle" },
    "Grantley Adams Memorial": { lat: 13.1882724, lon: -59.5429165, address: "Highway 3, Casuarina Hill, Horse Hill" },
    "St. Joseph Primary School": { lat: 13.1937681, lon: -59.5447443, address: "Highway 3, Casuarina Hill, Horse Hill" },
    "Selah Primary School": { lat: 13.3142642, lon: -59.6351882, address: "Highway 1B, Content, Greenidge" },
    "Bay Primary School": { lat: 13.0891058, lon: -59.6023449, address: "Bay Gardens, Bayland, Saint Michael" },
    "Grazettes Primary School": { lat: 13.1310222, lon: -59.6177211, address: "Denton Road, White Hall, Saint Michael" },
    "Lawrence T. Gay Memorial": { lat: 13.1236502, lon: -59.6089401, address: "Spooners Hill Main Road, Spooners Hill, Saint Michael" },
    "Luther Thorne Memorial": { lat: 13.0904114, lon: -59.5849019, address: "Wildey Road, Wildey Industrial Park, Wildey" },
    "Parkinson Memorial School": { lat: 13.0981946, lon: -59.5810359, address: "Pine East West Boulevard, The Pine, Saint Michael" },
    "Springer Memorial School": { lat: 13.1016624, lon: -59.5960977, address: "Government Hill, Saint Michael, BB14004" },
    "St. Leonard's Boys' School": { lat: 13.11187, lon: -59.617969, address: "President Kennedy Drive, Eagle Hall, Saint Michael" },
    "The St. Michael School": { lat: 13.0968678, lon: -59.6047107, address: "Martindales Road, Bridgetown, Saint Michael" },
    "Princess Margaret Secondary": { lat: 13.1190052, lon: -59.4752183, address: "Highway 5, Six Roads, Saint Philip" },
    "Reynold Weekes Primary School": { lat: 13.1089569, lon: -59.4699699, address: "Four Roads, Saint Philip, BB18053" },
    "Sharon Primary School": { lat: 13.1519468, lon: -59.6021556, address: "Jackson Arthur Seat Road, Arthur Seat, Saint Thomas" },
    "Welches Primary School": { lat: 13.1569988, lon: -59.6127065, address: "Highway 2A, Welches, Saint Thomas" },
    "Hawthorn Methodist Church": { lat: 13.0739936, lon: -59.5821481, address: "Worthing, Christ Church, BB15137" },
    "St. Christopher Anglican Church": { lat: 13.050674, lon: -59.5195226, address: "Enterprise Coast Road, Green Garden, Goodland" },
    "St. Matthias Anglican Church": { lat: 13.0759679, lon: -59.5994563, address: "St. Matthias Road, St. Matthias, Hastings" },
    "Dalkeith Methodist Church": { lat: 13.0875931, lon: -59.6001907, address: "Dalkeith Hill, Brittons Hill, Saint Michael" },
    "St. Philip-the-Less Anglican Church": { lat: 13.2844894, lon: -59.5819329, address: "Highway B1, Mount Stepney, Saint Peter" },
    "Gemswick Nazarene Church": { lat: 13.0844603, lon: -59.4686072, address: "Gemswick, Saint Philip, BB18093" },
    "St. Catherine's Anglican Church": { lat: 13.156438, lon: -59.441359, address: "St. Catherine Road, St. Catherine's, Saint Philip" },
  };

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

  function shelterCoords(s) {
    const exact = SHELTER_LOCATIONS[s.name];
    if (exact && exact.lat) return { lat: exact.lat, lon: exact.lon, exact: true };
    const parish = PARISH_CENTROIDS[s.parish];
    if (parish) return { lat: parish.lat, lon: parish.lon, exact: false };
    return null;
  }

  function shelterDistance(s) {
    if (!USER_LOCATION) return null;
    const c = shelterCoords(s);
    if (!c) return null;
    return { km: haversineKm(USER_LOCATION, c), exact: c.exact };
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

  function formatDistance(d) {
    if (!d || d.km == null) return '';
    const suffix = d.exact ? '' : ' from your parish';
    if (d.km < 0.5) return d.exact ? 'Very close' : 'In your parish';
    return d.km.toFixed(1) + ' km' + (d.exact ? ' away' : suffix);
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

  function setLocationButtonState(state) {
    const btn = document.getElementById('use-my-location');
    if (!btn) return;
    const label = btn.querySelector('.use-location-btn__label');
    if (state === 'loading') {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      if (label) label.textContent = 'Finding your location…';
    } else if (state === 'success') {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      if (label) label.textContent = 'Location set — refresh';
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      if (label) label.textContent = 'Use my location';
    }
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
    setLocationButtonState('loading');
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        USER_LOCATION = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        if (!userIsOnIsland()) {
          USER_LOCATION = null;
          setLocationStatus('You appear to be outside Barbados, so distance ' +
            'isn\'t meaningful. Filter by parish instead.');
          setLocationButtonState('idle');
          resetSortToParish();
          render();
          return;
        }
        setLocationStatus(
          'Sorted by distance from your parish. ' +
          'Two shelters in the same parish show the same distance.'
        );
        setLocationButtonState('success');
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
        setLocationButtonState('idle');
        resetSortToParish();
        render();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  // Clear a stale location-error message when the user interacts with another
  // filter — keeps a successful "sorted by distance" message, drops failures.
  function maybeClearStaleLocationStatus() {
    if (USER_LOCATION) return; // success message stays
    setLocationStatus(null);
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

    // Address (best-effort, OSM-geocoded). When we have an address we show
    // it inline so users don't have to leave the page just to find out
    // where the shelter is. When we don't, we fall back to a "Search this
    // shelter on a map" prompt that opens Google Maps in a new tab.
    const loc = SHELTER_LOCATIONS[s.name];
    const addressHtml = loc && loc.address
      ? `<p class="shelter__address">${escapeHtml(loc.address)}</p>`
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
        <h3 class="shelter__name">${escapeHtml(s.name)}</h3>
        <p class="shelter__meta">${escapeHtml(s.parish)}, ${s.ownership === 'Public' ? 'public' : 'privately owned'}, holds up to ${s.capacity} people (booklet planning figure — not live availability)</p>
        ${addressHtml}
        ${distanceHtml}
        <div class="shelter__tags">${tags}${warningTags}</div>
        ${notes}
        <p class="shelter__actions"><a class="shelter__link" href="${href}" target="_blank" rel="noopener noreferrer">Get directions on Google Maps</a></p>
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
        return da.km - db.km;
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
    function onFilterChange() {
      maybeClearStaleLocationStatus();
      render();
    }

    ['filter-parish', 'filter-access'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', onFilterChange);
    });

    const sortEl = document.getElementById('filter-sort');
    if (sortEl) {
      sortEl.addEventListener('change', function () {
        if (sortEl.value === 'distance' && !USER_LOCATION) {
          requestLocation();
        } else {
          maybeClearStaleLocationStatus();
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
        timer = setTimeout(onFilterChange, 150);
      });
    }

    document.querySelectorAll('input[name="category"]').forEach(function (el) {
      el.addEventListener('change', onFilterChange);
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
