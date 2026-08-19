const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5173);
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function safeResolve(urlPath) {
  const raw = decodeURIComponent(urlPath.split("?")[0].split("#")[0] || "/");
  const cleaned = raw.replaceAll("\\", "/");
  const requested = cleaned === "/" ? "/index.html" : cleaned;
  const abs = path.resolve(ROOT, "." + requested);
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  const filePath = safeResolve(req.url);
  if (!filePath) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback to index.html for client-side anchors/routes or missing files
      if (err.code === "ENOENT") {
        fs.readFile(path.join(ROOT, "index.html"), (err2, data2) => {
          if (err2) {
            res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
            res.end("Not found");
            return;
          }
          res.writeHead(200, { "content-type": MIME[".html"] });
          res.end(data2);
        });
        return;
      }

      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Server error");
      return;
    }

    res.writeHead(200, { "content-type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  // Intentionally minimal log
  console.log(`Portfolio running at http://localhost:${PORT}`);
});

