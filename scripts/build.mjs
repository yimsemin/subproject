import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { CATEGORIES, LANGS, loadContent } from "./content.mjs";

const { site, projects, messages } = await loadContent();

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const rich = (value) => esc(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const lines = (value) => value.split(" / ").map((line) => `<span class="line">${rich(line)}</span>`).join(" ");
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => {
  if (!Object.hasOwn(values, key)) throw new Error(`i18n: 치환 변수 "${key}"에 값을 제공해야 합니다`);
  return values[key];
});

const base = (lang) => (lang === "ko" ? "/" : `/${lang}/`);
const canonical = (lang) => `${site.origin}${base(lang)}`;
const otherLang = (lang) => LANGS.find((l) => l !== lang);

const listed = projects
  .filter((p) => p.listed)
  .map((p, index) => ({ ...p, index }))
  .sort((a, b) => Number(a.status === "archived") - Number(b.status === "archived") || a.index - b.index);

function projectRow(project, lang, t) {
  const name = lang === "en" && project.nameEn ? project.nameEn : project.name;
  const links = [];
  const githubRepo = project.repo?.match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/?$/i);
  const updateRepo = project.visibility === "public" && project.status !== "archived" && githubRepo
    ? `${encodeURIComponent(githubRepo[1])}/${encodeURIComponent(githubRepo[2])}` : "";
  if (project.url) links.push(`<li><a href="${esc(project.url)}" rel="noopener">${esc(t.open)} ↗</a></li>`);
  if (project.repo) links.push(`<li><a href="${esc(project.repo)}" rel="noopener">${esc(t.repo)} ↗</a></li>`);
  return `        <li class="project" data-category="${project.category}" data-archived="${project.status === "archived"}">
          <div>
            <h2 class="p-name">${esc(name)}</h2>
            <p class="p-tags"><span class="category-tag">${esc(t.categories[project.category])}</span>${project.status === "archived" ? ` <span class="archive-tag">${esc(t.archived)}</span>` : ""}</p>
${updateRepo ? `            <p class="p-updated" data-github-repo="${esc(updateRepo)}" hidden><span>${esc(t.lastUpdated)}</span> <time></time></p>\n` : ""}          </div>
          <p class="p-sum">${esc(project.summary[lang])}</p>
${links.length ? `          <ul class="p-links">${links.join("")}</ul>\n` : ""}
        </li>`;
}

function page(lang) {
  const t = messages[lang];
  const other = otherLang(lang);
  const archived = listed.filter((p) => p.status === "archived").length;
  const usedCategories = CATEGORIES.filter((c) => listed.some((p) => p.category === c));
  const filterLabel = (label, count) => esc(fill(t.filterCount, { label, count }));
  const filters = [
    `<li><button type="button" data-filter="all" aria-pressed="true">${esc(t.filterAll)}</button></li>`,
    ...usedCategories.map((c) => `<li><button type="button" data-filter="${c}" aria-pressed="false">${filterLabel(t.categories[c], listed.filter((p) => p.category === c).length)}</button></li>`),
    ...(archived ? [`<li class="archive-filter"><span class="filter-separator" aria-hidden="true">|</span><button type="button" data-filter="archived" aria-pressed="false">${filterLabel(t.archived, archived)}</button></li>`] : []),
  ].join("\n        ");
  const email = site.email
    ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`
    : `<a href="${esc(site.github)}" rel="noopener">${esc(t.repo)} ↗</a>`;

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(t.metaTitle)}</title>
  <meta name="description" content="${esc(t.metaDescription)}">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#0CCCCC">
  <link rel="canonical" href="${canonical(lang)}">
${LANGS.map((l) => `  <link rel="alternate" hreflang="${l}" href="${canonical(l)}">`).join("\n")}
  <link rel="alternate" hreflang="x-default" href="${canonical("ko")}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(t.siteName)}">
  <meta property="og:title" content="${esc(t.metaTitle)}">
  <meta property="og:description" content="${esc(t.metaDescription)}">
  <meta property="og:url" content="${canonical(lang)}">
  <meta property="og:image" content="${site.origin}/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(t.siteName)}">
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/favicon.png">
  <link rel="stylesheet" href="/style.css">
  <script src="/filter.js" defer></script>
  <script src="/updates.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">${esc(t.skip)}</a>
  <div class="shell">
    <header class="site-header">
      <a class="brand" href="${base(lang)}"><picture><source media="(prefers-color-scheme: dark)" srcset="/logo-dark.png"><img src="/logo-light.png" width="612" height="344" alt="${esc(t.siteName)}"></picture></a>
      <a class="lang" href="${base(other)}" hreflang="${other}" lang="${other}" aria-label="${esc(t.langSwitchLabel)}">${esc(t.langSwitchText)}</a>
    </header>

    <main id="main">
      <section class="hero">
        <h1>${esc(t.title)}</h1>
        <p class="intro">${esc(t.intro)}</p>
        <figure class="figure hero-figure">
          <img src="/hero.webp" width="1536" height="1024" alt="${esc(t.heroImage)}">
        </figure>
      </section>

      <section class="projects" aria-label="${esc(t.projectsLabel)}">
        <p class="count"><span>${esc(fill(t.summary, { total: listed.length }))}</span>${archived ? ` <small>${esc(fill(t.archiveSummary, { archived }))}</small>` : ""}</p>
        <ul class="filters" aria-label="${esc(t.filterLabel)}" hidden>
        ${filters}
        </ul>
        <ul class="list">
${listed.map((p) => projectRow(p, lang, t)).join("\n")}
        </ul>
      </section>

      <section class="ratcat">
        <figure class="figure">
          <img src="/cat-and-mouse.webp" width="1536" height="1024" alt="${esc(t.catImage)}" loading="lazy">
        </figure>
        <p>${lines(t.ratCat)}</p>
      </section>

      <section class="about" aria-labelledby="about-title">
        <h2 class="section-title" id="about-title">${esc(t.aboutTitle)}</h2>
        <div class="about-card">
          <img class="profile" src="/profile.jpg" width="400" height="400" alt="${esc(t.profileImage)}" loading="lazy">
          <div class="about-text">
            <p class="about-name">${esc(t.aboutName)}</p>
            <p class="about-role">${esc(t.aboutRole)}</p>
            <p>${lines(t.aboutBody)}</p>
            <p class="about-email">${email}</p>
          </div>
        </div>
      </section>

    </main>

    <footer>
      <p>${esc(t.footer)}</p>
    </footer>
  </div>
</body>
</html>
`;
}

function notFound() {
  const blocks = LANGS.map((lang) => {
    const t = messages[lang];
    return `      <section class="notfound" lang="${lang}">
        <h1>${esc(t.notFoundTitle)}</h1>
        <p>${esc(t.notFoundBody)}</p>
        <p><a href="${base(lang)}">${esc(t.notFoundHome)}</a></p>
      </section>`;
  });
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>404 · ${esc(messages.ko.siteName)}</title>
  <meta name="theme-color" content="#0CCCCC">
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/favicon.png">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="shell">
    <main>
${blocks.join("\n")}
    </main>
  </div>
</body>
</html>
`;
}

function sitemap() {
  const urls = LANGS.map(
    (lang) => `  <url>
    <loc>${canonical(lang)}</loc>
${LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${canonical(l)}"/>`).join("\n")}
  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
}

await rm("dist", { recursive: true, force: true });
await cp("src/static", "dist", { recursive: true });
for (const lang of LANGS) {
  const dir = lang === "ko" ? "dist" : `dist/${lang}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, page(lang));
}
await writeFile("dist/404.html", notFound());
await writeFile("dist/sitemap.xml", sitemap());
await writeFile("dist/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`);
console.log(`built: ${listed.length} projects x ${LANGS.length} languages -> dist/`);
