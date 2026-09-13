const http = require("http");
const fs = require("fs");
const path = require("path");
const { main: applyContent } = require("./apply-content.cjs");

const ROOT = __dirname;
const PORT = process.env.PORT ? Number(process.env.PORT) : 5500;
const MD_PATH = path.join(ROOT, "content.md");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

const RELOAD_SNIPPET = `
<script>
  (function () {
    var es = new EventSource("/__livereload");
    es.onmessage = function (e) {
      if (e.data === "reload") location.reload();
    };
    es.onerror = function () {
      // server restarted — try to reconnect shortly
      setTimeout(function () { location.reload(); }, 1000);
    };
  })();
</script>
`;

const clients = new Set();

function broadcast() {
  for (const res of clients) {
    try {
      res.write("data: reload\n\n");
    } catch {
      clients.delete(res);
    }
  }
}

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function applyAndBroadcast(reason) {
  console.log(`\n[dev] ${reason}`);
  try {
    applyContent();
  } catch (err) {
    console.error("[dev] apply error:", err.message);
  }
  broadcast();
}

// Apply once at startup so index.html is in sync before serving.
applyAndBroadcast("penerapan awal");

// Watch content.md -> apply -> reload browser.
fs.watch(ROOT, debounce((eventType, filename) => {
  if (!filename) return;
  const name = path.basename(filename);
  if (name === "content.md") {
    applyAndBroadcast(`content.md diubah (${eventType})`);
  } else if (["index.html", "styles.css", "script.js"].includes(name)) {
    console.log(`\n[dev] ${name} diubah — reload browser`);
    broadcast();
  }
}, 200));

// Polling fallback for content.md (catches atomic-rename saves from editors).
let lastMtime = null;
try {
  lastMtime = fs.statSync(MD_PATH).mtimeMs;
} catch {}
setInterval(() => {
  let mtime = null;
  try {
    mtime = fs.statSync(MD_PATH).mtimeMs;
  } catch {}
  if (mtime !== lastMtime) {
    lastMtime = mtime;
    applyAndBroadcast("content.md diubah (polling)");
  }
}, 800);

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  if (urlPath === "/__livereload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("retry: 1000\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const filePath = path.join(ROOT, rel);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";

    if (ext === ".html") {
      const html = data.toString("utf8").replace("</body>", `${RELOAD_SNIPPET}</body>`);
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
      res.end(html);
      return;
    }

    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\nServer jalan di: http://localhost:${PORT}`);
  console.log("Edit content.md dan simpan — browser akan refresh otomatis.");
  console.log("Tekan Ctrl+C untuk berhenti.");
});

process.on("SIGINT", () => {
  console.log("\nBerhenti.");
  process.exit(0);
});