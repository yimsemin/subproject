import { execFile } from "node:child_process";
import { createReadStream, watch } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const port = Number(process.env.PORT || 4173);
const live = process.argv.includes("--watch");
const clients = new Set();
const reloadTag = `<script>new EventSource("/__reload").onmessage = () => location.reload();</script>`;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  let path;
  try {
    path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch {
    return res.writeHead(400).end();
  }
  if (live && path === "/__reload") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
    res.write(":\n\n");
    clients.add(res);
    return req.on("close", () => clients.delete(res));
  }
  let file = join(root, path);
  const relativePath = relative(root, file);
  if (relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    return res.writeHead(403).end();
  }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    await stat(file);
  } catch {
    return send(res, 404, join(root, "404.html"));
  }
  send(res, 200, file);
});

async function send(res, status, file) {
  const type = types[extname(file)] || "application/octet-stream";
  if (!live || type !== types[".html"]) {
    res.writeHead(status, { "Content-Type": type });
    return createReadStream(file).pipe(res);
  }
  const html = (await readFile(file, "utf8")).replace("</body>", `${reloadTag}</body>`);
  res.writeHead(status, { "Content-Type": type });
  res.end(html);
}

// --watch: 소스가 바뀌면 다시 빌드하고 열린 탭을 새로고침한다(미리보기 전용, dist에는 넣지 않는다).
let timer;
let building = false;
let pending = false;
function rebuild() {
  if (building) return void (pending = true);
  building = true;
  execFile(process.execPath, [fileURLToPath(new URL("./build.mjs", import.meta.url))], (error, stdout, stderr) => {
    building = false;
    if (error) console.error(`빌드 실패:\n${stderr || error.message}`);
    else for (const client of clients) client.write("data: reload\n\n");
    if (pending) {
      pending = false;
      rebuild();
    }
  });
}
if (live) {
  for (const target of ["../src", "./build.mjs", "./content.mjs"]) {
    watch(fileURLToPath(new URL(target, import.meta.url)), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 150);
    });
  }
}
server.listen(port, "127.0.0.1", () => console.log(`http://127.0.0.1:${server.address().port}`));
