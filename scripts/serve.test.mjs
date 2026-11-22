import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("preview serves both languages and assets, and returns the custom 404", { timeout: 10000 }, async (t) => {
  const child = spawn(process.execPath, [fileURLToPath(new URL("./serve.mjs", import.meta.url))], {
    env: { ...process.env, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const exited = once(child, "exit");
  t.after(async () => {
    child.kill();
    await exited;
  });
  const [output] = await once(child.stdout, "data", { signal: AbortSignal.timeout(5000) });
  const origin = output.toString().trim();
  for (const [path, status, type, content] of [
    ["/", 200, "text/html", '<html lang="ko">'],
    ["/en/", 200, "text/html", '<html lang="en">'],
    ["/style.css", 200, "text/css", ":root"],
    ["/missing-page", 404, "text/html", 'name="robots" content="noindex"'],
  ]) {
    const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, status, path);
    assert.ok(response.headers.get("content-type")?.startsWith(type), `${path}: content type`);
    assert.ok((await response.text()).includes(content), `${path}: content`);
  }
  for (const [path, status] of [["/..%2fpackage.json", 403], ["/%E0%A4%A", 400]]) {
    const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, status, path);
    await response.text();
  }
  for (const path of ["/favicon.png", "/logo-light.png", "/logo-dark.png"]) {
    const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("content-type"), "image/png", path);
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.deepEqual([...bytes.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${path}: PNG signature`);
  }
});

test("--watch injects the live-reload script and serves it only in watch mode", { timeout: 10000 }, async (t) => {
  const start = async (args) => {
    const child = spawn(process.execPath, [fileURLToPath(new URL("./serve.mjs", import.meta.url)), ...args], {
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const exited = once(child, "exit");
    t.after(async () => {
      child.kill();
      await exited;
    });
    const [output] = await once(child.stdout, "data", { signal: AbortSignal.timeout(5000) });
    return output.toString().trim();
  };
  const watched = await (await fetch(`${await start(["--watch"])}/`)).text();
  assert.ok(watched.includes("/__reload"), "watch mode: reload script");
  const plain = await (await fetch(`${await start([])}/`)).text();
  assert.ok(!plain.includes("/__reload"), "default mode: no reload script");
});
