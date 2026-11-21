import { readFile } from "node:fs/promises";

export const LANGS = ["ko", "en"];
export const CATEGORIES = ["work", "custom", "hobby", "utility"];
export const STATUSES = ["available", "building", "archived"];
export const VISIBILITIES = ["public", "private"];

const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

export async function loadContent() {
  const site = await read("../src/data/site.json");
  const projects = await read("../src/data/projects.json");
  const messages = {};
  for (const lang of LANGS) messages[lang] = await read(`../src/i18n/${lang}.json`);
  validate({ site, projects, messages });
  return { site, projects, messages };
}

function messageEntries(value, prefix = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => messageEntries(child, prefix ? `${prefix}.${key}` : key));
  }
  return [[prefix, value]];
}

function placeholders(message) {
  const text = Array.isArray(message) ? message.join("\n") : String(message);
  return [...new Set(Array.from(text.matchAll(/\{(\w+)\}/g), (match) => match[1]))].sort();
}

export function validate({ site, projects, messages }) {
  const errors = [];
  const fail = (message) => errors.push(message);

  if (!/^https:\/\/[^/]+$/.test(site.origin)) fail("site.origin은 끝 슬래시 없는 https 주소여야 합니다");

  const koMessages = new Map(messageEntries(messages.ko));
  const enMessages = new Map(messageEntries(messages.en));
  for (const key of enMessages.keys()) {
    if (!koMessages.has(key)) fail(`i18n: en에만 있는 키 ${key}`);
  }
  for (const [key, koMessage] of koMessages) {
    if (!enMessages.has(key)) {
      fail(`i18n: ko에만 있는 키 ${key}`);
    } else if (placeholders(koMessage).join(",") !== placeholders(enMessages.get(key)).join(",")) {
      fail(`i18n: ${key}의 치환 변수가 ko와 en에서 다릅니다`);
    }
  }

  const ids = new Set();
  for (const project of projects) {
    const where = `projects[${project.id}]`;
    if (!/^[a-z0-9-]+$/.test(project.id)) fail(`${where}: id는 영문 소문자·숫자·하이픈`);
    if (ids.has(project.id)) fail(`${where}: id 중복`);
    ids.add(project.id);
    if (!project.name) fail(`${where}: name 없음`);
    if (!CATEGORIES.includes(project.category)) fail(`${where}: category`);
    if (!STATUSES.includes(project.status)) fail(`${where}: status`);
    if (!VISIBILITIES.includes(project.visibility)) fail(`${where}: visibility`);
    if (typeof project.listed !== "boolean") fail(`${where}: listed는 true/false`);
    for (const lang of LANGS) if (!project.summary?.[lang]) fail(`${where}: summary.${lang} 없음`);
    for (const field of ["url", "repo"]) {
      if (project[field] && !/^https:\/\//.test(project[field])) fail(`${where}: ${field}는 https 주소`);
    }
    if (project.repo && project.visibility !== "public") fail(`${where}: 비공개 프로젝트에 repo 링크를 둘 수 없습니다`);
  }

  if (errors.length) throw new Error(`콘텐츠 검증 실패\n- ${errors.join("\n- ")}`);
}
