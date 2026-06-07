(() => {
  /* ── Constants ─────────────────────────────────────────────────── */
  const CAT_LABELS = {
    simulator:'Simulator', layout:'Layout', pdk:'PDK', schematic:'Schematic',
    'rf-microwave':'RF / Microwave', 'mixed-signal':'Mixed-Signal',
    waveform:'Waveform', characterization:'Characterization',
    framework:'Framework', research:'Research',
  };
  const TASK_LABELS = {
    'analog-layout':              'Analog Layout',
    'circuit-design':             'Circuit Design',
    'circuit-representation':     'Circuit Repr.',
    'circuit-sizing':             'Circuit Sizing',
    'code-generation':            'Code Gen.',
    'constraint-generation':      'Constraint Gen.',
    'device-modeling':            'Device Modeling',
    'floorplanning':              'Floorplanning',
    'full-flow':                  'Full-Flow',
    'multi-objective-optimization':'Multi-Obj. Opt.',
    'netlist-generation':         'Netlist Gen.',
    'noise-modeling':             'Noise Modeling',
    'parasitic-extraction':       'Parasitic Extraction',
    'performance-prediction':     'Perf. Prediction',
    'placement':                  'Placement',
    'routing':                    'Routing',
    'schematic-generation':       'Schematic Gen.',
    'sensitivity-analysis':       'Sensitivity Analysis',
    'technology-mapping':         'Tech. Mapping',
    'topology-generation':        'Topology Gen.',
    'topology-modeling':          'Topology Modeling',
    'topology-selection':         'Topology Selection',
    'topology-synthesis':         'Topology Synthesis',
    'transfer-learning':          'Transfer Learning',
    'variation-analysis':         'Variation Analysis',
    'yield-optimization':         'Yield Optimization',
  };
  const VENUE_ORDER = ['DAC','ICCAD','DATE','TCAD','TCAS','CICC','ISPD','JSSC','ESSDERC','JOSS','ICML','AAAI','MLCAD','arXiv','SCIENCE CHINA'];

  /* ── State ─────────────────────────────────────────────────────── */
  const state = {
    tools: [], papers: [], datasets: [],
    activeTab: 'tools',
    toolsCat: 'all', toolsSort: 'stars', toolsQ: '',
    papersTask: 'all', papersVenue: 'all', papersSort: 'year', papersQ: '',
    datasetsTask: 'all', datasetsQ: '',
  };

  /* ── Boot ──────────────────────────────────────────────────────── */
  Promise.all([
    fetch('data/tools.json').then(r => r.json()),
    fetch('data/papers.json').then(r => r.json()),
    fetch('data/datasets.json').then(r => r.json()),
  ]).then(([tools, papers, datasets]) => {
    state.tools = tools;
    state.papers = papers;
    state.datasets = datasets;
    buildStats();
    buildToolFilters();
    buildPaperFilters();
    buildDatasetFilters();
    setTab(hashTab() || 'tools');
    wireSearch();
  });

  function hashTab() {
    const h = location.hash.replace('#','');
    return ['tools','papers','datasets'].includes(h) ? h : null;
  }
  window.addEventListener('hashchange', () => setTab(hashTab() || 'tools'));

  /* ── Stats ─────────────────────────────────────────────────────── */
  function buildStats() {
    q('#stat-tools').textContent = state.tools.length;
    q('#stat-papers').textContent = state.papers.length;
    q('#stat-datasets').textContent = state.datasets.length;
    const totalStars = state.tools.reduce((s,t) => s + (t.stars||0), 0)
      + state.papers.flatMap(p=>p.repos).reduce((s,r) => s + (r.stars||0), 0);
    q('#stat-stars').textContent = (totalStars/1000).toFixed(1) + 'k';
  }

  /* ── Tab switching ─────────────────────────────────────────────── */
  function setTab(tab) {
    state.activeTab = tab;
    qAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
    qAll('.nav-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    location.hash = tab;
    renderActive();
  }
  qAll('.nav-tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

  function renderActive() {
    if (state.activeTab === 'tools')    renderTools();
    if (state.activeTab === 'papers')   renderPapers();
    if (state.activeTab === 'datasets') renderDatasets();
  }

  /* ── Search wiring ─────────────────────────────────────────────── */
  function wireSearch() {
    q('#global-search').addEventListener('input', e => {
      const v = e.target.value.trim().toLowerCase();
      state.toolsQ = v; state.papersQ = v; state.datasetsQ = v;
      // keep local search inputs in sync
      const ls = q('#tools-search'); if (ls) ls.value = e.target.value;
      renderActive();
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     TOOLS
  ══════════════════════════════════════════════════════════════════ */
  function buildToolFilters() {
    const counts = {};
    state.tools.forEach(t => { counts[t.category] = (counts[t.category]||0)+1; });
    const row = q('#tools-pill-row');
    row.appendChild(makePill('all', `All`, state.tools.length, true, v => { state.toolsCat=v; renderTools(); }));
    Object.entries(CAT_LABELS).forEach(([k,label]) => {
      if (!counts[k]) return;
      row.appendChild(makePill(k, label, counts[k], false, v => { state.toolsCat=v; renderTools(); }));
    });
    q('#tools-sort').addEventListener('change', e => { state.toolsSort=e.target.value; renderTools(); });
  }

  function renderTools() {
    const q2 = state.toolsQ;
    const tools = state.tools
      .filter(t => {
        const cat = state.toolsCat === 'all' || t.category === state.toolsCat;
        const search = !q2 || t.name.toLowerCase().includes(q2)
          || t.description.toLowerCase().includes(q2)
          || (t.owner||'').toLowerCase().includes(q2)
          || t.tags.some(tag => tag.toLowerCase().includes(q2));
        return cat && search;
      })
      .sort(state.toolsSort === 'name'
        ? (a,b) => a.name.localeCompare(b.name)
        : (a,b) => b.stars - a.stars);

    q('#tools-count').textContent = tools.length;
    // sync active pill
    qAll('#tools-pill-row .pill').forEach(p =>
      p.classList.toggle('active', p.dataset.val === state.toolsCat));

    const grid = q('#tools-grid');
    const empty = q('#tools-empty');
    if (!tools.length) { grid.innerHTML=''; empty.classList.add('visible'); return; }
    empty.classList.remove('visible');
    grid.innerHTML = tools.map(toolCardHTML).join('');
  }

  function toolCardHTML(t) {
    const label = CAT_LABELS[t.category] || t.category;
    const stars = t.stars >= 1000 ? (t.stars/1000).toFixed(1)+'k' : t.stars;
    const tags = t.tags.slice(0,5).map(tag=>`<span class="tag">${esc(tag)}</span>`).join('');
    const ws = t.website ? `<a class="link-btn" href="${esc(t.website)}" target="_blank" rel="noopener">${iGlobe(13)} Website</a>` : '';
    return `
<article class="tool-card">
  <div class="tool-card-head">
    <div>
      <div class="tool-name"><a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)}</a></div>
      <div class="tool-owner">${esc(t.owner||'')}</div>
    </div>
    <span class="cat-badge cat-${t.category}">${esc(label)}</span>
  </div>
  <p class="tool-desc">${esc(t.description)}</p>
  ${tags ? `<div class="tag-row">${tags}</div>` : ''}
  <div class="tool-footer">
    <div class="meta-row">
      <span class="meta-item">${iStar(13)} ${stars}</span>
      ${t.license ? `<span class="meta-item">${iLic(13)} ${esc(t.license)}</span>` : ''}
    </div>
    <div style="display:flex;gap:.4rem">
      ${ws}
      <a class="link-btn" href="${esc(t.url)}" target="_blank" rel="noopener">${iGH(13)} GitHub</a>
    </div>
  </div>
</article>`;
  }

  /* ══════════════════════════════════════════════════════════════════
     PAPERS
  ══════════════════════════════════════════════════════════════════ */
  function buildPaperFilters() {
    // tasks
    const taskCounts = {};
    state.papers.forEach(p => p.tasks.forEach(t => { taskCounts[t]=(taskCounts[t]||0)+1; }));
    const taskRow = q('#papers-task-row');
    taskRow.appendChild(makePill('all','All',state.papers.length,true,v=>{state.papersTask=v;renderPapers();}));
    Object.entries(TASK_LABELS).forEach(([k,label]) => {
      if (!taskCounts[k]) return;
      taskRow.appendChild(makePill(k,label,taskCounts[k],false,v=>{state.papersTask=v;renderPapers();}));
    });
    // venue
    const sel = q('#papers-venue');
    sel.innerHTML = '<option value="all">All Venues</option>';
    const venues = [...new Set(state.papers.map(p=>p.venue))].sort((a,b)=>{
      const ia=VENUE_ORDER.indexOf(a), ib=VENUE_ORDER.indexOf(b);
      if(ia===-1&&ib===-1) return a.localeCompare(b);
      if(ia===-1) return 1; if(ib===-1) return -1; return ia-ib;
    });
    venues.forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o); });
    sel.addEventListener('change', e => { state.papersVenue=e.target.value; renderPapers(); });
    q('#papers-sort').addEventListener('change', e => { state.papersSort=e.target.value; renderPapers(); });
  }

  function renderPapers() {
    const q2 = state.papersQ;
    const papers = state.papers
      .filter(p => {
        const task = state.papersTask==='all' || p.tasks.includes(state.papersTask);
        const venue = state.papersVenue==='all' || p.venue===state.papersVenue;
        const search = !q2 || p.title.toLowerCase().includes(q2)
          || p.abstract.toLowerCase().includes(q2)
          || p.tasks.some(t=>t.includes(q2))
          || (p.venue||'').toLowerCase().includes(q2);
        return task && venue && search;
      })
      .sort(state.papersSort==='stars'
        ? (a,b) => totalStars(b)-totalStars(a)
        : (a,b) => b.year-a.year);

    q('#papers-count').textContent = papers.length;
    qAll('#papers-task-row .pill').forEach(p =>
      p.classList.toggle('active', p.dataset.val===state.papersTask));

    const list = q('#papers-list');
    const empty = q('#papers-empty');
    if (!papers.length) { list.innerHTML=''; empty.classList.add('visible'); return; }
    empty.classList.remove('visible');
    list.innerHTML = papers.map(paperCardHTML).join('');
  }

  function totalStars(p) {
    return (p.repos||[]).reduce((s,r)=>s+(r.stars||0),0);
  }

  function paperCardHTML(p) {
    const venueCls = 'venue-' + CSS.escape(p.venue);
    const badges = [
      `<span class="venue-badge ${venueCls}">${esc(p.venue)} ${p.year}</span>`,
      ...p.tasks.map(t=>`<span class="task-pill">${esc(TASK_LABELS[t]||t)}</span>`)
    ].join('');
    const methods = p.methods.slice(0,3).map(m=>`<span class="method-tag">${esc(m)}</span>`).join('');
    const codeSection = p.repos.length
      ? p.repos.map(r=>`
          <a class="repo-card" href="${esc(r.url)}" target="_blank" rel="noopener">
            <span class="repo-name">${esc(r.name)}</span>
            <span class="repo-stars">${iStar(12)} ${r.stars>=1000?(r.stars/1000).toFixed(1)+'k':r.stars}</span>
          </a>`).join('')
      : `<div class="no-code">No public code yet</div>`;

    return `
<article class="paper-card">
  <div class="paper-main">
    <div class="paper-badges">${badges}</div>
    <div class="paper-title">
      <a href="${esc(p.pdf)}" target="_blank" rel="noopener">${esc(p.title)}</a>
    </div>
    <p class="paper-abstract">${esc(p.abstract)}</p>
    <div class="paper-meta-row">${methods}</div>
  </div>
  <div class="paper-code">
    <div class="code-header">
      ${iCode(13)} Code
      ${p.repos.length?`<span class="impl-count">${p.repos.length}</span>`:''}
    </div>
    ${codeSection}
  </div>
</article>`;
  }

  /* ══════════════════════════════════════════════════════════════════
     DATASETS
  ══════════════════════════════════════════════════════════════════ */
  function buildDatasetFilters() {
    const counts = {};
    state.datasets.forEach(d => d.tasks.forEach(t => { counts[t]=(counts[t]||0)+1; }));
    const row = q('#datasets-task-row');
    row.appendChild(makePill('all','All',state.datasets.length,true,v=>{state.datasetsTask=v;renderDatasets();}));
    Object.entries(TASK_LABELS).forEach(([k,label]) => {
      if (!counts[k]) return;
      row.appendChild(makePill(k,label,counts[k],false,v=>{state.datasetsTask=v;renderDatasets();}));
    });
  }

  function renderDatasets() {
    const q2 = state.datasetsQ;
    const datasets = state.datasets.filter(d => {
      const task = state.datasetsTask==='all' || d.tasks.includes(state.datasetsTask);
      const search = !q2 || d.name.toLowerCase().includes(q2)
        || d.description.toLowerCase().includes(q2)
        || d.tags.some(t=>t.toLowerCase().includes(q2));
      return task && search;
    });

    q('#datasets-count').textContent = datasets.length;
    qAll('#datasets-task-row .pill').forEach(p =>
      p.classList.toggle('active', p.dataset.val===state.datasetsTask));

    const grid = q('#datasets-grid');
    const empty = q('#datasets-empty');
    if (!datasets.length) { grid.innerHTML=''; empty.classList.add('visible'); return; }
    empty.classList.remove('visible');
    grid.innerHTML = datasets.map(datasetCardHTML).join('');
  }

  function datasetCardHTML(d) {
    const tags = d.tags.slice(0,5).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
    const taskPills = d.tasks.map(t=>`<span class="task-pill">${esc(TASK_LABELS[t]||t)}</span>`).join('');
    const paperLinks = (d.papers||[]).map(pid => {
      const p = state.papers.find(x=>x.id===pid);
      return p ? `<span class="paper-link-chip" onclick="switchToParper('${pid}')">${iFile(12)} ${esc(p.venue)} ${p.year}</span>` : '';
    }).join('');
    return `
<article class="dataset-card">
  <div class="dataset-head">
    <div class="dataset-name"><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.name)}</a></div>
    <span class="license-chip">${esc(d.license)}</span>
  </div>
  <p class="dataset-desc">${esc(d.description)}</p>
  ${tags ? `<div class="tag-row">${tags}</div>` : ''}
  <div class="tag-row">${taskPills}</div>
  <div class="dataset-footer">
    <div class="dataset-specs">
      ${d.size ? `<span class="spec-chip">${iDB(13)} ${esc(d.size)}</span>` : ''}
      ${d.format ? `<span class="spec-chip">${iFile(12)} ${esc(d.format)}</span>` : ''}
    </div>
    <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap">
      ${paperLinks}
      <a class="link-btn" href="${esc(d.url)}" target="_blank" rel="noopener">${iGH(13)} Code</a>
    </div>
  </div>
</article>`;
  }

  /* ── Helpers ────────────────────────────────────────────────────── */
  window.switchToParper = id => {
    setTab('papers');
    // small delay so DOM updates, then scroll to matching card
    setTimeout(() => {
      const cards = qAll('.paper-card');
      const found = [...cards].find(c => c.querySelector('.paper-title a')?.textContent);
      if (found) found.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  function makePill(val, label, count, active, cb) {
    const btn = document.createElement('button');
    btn.className = 'pill' + (active ? ' active' : '');
    btn.dataset.val = val;
    btn.innerHTML = `${esc(label)} <span class="cnt">${count}</span>`;
    btn.addEventListener('click', () => cb(val));
    return btn;
  }

  function q(sel) { return document.querySelector(sel); }
  function qAll(sel) { return document.querySelectorAll(sel); }
  function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── SVG icons ──────────────────────────────────────────────────── */
  function iStar(s) { return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>`; }
  function iGH(s) { return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>`; }
  function iGlobe(s) { return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8a13.705 13.705 0 0 0 2.22 7.338A6.006 6.006 0 0 1 2.05 8Zm.032-1a6.007 6.007 0 0 1 5.948-5.744 13.73 13.73 0 0 0-2.22 5.744H5.812ZM10.008 8H8.003A12.73 12.73 0 0 1 8 7.93V8l.001.07H10.008Zm.032-1H8.002a13.73 13.73 0 0 1 2.006-5.744A6.007 6.007 0 0 1 13.95 7H10.04Z"/></svg>`; }
  function iLic(s) { return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.199-.52.451-.94.705-.42.254-.913.392-1.316.403h-.004a1.75 1.75 0 0 1-1.741-1.68L13.5 8.96V4.5h-2v10.75a.75.75 0 0 1-1.5 0V4.5h-2v6.71a1.75 1.75 0 0 1-1.742 1.74h-.003c-.403-.011-.896-.15-1.315-.403a5.018 5.018 0 0 1-.94-.705l-.046-.04-.009-.01-.006-.005-.006-.006-.002-.002-.001-.002.529-.531-.53.53a.75.75 0 0 1-.154-.838L2.5 6.23h-.427a.75.75 0 0 1 0-1.5H4.307c.044 0 .086-.011.124-.033l1.29-.736A1.75 1.75 0 0 1 6.588 3.75H7.25V.75a.75.75 0 0 1 1.5 0Z"/></svg>`; }
  function iCode(s) { return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z"/></svg>`; }
  function iFile(s) { return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"/></svg>`; }
  function iDB(s) { return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3.5C1 2.119 4.03 1 8 1s7 1.119 7 2.5v2c0 1.381-3.03 2.5-7 2.5S1 6.881 1 5.5Zm0 4c0 1.381 3.03 2.5 7 2.5s7-1.119 7-2.5V5.5c0 1.381-3.03 2.5-7 2.5S1 6.881 1 5.5Zm0 0v4c0 1.381 3.03 2.5 7 2.5s7-1.119 7-2.5v-4"/></svg>`; }
})();
