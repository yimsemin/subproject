import { readFile } from "node:fs/promises";
import { LANGS, loadContent } from "./content.mjs";

const { site, projects } = await loadContent();
const errors = [];
const fail = (message) => errors.push(message);

const pages = { ko: "dist/index.html", en: "dist/en/index.html" };
const listed = projects.filter((p) => p.listed);

for (const lang of LANGS) {
  const html = await readFile(pages[lang], "utf8");
  if (!html.includes(`<html lang="${lang}">`)) fail(`${pages[lang]}: html lang`);
  if (html.split('class="project"').length - 1 !== listed.length) fail(`${pages[lang]}: 프로젝트 수가 listed와 다릅니다`);
  for (const project of projects.filter((p) => !p.listed)) {
    for (const text of [project.name, project.summary[lang]]) {
      if (html.includes(text)) fail(`${pages[lang]}: listed:false 프로젝트 "${project.id}"가 노출됩니다`);
    }
  }
  const external = [...html.matchAll(/(?:href|src)="(https?:[^"]+)"/g)].map((m) => m[1]);
  const allowed = new Set([site.origin, site.github, ...projects.flatMap((p) => [p.url, p.repo]).filter(Boolean)]);
  for (const link of external) {
    const known = [...allowed].some((a) => link === a || link.startsWith(`${site.origin}/`) || link === `${a}/`);
    if (!known) fail(`${pages[lang]}: 데이터에 없는 외부 링크 ${link}`);
  }
}

const css = await readFile("dist/style.css", "utf8");
for (const match of css.matchAll(/font-size:\s*([\d.]+)(px|rem)/g)) {
  const px = match[2] === "px" ? Number(match[1]) : Number(match[1]) * 17;
  if (px < 16) fail(`style.css: 12pt(16px)보다 작은 글자 ${match[0]}`);
}

if (errors.length) {
  console.error(`check 실패\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`check ok: ${listed.length} listed / ${projects.length - listed.length} hidden`);
