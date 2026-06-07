#!/usr/bin/env python3
"""
Parse a GitHub Issue Form body and append the new entry to the appropriate
data JSON file. Writes step outputs to $GITHUB_OUTPUT.

Triggered by the issue-to-pr workflow for issues labelled
new-tool | new-paper | new-dataset.
"""

import json, os, re, sys

GITHUB_OUTPUT = os.environ.get("GITHUB_OUTPUT", "")


def write_output(key, value):
    value = str(value).replace("\n", "%0A").replace("\r", "%0D")
    line = f"{key}={value}\n"
    if GITHUB_OUTPUT:
        with open(GITHUB_OUTPUT, "a") as f:
            f.write(line)
    else:
        sys.stderr.write(line)


def fail(msg):
    write_output("success", "false")
    write_output("error", msg)
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(0)  # exit 0 so the workflow can post the error comment


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:50]


def parse_body(body):
    """Split issue form body into {section_header: value} dict."""
    # Each section starts with '### '
    chunks = re.split(r"(?m)^### ", body)
    result = {}
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        lines = chunk.split("\n")
        header = lines[0].strip()
        value_lines = [l for l in lines[1:] if l.strip()]
        value = "\n".join(value_lines).strip()
        if value in ("_No response_", ""):
            value = ""
        result[header] = value
    return result


def parse_csv(text):
    """'C, SPICE, tag' → ['C', 'SPICE', 'tag']"""
    if not text:
        return []
    return [t.strip() for t in re.split(r"[,;]", text) if t.strip()]


def parse_multiselect(text):
    """'- analog-layout\\n- routing' or plain csv → list"""
    if not text:
        return []
    if "\n" in text or text.lstrip().startswith("- "):
        return [
            l.lstrip("- \t").strip()
            for l in text.split("\n")
            if re.match(r"\s*- ", l)
        ]
    return parse_csv(text)


def parse_int(text):
    m = re.search(r"[\d,]+", text or "")
    if not m:
        return 0
    return int(m.group().replace(",", ""))


def unique_id(base, existing_ids):
    candidate = base
    i = 2
    while candidate in existing_ids:
        candidate = f"{base}-{i}"
        i += 1
    return candidate


def load_json(path):
    with open(path) as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


# ── Per-type builders ─────────────────────────────────────────────────────────

def build_tool(fields, existing_ids):
    for req in ("Tool Name", "Repository URL", "Description", "Category",
                "Tags", "License (SPDX)", "Approximate GitHub Stars"):
        if not fields.get(req):
            fail(f"Missing required field: **{req}**")

    name = fields["Tool Name"].strip()
    url  = fields["Repository URL"].strip()
    entry_id = unique_id(slugify(name), existing_ids)

    # Derive owner from GitHub URL (org or user segment)
    owner = ""
    m = re.search(r"github\.com/([^/]+)", url)
    if m:
        owner = m.group(1)

    return entry_id, {
        "id":          entry_id,
        "name":        name,
        "description": fields["Description"].strip(),
        "url":         url,
        "website":     fields.get("Project Website (optional)", "").strip(),
        "category":    fields["Category"].strip(),
        "tags":        parse_csv(fields["Tags"]),
        "license":     fields["License (SPDX)"].strip(),
        "stars":       parse_int(fields["Approximate GitHub Stars"]),
        "owner":       owner,
    }


def build_paper(fields, existing_ids):
    for req in ("Paper Title", "Paper URL (PDF / arXiv / DOI)", "Venue / Journal",
                "Year", "Short Abstract / Summary", "Methods / Techniques",
                "Code Repository / Repositories"):
        if not fields.get(req):
            fail(f"Missing required field: **{req}**")

    title = fields["Paper Title"].strip()
    year  = parse_int(fields["Year"])
    venue = fields["Venue / Journal"].strip().upper()
    entry_id = unique_id(slugify(f"{slugify(title[:30])}-{year}"), existing_ids)

    # Parse repos: one per line, format: "https://github.com/org/repo — 500 stars"
    repos = []
    for line in fields["Code Repository / Repositories"].split("\n"):
        line = line.strip().lstrip("- ")
        if not line:
            continue
        m = re.match(r"(https?://\S+?)(?:\s+[—–\-]+\s*(\d[\d,]*)\s*stars?)?[\s.]*$",
                     line, re.I)
        if m:
            repo_url   = m.group(1).rstrip("/.,")
            repo_stars = int(m.group(2).replace(",", "")) if m.group(2) else 0
        else:
            repo_url   = line.split()[0].rstrip("/.,")
            repo_stars = 0
        parts = repo_url.rstrip("/").split("/")
        repo_name = "/".join(parts[-2:]) if len(parts) >= 2 else repo_url
        repos.append({"name": repo_name, "url": repo_url, "stars": repo_stars})

    return entry_id, {
        "id":       entry_id,
        "title":    title,
        "abstract": fields["Short Abstract / Summary"].strip(),
        "venue":    venue,
        "year":     year,
        "pdf":      fields["Paper URL (PDF / arXiv / DOI)"].strip(),
        "tasks":    parse_multiselect(fields.get("EDA Tasks (select all that apply)", "")),
        "methods":  parse_csv(fields["Methods / Techniques"]),
        "repos":    repos,
    }


def build_dataset(fields, existing_ids):
    for req in ("Dataset Name", "Repository / Download URL",
                "Description", "License (SPDX)", "Tags"):
        if not fields.get(req):
            fail(f"Missing required field: **{req}**")

    name     = fields["Dataset Name"].strip()
    entry_id = unique_id(slugify(name), existing_ids)

    return entry_id, {
        "id":          entry_id,
        "name":        name,
        "description": fields["Description"].strip(),
        "url":         fields["Repository / Download URL"].strip(),
        "website":     fields.get("Website (optional)", "").strip(),
        "tasks":       parse_multiselect(fields.get("EDA Tasks (select all that apply)", "")),
        "size":        fields.get("Dataset Size (approximate)", "").strip(),
        "format":      fields.get("File Format(s)", "").strip(),
        "license":     fields["License (SPDX)"].strip(),
        "papers":      [],   # maintainer fills in IDs after review
        "tags":        parse_csv(fields["Tags"]),
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    body          = os.environ.get("ISSUE_BODY", "")
    label_added   = os.environ.get("ISSUE_LABEL_ADDED", "")
    issue_number  = os.environ.get("ISSUE_NUMBER", "0")

    print(f"DEBUG label_added={label_added!r}  issue_number={issue_number}")

    # Route by the specific label that was just applied (reliable on 'labeled' event)
    if label_added == "new-tool":
        kind, data_file = "tool", "data/tools.json"
    elif label_added == "new-paper":
        kind, data_file = "paper", "data/papers.json"
    elif label_added == "new-dataset":
        kind, data_file = "dataset", "data/datasets.json"
    else:
        fail(f"Label `{label_added}` is not a contribution label; nothing to do.")
        return

    fields = parse_body(body)
    if not fields:
        fail("Could not parse any fields from the issue body.")
        return

    data         = load_json(data_file)
    existing_ids = {e["id"] for e in data}

    if kind == "tool":
        entry_id, entry = build_tool(fields, existing_ids)
    elif kind == "paper":
        entry_id, entry = build_paper(fields, existing_ids)
    else:
        entry_id, entry = build_dataset(fields, existing_ids)

    data.append(entry)
    save_json(data_file, data)

    display_name = entry.get("name") or entry.get("title") or entry_id
    branch       = f"add-{kind}/issue-{issue_number}-{slugify(entry_id)}"

    write_output("success",   "true")
    write_output("kind",      kind)
    write_output("entry_id",  entry_id)
    write_output("data_file", data_file)
    write_output("branch",    branch)
    write_output("pr_title",  f"Add {kind}: {display_name}")
    write_output("label",     f"new-{kind}")


if __name__ == "__main__":
    main()
