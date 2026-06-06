(() => {
  const CATEGORY_LABELS = {
    'simulator':         'Simulator',
    'layout':            'Layout',
    'pdk':               'PDK',
    'schematic':         'Schematic',
    'rf-microwave':      'RF / Microwave',
    'mixed-signal':      'Mixed-Signal',
    'waveform':          'Waveform',
    'characterization':  'Characterization',
    'framework':         'Framework',
    'research':          'Research',
  };

  const SORT_FNS = {
    stars: (a, b) => b.stars - a.stars,
    name:  (a, b) => a.name.localeCompare(b.name),
  };

  let allTools = [];
  let activeCategory = 'all';
  let searchQuery = '';
  let sortKey = 'stars';

  // ── DOM refs ──────────────────────────────────────────────────────
  const grid        = document.getElementById('tools-grid');
  const emptyState  = document.getElementById('empty-state');
  const pillList    = document.getElementById('pill-list');
  const searchInput = document.getElementById('search');
  const sortSelect  = document.getElementById('sort-by');
  const countEl     = document.getElementById('result-count');

  // ── Fetch data ────────────────────────────────────────────────────
  fetch('data/tools.json')
    .then(r => r.json())
    .then(data => {
      allTools = data;
      buildCategoryPills();
      render();
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:red;grid-column:1/-1">Failed to load tools.json</p>';
    });

  // ── Category pills ────────────────────────────────────────────────
  function buildCategoryPills() {
    const counts = {};
    allTools.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });

    const allPill = makePill('all', `All <span class="count">${allTools.length}</span>`, true);
    pillList.appendChild(allPill);

    Object.entries(CATEGORY_LABELS).forEach(([key, label]) => {
      if (!counts[key]) return;
      const pill = makePill(key, `${label} <span class="count">${counts[key]}</span>`, false);
      pillList.appendChild(pill);
    });
  }

  function makePill(category, html, active) {
    const btn = document.createElement('button');
    btn.className = 'pill' + (active ? ' active' : '');
    btn.innerHTML = html;
    btn.addEventListener('click', () => {
      activeCategory = category;
      pillList.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
    return btn;
  }

  // ── Events ────────────────────────────────────────────────────────
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    render();
  });

  sortSelect.addEventListener('change', () => {
    sortKey = sortSelect.value;
    render();
  });

  // ── Filter + sort ─────────────────────────────────────────────────
  function filtered() {
    return allTools
      .filter(t => {
        const matchCat = activeCategory === 'all' || t.category === activeCategory;
        const q = searchQuery;
        const matchSearch = !q ||
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q)) ||
          (t.owner && t.owner.toLowerCase().includes(q));
        return matchCat && matchSearch;
      })
      .sort(SORT_FNS[sortKey] || SORT_FNS.stars);
  }

  // ── Render ────────────────────────────────────────────────────────
  function render() {
    const tools = filtered();
    countEl.textContent = tools.length;

    if (tools.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.add('visible');
      return;
    }
    emptyState.classList.remove('visible');
    grid.innerHTML = tools.map(cardHTML).join('');
  }

  function cardHTML(tool) {
    const catClass = `cat-${tool.category}`;
    const catLabel = CATEGORY_LABELS[tool.category] || tool.category;
    const starsFormatted = tool.stars >= 1000
      ? (tool.stars / 1000).toFixed(1) + 'k'
      : tool.stars;
    const tagsHTML = tool.tags
      .slice(0, 5)
      .map(t => `<span class="tag">${escHtml(t)}</span>`)
      .join('');
    const websiteLink = tool.website
      ? `<a class="card-link" href="${escHtml(tool.website)}" target="_blank" rel="noopener">
           ${iconGlobe(14)} Website
         </a>`
      : '';

    return `
<article class="card">
  <div class="card-head">
    <div>
      <div class="card-name">
        <a href="${escHtml(tool.url)}" target="_blank" rel="noopener">${escHtml(tool.name)}</a>
      </div>
      <div class="card-owner">${escHtml(tool.owner || '')}</div>
    </div>
    <span class="category-badge ${catClass}">${escHtml(catLabel)}</span>
  </div>

  <p class="card-description">${escHtml(tool.description)}</p>

  ${tagsHTML ? `<div class="card-tags">${tagsHTML}</div>` : ''}

  <div class="card-footer">
    <div class="card-meta">
      <span class="meta-item">
        ${iconStar(13)}
        ${starsFormatted}
      </span>
      ${tool.license ? `<span class="meta-item">${iconLicense(13)} ${escHtml(tool.license)}</span>` : ''}
    </div>
    <div style="display:flex;gap:.5rem;align-items:center">
      ${websiteLink}
      <a class="card-link" href="${escHtml(tool.url)}" target="_blank" rel="noopener">
        ${iconGithub(14)} GitHub
      </a>
    </div>
  </div>
</article>`;
  }

  // ── SVG icons ─────────────────────────────────────────────────────
  function iconStar(s) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>`;
  }
  function iconLicense(s) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.199-.52.451-.94.705-.42.254-.913.392-1.316.403h-.004a1.75 1.75 0 0 1-1.743-1.68L5.5 8.96V4.5h-2v10.75a.75.75 0 0 1-1.5 0V4.5H.75a.75.75 0 0 1 0-1.5h2.5A.75.75 0 0 1 4 3.75V9h1.5V3.75A.75.75 0 0 1 6.25 3H9V.75A.75.75 0 0 1 8.75 0Z"/></svg>`;
  }
  function iconGithub(s) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>`;
  }
  function iconGlobe(s) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8a13.705 13.705 0 0 0 2.22 7.338A6.006 6.006 0 0 1 2.05 8Zm.032-1a6.007 6.007 0 0 1 5.948-5.744 13.73 13.73 0 0 0-2.22 5.744H5.812ZM9.19 8H8.003A12.73 12.73 0 0 1 8 7.93V8l.001.07H9.19Zm.818 0h2.198A6.007 6.007 0 0 1 8 13.744 13.73 13.73 0 0 0 10.008 8Zm.032-1H8.002a13.73 13.73 0 0 1 2.006-5.744A6.007 6.007 0 0 1 13.95 7H10.04Z"/></svg>`;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
