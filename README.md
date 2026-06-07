# Awesome Analog Hub

> A community-curated gallery of open-source tools, research papers with code, and datasets for analog and mixed-signal IC design automation.

[![Deploy](https://github.com/analog-ml/awesome-analog-tools/actions/workflows/deploy.yml/badge.svg)](https://github.com/analog-ml/awesome-analog-tools/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-open--data-green)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**[→ Open the live site](https://analog-ml.github.io/awesome-analog-tools/)**

---

## What's inside

| Section | Count | Description |
|---------|------:|-------------|
| **Tools** | 25 | Simulators, layout editors, PDKs, schematic tools, RF solvers, and more |
| **Papers** | 9 | Analog EDA research papers with public code |
| **Datasets** | 3 | Open benchmarks and training corpora for analog ML research |

### Tool categories

`simulator` · `layout` · `pdk` · `schematic` · `rf-microwave` · `mixed-signal` · `waveform` · `characterization` · `framework` · `research`

### Paper venues covered

DAC · ICCAD · DATE · TCAD · TCAS · CICC · ISPD · JSSC · ESSDERC · JOSS · arXiv · AAAI · ICML · MLCAD

---

## Project structure

```
awesome-analog-tools/
├── index.html                        # Single-page application (vanilla HTML/CSS/JS)
├── assets/
│   ├── app.js                        # Tab routing, search, filter, card rendering
│   └── style.css                     # Design system (green accent, Inter font)
├── data/
│   ├── tools.json                    # 25 curated tools
│   ├── papers.json                   # 9 papers with code
│   └── datasets.json                 # 3 open datasets
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── add-tool.yml              # Structured form for tool submissions
│   │   ├── add-paper.yml             # Structured form for paper submissions
│   │   └── add-dataset.yml           # Structured form for dataset submissions
│   ├── scripts/
│   │   └── issue_to_json.py          # Parses issue body → JSON entry
│   └── workflows/
│       ├── deploy.yml                # CI validation + GitHub Pages deployment
│       └── issue-to-pr.yml           # Issue form → automatic PR bot
└── CONTRIBUTING.md                   # Contribution guide with full JSON schemas
```

---

## How contribution works

The site accepts contributions through two paths:

### Path 1 — Issue form (easiest, no git required)

1. Open the matching issue form:
   - [Add a Tool](https://github.com/analog-ml/awesome-analog-tools/issues/new?template=add-tool.yml)
   - [Add a Paper](https://github.com/analog-ml/awesome-analog-tools/issues/new?template=add-paper.yml)
   - [Add a Dataset](https://github.com/analog-ml/awesome-analog-tools/issues/new?template=add-dataset.yml)
2. Fill in the fields and submit.
3. A bot automatically parses your submission, appends the JSON entry to the right data file, pushes a branch, and opens a PR — all within about a minute.
4. A maintainer reviews and merges. Done.

### Path 2 — Pull request (full control)

1. Fork the repository.
2. Add your entry to the relevant data file following the schema in [CONTRIBUTING.md](CONTRIBUTING.md).
3. Open a PR titled `Add <type>: <name>` — e.g. `Add tool: ngspice`.
4. The CI `validate` job checks your JSON automatically. Fix any errors it reports.

---

## Data schemas

### Tool — `data/tools.json`

```json
{
  "id":          "unique-kebab-case-id",
  "name":        "Display Name",
  "description": "1–2 sentences.",
  "url":         "https://github.com/org/repo",
  "website":     "https://optional-project-site.com",
  "category":    "simulator",
  "tags":        ["Python", "SPICE"],
  "license":     "MIT",
  "stars":       1234,
  "owner":       "github-org-or-user"
}
```

### Paper — `data/papers.json`

```json
{
  "id":       "align-2019",
  "title":    "Full paper title",
  "abstract": "1–3 sentence summary.",
  "venue":    "DAC",
  "year":     2019,
  "pdf":      "https://arxiv.org/abs/...",
  "tasks":    ["analog-layout", "placement"],
  "methods":  ["constraint-based", "ILP"],
  "repos":    [{ "name": "org/repo", "url": "https://github.com/org/repo", "stars": 330 }]
}
```

### Dataset — `data/datasets.json`

```json
{
  "id":          "circuitnet",
  "name":        "CircuitNet",
  "description": "2–3 sentences.",
  "url":         "https://github.com/org/repo",
  "website":     "https://optional-site.com",
  "tasks":       ["performance-prediction", "routing"],
  "size":        "~200 GB",
  "format":      "numpy / HDF5",
  "license":     "CC BY 4.0",
  "papers":      ["circuitnet-2022"],
  "tags":        ["routing-congestion", "IR-drop"]
}
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for accepted values for `category`, `tasks`, venues, and acceptance criteria.

---

## CI / CD

### `deploy.yml` — validation and deployment

| Trigger | Jobs |
|---------|------|
| Push to `main` | `validate` → `deploy` (GitHub Pages) |
| Pull request | `validate` + live PR preview deployed to `gh-pages/pr-preview/pr-{N}/` |
| PR closed | Preview automatically removed |

The `validate` job checks every entry in all three JSON files for required fields, duplicate IDs, valid categories, and referential integrity (dataset `papers` IDs must exist in `papers.json`).

### `issue-to-pr.yml` — contribution bot

Triggers on issues whose title starts with `Add tool:`, `Add paper:`, or `Add dataset:`. Detects the form type from unique body field headers, parses every field, appends the JSON entry to the right data file, pushes a branch, and opens a PR.

> **Note:** PR creation requires a fine-grained PAT stored as a repository secret named `GH_PAT` with **Contents: write** and **Pull requests: write** permissions. This is needed because the GitHub organization blocks `GITHUB_TOKEN` from creating pull requests.

---

## Running locally

No build step required — open `index.html` directly in a browser or serve it with any static file server:

```bash
# Python
python3 -m http.server 8765

# Node
npx serve .
```

Then visit `http://localhost:8765`.

---

## License

- **Website code** (`index.html`, `assets/`) — [MIT](https://opensource.org/licenses/MIT)
- **Data files** (`data/`) — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

Individual tools, papers, and datasets retain their own licenses as listed in the data files.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full schemas, acceptance criteria, and step-by-step instructions. Questions? Open a [GitHub Discussion](https://github.com/analog-ml/awesome-analog-tools/discussions) or ask in the relevant issue.
