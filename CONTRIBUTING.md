# Contributing to Analog Open Source Tools

Thank you for helping grow this catalog! There are two ways to add a tool.

---

## Option 1 — Open an Issue (easiest)

Use the **[Add Tool issue template](https://github.com/analog-ml/opensource-analog-tools/issues/new?template=add-tool.yml)** and fill in the form. A maintainer will add it to `data/tools.json` and merge it.

---

## Option 2 — Open a Pull Request

1. **Fork** this repository.
2. Edit `data/tools.json` and add your tool entry at the end of the array.
3. Follow the schema below exactly.
4. Open a pull request with the title `Add tool: <tool-name>`.

### Tool Schema

```json
{
  "id":          "unique-kebab-case-id",
  "name":        "Display Name",
  "description": "One or two sentences describing what the tool does and who it's for.",
  "url":         "https://github.com/org/repo",
  "website":     "https://optional-project-website.com",
  "category":    "simulator",
  "tags":        ["Python", "SPICE", "tag3"],
  "license":     "MIT",
  "stars":       1234,
  "owner":       "github-org-or-user"
}
```

### Field Reference

| Field         | Required | Notes |
|---------------|----------|-------|
| `id`          | ✅       | Unique, lowercase, hyphens only (e.g. `ngspice`, `scikit-rf`) |
| `name`        | ✅       | Human-readable display name |
| `description` | ✅       | 1–2 sentences, plain text, no markdown |
| `url`         | ✅       | Primary repository URL (GitHub, GitLab, SourceForge, etc.) |
| `website`     |          | Project website if different from repo; omit or use `""` if none |
| `category`    | ✅       | Must be one of the values below |
| `tags`        | ✅       | Array of strings — programming languages, keywords (max 8) |
| `license`     | ✅       | SPDX identifier, e.g. `MIT`, `GPL-2.0`, `Apache-2.0` |
| `stars`       | ✅       | Approximate GitHub star count at time of submission |
| `owner`       | ✅       | GitHub org or username |

### Valid Categories

| Value              | When to use |
|--------------------|-------------|
| `simulator`        | SPICE-based or custom circuit simulators |
| `layout`           | GDS/mask layout editors and generators |
| `pdk`              | Process Design Kits |
| `schematic`        | Schematic capture tools |
| `rf-microwave`     | EM solvers and RF/microwave-specific tools |
| `mixed-signal`     | Mixed-signal design automation and generators |
| `waveform`         | Waveform viewers and post-processing |
| `characterization` | Measurement, parameter extraction, and spec checking |
| `framework`        | General frameworks, compilers, and full-flow environments |
| `research`         | Research-oriented tools and libraries used in analog workflows |

### Acceptance Criteria

- The tool must be **open-source** (source code publicly available).
- The tool must be relevant to **analog, mixed-signal, or RF** design, characterization, or research.
- The `id` must not already exist in `data/tools.json`.
- The description must be factually accurate.

---

## Questions?

Open a [GitHub Discussion](https://github.com/analog-ml/opensource-analog-tools/discussions) or ping the maintainers in the issue.
