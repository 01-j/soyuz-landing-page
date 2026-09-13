const fs = require("fs");
const path = require("path");
const { main } = require("./apply-content.cjs");

const ROOT = __dirname;
const MD_PATH = path.join(ROOT, "content.md");

let timer = null;
let running = false;
let lastMtime = null;

function applyNow(reason) {
  if (running) return;
  running = true;
  console.log(`\n[watch] ${reason}`);
  try {
    main();
  } catch (err) {
    console.error("[watch] error:", err.message);
  } finally {
    running = false;
  }
}

function schedule(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => applyNow(reason), 300);
}

function refreshMtime() {
  try {
    lastMtime = fs.statSync(MD_PATH).mtimeMs;
  } catch {
    lastMtime = null;
  }
}

if (!fs.existsSync(MD_PATH)) {
  console.error("content.md tidak ditemukan. Jalankan dari folder proyek.");
  process.exit(1);
}

console.log("Menonton content.md — edit dan simpan untuk menerapkan otomatis ke index.html.");
console.log("Tekan Ctrl+C untuk berhenti.\n");

refreshMtime();
applyNow("penerapan awal");

// 1) Watch the directory (more reliable on Windows than watching the file
//    directly, especially when editors save via atomic rename).
try {
  fs.watch(ROOT, (eventType, filename) => {
    if (!filename || path.basename(filename) !== "content.md") return;
    schedule(`content.md diubah (${eventType})`);
  });
} catch (err) {
  console.error("[watch] fs.watch gagal, pakai polling:", err.message);
}

// 2) Polling fallback — catches any change fs.watch misses.
setInterval(() => {
  let mtime;
  try {
    mtime = fs.statSync(MD_PATH).mtimeMs;
  } catch {
    mtime = null;
  }
  if (mtime !== lastMtime) {
    lastMtime = mtime;
    schedule("content.md diubah (polling)");
  }
}, 800);

process.on("SIGINT", () => {
  console.log("\nBerhenti.");
  process.exit(0);
});