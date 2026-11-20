import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { loadContent } from "./content.mjs";

const script = await readFile("src/static/updates.js", "utf8");

test("public update dates are formatted and failures stay hidden", async () => {
  const rows = ["owner/active", "owner/failed"].map((repo) => ({
    hidden: true,
    time: {},
    getAttribute: () => repo,
    querySelector() { return this.time; },
  }));
  const calls = [];
  const requests = [];
  runInNewContext(script, {
    document: { querySelectorAll: () => rows },
    sessionStorage: { getItem: () => null, setItem() {} },
    fetch(url) {
      calls.push(url);
      const request = Promise.resolve(url.includes("active")
        ? { ok: true, json: () => [{ commit: { committer: { date: "2025-11-03T12:00:00Z" } } }] }
        : { ok: false });
      requests.push(request);
      return request;
    },
  });
  await Promise.all(requests);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.length, 2);
  assert.equal(rows[0].time.textContent, "251103");
  assert.equal(rows[0].hidden, false);
  assert.equal(rows[1].hidden, true);
});

test("generated pages include update targets only for listed public non-archived GitHub repositories", async () => {
  const { projects } = await loadContent();
  const expected = projects.filter((p) => p.listed && p.visibility === "public" && p.status !== "archived" && /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/i.test(p.repo || ""));
  for (const file of ["dist/index.html", "dist/en/index.html"]) {
    const html = await readFile(file, "utf8");
    const targets = [...html.matchAll(/data-github-repo="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(targets.sort(), expected.map((p) => p.repo.replace(/^https:\/\/github\.com\//i, "").replace(/\/$/, "")).sort());
  }
});
