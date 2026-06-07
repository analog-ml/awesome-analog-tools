# Contributing to Awesome Analog Tools

Thank you for helping grow this hub! You can contribute **tools**, **papers**, or **datasets** — each has its own issue template and JSON data file.

---

## Quick links

| What | Issue form (easiest) | Data file (PR) |
|------|----------------------|----------------|
| Tool | [Add Tool →](https://github.com/analog-ml/awesome-analog-tools/issues/new?template=add-tool.yml) | `data/tools.json` |
| Paper | [Add Paper →](https://github.com/analog-ml/awesome-analog-tools/issues/new?template=add-paper.yml) | `data/papers.json` |
| Dataset | [Add Dataset →](https://github.com/analog-ml/awesome-analog-tools/issues/new?template=add-dataset.yml) | `data/datasets.json` |

---

## Option 1 — Open an Issue (easiest)

Pick the matching template above, fill in the form, and a maintainer will add the entry and open a PR on your behalf.

---

## Option 2 — Open a Pull Request

1. **Fork** this repository.
2. Add your entry to the relevant data file (`data/tools.json`, `data/papers.json`, or `data/datasets.json`).
3. Follow the schema for that file (see below).
4. Open a pull request with the title `Add <type>: <name>`, e.g. `Add tool: ngspice`.

The CI workflow validates all three JSON files on every PR — fix any schema errors before requesting review.

---

## Schemas

### Tool — `data/tools.json`

```json
{
  "id":          "unique-kebab-case-id",
  "name":        "Display Name",
  "description": "1–2 sentences describing what the tool does and who it is for.",
  "url":         "https://github.com/org/repo",
  "website":     "https://optional-project-website.com",
  "category":    "simulator",
  "tags":        ["Python", "SPICE", "tag3"],
  "license":     "MIT",
  "stars":       1234,
  "owner":       "github-org-or-user"
}
```

**Required fields:** `id`, `name`, `description`, `url`, `category`, `tags`, `license`, `stars`, `owner`

**Valid categories:**

| Value | When to use |
|-------|-------------|
| `simulator` | SPICE-based or custom circuit simulators |
| `layout` | GDS/mask layout editors and generators |
| `pdk` | Process Design Kits |
| `schematic` | Schematic capture tools |
| `rf-microwave` | EM solvers and RF/microwave-specific tools |
| `mixed-signal` | Mixed-signal design automation and generators |
| `waveform` | Waveform viewers and post-processing |
| `characterization` | Measurement, parameter extraction, and spec checking |
| `framework` | General frameworks, compilers, and full-flow environments |
| `research` | Research-oriented tools and libraries used in analog workflows |

**Acceptance criteria:**
- Must be open-source (source code publicly available).
- Must be relevant to analog, mixed-signal, or RF design.
- `id` must not already exist in `data/tools.json`.

---

### Paper — `data/papers.json`

```json
{
  "id":       "align-2019",
  "title":    "Full paper title",
  "abstract": "1–3 sentence summary of the contribution.",
  "venue":    "DAC",
  "year":     2019,
  "pdf":      "https://arxiv.org/abs/... or https://dl.acm.org/doi/...",
  "tasks":    ["analog-layout", "placement"],
  "methods":  ["constraint-based", "ILP"],
  "repos": [
    { "name": "org/repo", "url": "https://github.com/org/repo", "stars": 330 }
  ]
}
```

**Required fields:** `id`, `title`, `abstract`, `venue`, `year`, `pdf`, `tasks`, `methods`, `repos`

**Valid tasks:** `analog-layout`, `circuit-design`, `circuit-representation`, `circuit-sizing`, `code-generation`, `constraint-generation`, `device-modeling`, `floorplanning`, `full-flow`, `multi-objective-optimization`, `netlist-generation`, `noise-modeling`, `parasitic-extraction`, `performance-prediction`, `placement`, `routing`, `schematic-generation`, `sensitivity-analysis`, `technology-mapping`, `topology-generation`, `topology-modeling`, `topology-selection`, `topology-synthesis`, `transfer-learning`, `variation-analysis`, `yield-optimization`

**Accepted venues (non-exhaustive):** DAC, ICCAD, DATE, TCAD, TCAS, CICC, ISPD, JSSC, ESSDERC, JOSS, arXiv

**Acceptance criteria:**
- Must be relevant to analog, mixed-signal, or RF EDA.
- Must have at least one publicly accessible code repository (empty `repos: []` accepted only for seminal papers with no public code).
- `id` must not already exist in `data/papers.json`.

---

### Dataset — `data/datasets.json`

```json
{
  "id":          "circuitnet",
  "name":        "CircuitNet",
  "description": "2–3 sentences describing the content, how it was generated, and its use.",
  "url":         "https://github.com/org/repo",
  "website":     "https://optional-website.com",
  "tasks":       ["performance-prediction", "routing"],
  "size":        "~200 GB",
  "format":      "numpy / HDF5",
  "license":     "CC BY 4.0",
  "papers":      ["circuitnet-2022"],
  "tags":        ["routing-congestion", "IR-drop"]
}
```

**Required fields:** `id`, `name`, `description`, `url`, `tasks`, `license`, `papers`, `tags`

**`papers` field:** array of `id` strings from `data/papers.json`; use `[]` if no associated paper is listed.

**Acceptance criteria:**
- Must be publicly accessible (no paywall or mandatory login).
- Must be relevant to analog, mixed-signal, or RF EDA research.
- `id` must not already exist in `data/datasets.json`.

---

## Questions?

Open a [GitHub Discussion](https://github.com/analog-ml/awesome-analog-tools/discussions) or ask in the relevant issue.
