import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const [rootArg = "src", portArg = "4173"] = process.argv.slice(2);
const root = resolve(rootArg);
const port = Number.parseInt(portArg, 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid port: ${portArg}`);
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

const server = createServer(async (request, response) => {
  try {
    const filePath = await resolveRequestPath(request.url || "/");
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      sendNotFound(response);
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });

    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendNotFound(response);
      return;
    }

    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`AI Tool Radar serving ${root}`);
  console.log(`http://127.0.0.1:${port}`);
});

async function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = pathname.endsWith("/")
    ? join(pathname, "index.html")
    : pathname;
  const normalized = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(root, `.${sep}${normalized}`);

  if (!filePath.startsWith(root)) {
    throw Object.assign(new Error("Forbidden"), { code: "ENOENT" });
  }

  return filePath;
}

function sendNotFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
}
