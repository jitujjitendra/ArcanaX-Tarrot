import { exec } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const staticRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const host = "127.0.0.1";
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

if (!existsSync(join(staticRoot, "index.html"))) {
  console.error("index.html was not found next to this file.");
  process.exit(1);
}

function send(res, statusCode, body, type = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": type,
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0] || "/");
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const candidate = resolve(staticRoot, normalize(relativePath));

  if (candidate !== staticRoot && !candidate.startsWith(staticRoot + sep)) return null;

  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const directoryIndex = join(candidate, "index.html");
    return existsSync(directoryIndex) ? directoryIndex : join(staticRoot, "index.html");
  }

  if (existsSync(candidate)) return candidate;
  return join(staticRoot, "index.html");
}

function openBrowser(url) {
  if (process.env.ARCANAX_NO_OPEN) return;
  const command = process.platform === "win32" ? `start "" "${url}"` : `xdg-open "${url}"`;
  exec(command, { windowsHide: true });
}

const server = createServer((req, res) => {
  if (!req.url || !["GET", "HEAD"].includes(req.method || "")) {
    send(res, 405, "Method not allowed");
    return;
  }

  const filePath = resolveRequestPath(req.url);
  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  if (!existsSync(filePath)) {
    send(res, 404, "Not found");
    return;
  }

  const type = contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
  const size = statSync(filePath).size;
  res.writeHead(200, { "Content-Type": type, "Content-Length": size, "Cache-Control": "no-store" });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(filePath).pipe(res);
});

let port = Number(process.env.PORT || 4173);
function listen() {
  server.listen(port, host, () => {
    const url = `http://${host}:${port}/`;
    console.log("");
    console.log("ArcanaX local preview is running:");
    console.log(url);
    console.log("");
    console.log("Keep this window open while testing. Press Ctrl+C to stop.");
    console.log("");
    openBrowser(url);
  });
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && port < 4299) {
    port += 1;
    listen();
    return;
  }
  console.error(error.message);
  process.exit(1);
});

listen();
