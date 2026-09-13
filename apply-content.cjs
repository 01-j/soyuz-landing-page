const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const MD_PATH = path.join(ROOT, "content.md");
const HTML_PATH = path.join(ROOT, "index.html");

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const TAG_RE = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>/g;
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function cleanCell(s) {
  let v = s.trim();
  if (v.startsWith("`") && v.endsWith("`") && v.length >= 2) {
    v = v.slice(1, -1);
  }
  return v.trim();
}

function parseAttributes(tagSource) {
  const attrs = {};
  ATTR_RE.lastIndex = 0;
  let m;
  while ((m = ATTR_RE.exec(tagSource))) attrs[m[1]] = m[2];
  return attrs;
}

function buildTree(html) {
  const root = { tag: "#root", attrs: {}, children: [], parent: null };
  const stack = [{ node: root, children: [] }];
  TAG_RE.lastIndex = 0;
  let m;

  while ((m = TAG_RE.exec(html))) {
    const raw = m[0];
    const start = m.index;
    if (raw.startsWith("<!--")) continue;

    const close = raw.startsWith("</");
    const selfClose = /\/\s*>$/.test(raw);
    const tagMatch = /<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(raw);
    const tag = tagMatch ? tagMatch[1].toLowerCase() : "";

    if (close) {
      const top = stack[stack.length - 1];
      if (top && top.node.tag === tag) {
        const el = top.node;
        el.innerEnd = start;
        el.closeStart = start;
        el.closeEnd = start + raw.length;
        stack.pop();
      }
      continue;
    }

    const parent = stack[stack.length - 1];
    const node = {
      tag,
      attrs: parseAttributes(raw),
      openStart: start,
      openEnd: start + raw.length,
      innerStart: start + raw.length,
      innerEnd: start + raw.length,
      children: [],
      parent: parent.node,
      elementIndex: parent.children.length + 1,
    };

    parent.children.push(node);
    parent.node.children.push(node);

    if (selfClose || VOID_TAGS.has(tag)) {
      node.isVoid = true;
      node.innerStart = node.innerEnd = node.openEnd;
    } else {
      stack.push({ node, children: [] });
    }
  }

  return { root };
}

function parsePart(str) {
  const part = { tag: null, id: null, classes: [], attrs: {}, nth: null };
  let rest = str.trim();
  const tagM = /^[a-zA-Z][a-zA-Z0-9-]*/.exec(rest);
  if (tagM) {
    part.tag = tagM[0].toLowerCase();
    rest = rest.slice(tagM[0].length);
  }
  while (rest) {
    if (rest.startsWith("#")) {
      const m = /^#([a-zA-Z0-9_-]+)/.exec(rest);
      part.id = m[1];
      rest = rest.slice(m[0].length);
    } else if (rest.startsWith(".")) {
      const m = /^\.[a-zA-Z0-9_-]+/.exec(rest);
      part.classes.push(m[0].slice(1));
      rest = rest.slice(m[0].length);
    } else if (rest.startsWith("[")) {
      const m = /^\[([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"\]/.exec(rest);
      if (m) {
        part.attrs[m[1]] = m[2];
        rest = rest.slice(m[0].length);
      } else {
        break;
      }
    } else if (rest.startsWith(":nth-child(")) {
      const m = /^:nth-child\(\s*(\d+)\s*\)/.exec(rest);
      part.nth = parseInt(m[1], 10);
      rest = rest.slice(m[0].length);
    } else {
      break;
    }
  }
  return part;
}

function parseSelector(selector) {
  const tokens = selector.trim().split(/\s+/);
  const parts = [];
  let combinator = " ";
  for (const tok of tokens) {
    if (tok === ">") {
      combinator = ">";
      continue;
    }
    parts.push({ part: parsePart(tok), combinator });
    combinator = " ";
  }
  return parts;
}

function matchPart(el, part) {
  if (part.tag && el.tag !== part.tag) return false;
  if (part.id && el.attrs.id !== part.id) return false;
  if (part.classes.length) {
    const cls = (el.attrs.class || "").split(/\s+/).filter(Boolean);
    for (const c of part.classes) if (!cls.includes(c)) return false;
  }
  for (const [k, v] of Object.entries(part.attrs)) {
    if (el.attrs[k] !== v) return false;
  }
  if (part.nth !== null && el.elementIndex !== part.nth) return false;
  return true;
}

function matchesSelector(el, parts) {
  if (!matchPart(el, parts[parts.length - 1].part)) return false;

  let cur = el.parent;
  for (let i = parts.length - 2; i >= 0; i--) {
    if (parts[i + 1].combinator === ">") {
      if (!cur || !matchPart(cur, parts[i].part)) return false;
      cur = cur.parent;
    } else {
      while (cur && cur.tag !== "#root" && !matchPart(cur, parts[i].part)) {
        cur = cur.parent;
      }
      if (!cur || cur.tag === "#root") return false;
      cur = cur.parent;
    }
  }
  return true;
}

function findAll(root, selector) {
  const parts = parseSelector(selector);
  const out = [];
  (function walk(node) {
    for (const child of node.children) {
      if (matchesSelector(child, parts)) out.push(child);
      walk(child);
    }
  })(root);
  return out;
}

function splitTableRow(row) {
  const body = row.slice(1, -1);
  const cells = [];
  let cur = "";
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "\\" && body[i + 1] === "|") {
      cur += "|";
      i++;
      continue;
    }
    if (ch === "|") {
      cells.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  return cells;
}

function parseContentMd(text) {
  const entries = [];
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith("|")) continue;
    if (/^\|[\s:|-]+\|$/.test(t)) continue;
    const cells = splitTableRow(t);
    if (cells.length < 2) continue;
    const selector = cleanCell(cells[0]);
    const value = cleanCell(cells[1]);
    if (!selector) continue;
    if (/^(selector|teks|lokasi|bagian)$/i.test(selector)) continue;
    entries.push({ selector, value });
  }
  return entries;
}

function buildMarquee(items) {
  const spans = items
    .filter((s) => s.trim())
    .map((s) => `<span>${escapeHtml(s.trim())}</span><i>·</i>`)
    .join("");
  return spans + spans;
}

function buildEdits(entries, tree, html) {
  const edits = [];
  for (const entry of entries) {
    const matches = findAll(tree.root, entry.selector);
    if (matches.length === 0) {
      console.warn(`  [SKIP] selector tidak ditemukan: ${entry.selector}`);
      continue;
    }
    const el = matches[0];

    if (entry.selector === ".marquee-track") {
      const newInner = buildMarquee(entry.value.split(";"));
      if (el.innerStart < el.innerEnd) {
        edits.push({ start: el.innerStart, end: el.innerEnd, text: newInner });
      }
      continue;
    }

    if (el.tag === "img" || el.tag === "meta") {
      const attrName = el.tag === "img" ? "alt" : "content";
      const open = html.slice(el.openStart, el.openEnd);
      const re = new RegExp(`${attrName}\\s*=\\s*"[^"]*"`);
      let newOpen;
      if (re.test(open)) {
        newOpen = open.replace(re, `${attrName}="${escapeAttr(entry.value)}"`);
      } else {
        const selfClose = /\/\s*>$/.test(open);
        newOpen = selfClose
          ? open.replace(/\/\s*>$/, ` ${attrName}="${escapeAttr(entry.value)}" />`)
          : open.replace(/>$/, ` ${attrName}="${escapeAttr(entry.value)}">`);
      }
      if (newOpen !== open) {
        edits.push({ start: el.openStart, end: el.openEnd, text: newOpen });
      }
      continue;
    }

    if (el.tag === "title") {
      if (el.innerStart < el.innerEnd) {
        edits.push({ start: el.innerStart, end: el.innerEnd, text: entry.value });
      }
      continue;
    }

    if (!el.isVoid && el.innerStart < el.innerEnd) {
      const current = html.slice(el.innerStart, el.innerEnd);
      if (current !== entry.value) {
        edits.push({ start: el.innerStart, end: el.innerEnd, text: entry.value });
      }
    }
  }
  return edits;
}

function apply(html, entries) {
  const { root } = buildTree(html);
  const edits = buildEdits(entries, { root }, html);
  edits.sort((a, b) => b.start - a.start);
  let out = html;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  return { out, count: edits.length };
}

function main() {
  if (!fs.existsSync(MD_PATH)) {
    console.error("content.md tidak ditemukan.");
    process.exit(1);
  }
  const md = fs.readFileSync(MD_PATH, "utf8");
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const entries = parseContentMd(md);
  console.log(`Ditemukan ${entries.length} entri konten.`);
  const { out, count } = apply(html, entries);
  if (out !== html) {
    fs.writeFileSync(HTML_PATH, out, "utf8");
    console.log(`index.html diperbarui (${count} perubahan).`);
  } else {
    console.log("Tidak ada perubahan - konten sudah sinkron.");
  }
}

module.exports = { main, apply, parseContentMd };

if (require.main === module) {
  main();
}