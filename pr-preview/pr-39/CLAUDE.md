# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project Context: AnalogEDA-Hub

A curated catalog of analog/mixed-signal/RF EDA research — papers, tools, and datasets — rendered as a static site from JSON files in `data/`.

### Primary workflow

When the user says **"add paper: [URL]"**, **"add tool: [URL]"**, or **"add dataset: [URL]"**:

1. Fetch metadata from the URL (title, abstract, venue, year, GitHub link).
2. If a GitHub repo is found, fetch the star count via `gh api repos/<owner>/<repo> --jq '.stargazers_count'`.
3. Map to the correct tasks and methods (see lists below).
4. Append the entry to the appropriate JSON file (`data/papers.json`, `data/tools.json`, `data/datasets.json`).
5. Validate JSON is still parseable: `python3 -c "import json; json.load(open('data/papers.json'))"`.
6. Ask the user before introducing a task, method, or category that doesn't already exist.

### papers.json schema

```json
{
  "id": "short-title-slug-year",
  "title": "Full Paper Title",
  "abstract": "1-3 sentence summary of what is proposed and its key contribution.",
  "venue": "DAC",
  "year": 2025,
  "pdf": "https://arxiv.org/abs/...",
  "tasks": ["circuit-sizing"],
  "methods": ["reinforcement-learning", "gnn"],
  "repos": [
    {
      "name": "org/repo",
      "url": "https://github.com/org/repo",
      "stars": 42
    }
  ]
}
```

**ID convention:** kebab-case slug from the first 4-5 meaningful title words + year. Examples: `align-2019`, `analogtobi-device-level-to-2026`, `differentiable-neural-network-2023`.

**Known tasks:** `analog-layout`, `circuit-representation`, `circuit-sizing`, `performance-prediction`, `placement`, `routing`, `topology-modeling`

Full task list (from issue template, not yet all used): `circuit-design`, `code-generation`, `constraint-generation`, `device-modeling`, `floorplanning`, `full-flow`, `multi-objective-optimization`, `netlist-generation`, `noise-modeling`, `parasitic-extraction`, `schematic-generation`, `sensitivity-analysis`, `technology-mapping`, `topology-generation`, `topology-selection`, `topology-synthesis`, `transfer-learning`, `variation-analysis`, `yield-optimization`

**Known venues:** AAAI, DAC, DATE, ICCAD, ICML, MLCAD, arXiv

### tools.json schema

```json
{
  "id": "tool-name",
  "name": "Display Name",
  "description": "...",
  "url": "https://github.com/org/repo",
  "website": "https://...",
  "category": "simulator",
  "tags": ["Python", "SPICE"],
  "license": "BSD",
  "stars": 1100,
  "owner": "org"
}
```

### datasets.json schema

```json
{
  "id": "dataset-id",
  "name": "Dataset Name",
  "description": "...",
  "url": "https://...",
  "website": "https://...",
  "tasks": ["circuit-sizing"],
  "size": "~167 MB",
  "format": "CSV",
  "license": "Apache 2.0",
  "papers": [],
  "tags": ["tag1", "tag2"]
}
```
