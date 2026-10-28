import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { CATEGORIES, LANGS, STATUSES, loadContent } from "./content.mjs";

const { site, projects, messages } = await loadContent();

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key]);

const base = (lang) => (lang === "ko" ? "/" : `/${lang}/`);
const canonical = (lang) => `${site.origin}${base(lang)}`;
const otherLang = (lang) => LANGS.find((l) => l !== lang);

const listed = projects
  .filter((p) => p.listed)
  .map((p, index) => ({ ...p, index }))
  .sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || a.index - b.index);

function projectRow(project, lang, t) {
  const name = lang === "en" && project.nameEn ? project.nameEn : project.name;
  const links = [];
  if (project.url) links.push(`<li><a href="${esc(project.url)}" rel="noopener">${esc(t.open)} ↗</a></li>`);
  if (project.repo) links.push(`<li><a href="${esc(project.repo)}" rel="noopener">${esc(t.repo)} ↗</a></li>`);
  return `        <li class="project" data-category="${project.category}">
          <div>
            <h3 class="p-name">${esc(name)}</h3>
            <p class="p-meta"><span class="status" data-status="${project.status}">${esc(t.status[project.status])}</span><span>${esc(t.categories[project.category])}</span><span>${esc(t.visibility[project.visibility])}</span></p>
          </div>
          <p class="p-sum">${esc(project.summary[lang])}</p>
          <ul class="p-links">${links.join("")}</ul>
        </li>`;
}

function page(lang) {
  const t = messages[lang];
  const other = otherLang(lang);
  const usedCategories = CATEGORIES.filter((c) => listed.some((p) => p.category === c));
  const available = listed.filter((p) => p.status === "available").length;
  const filters = [
    `<li><button type="button" data-filter="all" aria-pressed="true">${esc(t.filterAll)}</button></li>`,
    ...usedCategories.map(
      (c) => `<li><button type="button" data-filter="${c}" aria-pressed="false">${esc(t.categories[c])}</button></li>`,
    ),
  ].join("\n        ");
  const contact = [
    `<li><a href="${esc(site.github)}" rel="noopener">${esc(t.contactGithub)} ↗</a></li>`,
    site.email ? `<li><a href="mailto:${esc(site.email)}">${esc(t.contactEmail)}: ${esc(site.email)}</a></li>` : "",
  ].join("");

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(t.metaTitle)}</title>
  <meta name="description" content="${esc(t.metaDescription)}">
  <meta name="color-scheme" content="light dark">
  <link rel="canonical" href="${canonical(lang)}">
${LANGS.map((l) => `  <link rel="alternate" hreflang="${l}" href="${canonical(l)}">`).join("\n")}
  <link rel="alternate" hreflang="x-default" href="${canonical("ko")}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(t.siteName)}">
  <meta property="og:title" content="${esc(t.metaTitle)}">
  <meta property="og:description" content="${esc(t.metaDescription)}">
  <meta property="og:url" content="${canonical(lang)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/style.css">
  <script src="/filter.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">${esc(t.skip)}</a>
  <div class="shell">
    <header class="site-header">
      <a class="brand" href="${base(lang)}">${esc(t.siteName)}</a>
      <a class="lang" href="${base(other)}" hreflang="${other}" lang="${other}" aria-label="${esc(t.langSwitchLabel)}">${esc(t.langSwitchText)}</a>
    </header>

    <main id="main">
      <section class="hero">
        <h1>${esc(t.title)}</h1>
        <p class="intro">${esc(t.intro)}</p>
        <p class="count">${esc(fill(t.summary, { total: listed.length, available }))}</p>
      </section>

      <section class="projects" aria-labelledby="projects-title">
        <h2 class="section-title" id="projects-title">${esc(t.projectsTitle)}</h2>
        <ul class="filters" aria-label="${esc(t.filterLabel)}" hidden>
        ${filters}
        </ul>
        <p class="legend">${esc(t.legend)}</p>
        <p class="shown" aria-live="polite" data-template="${esc(t.countShown)}"></p>
        <ul class="list">
${listed.map((p) => projectRow(p, lang, t)).join("\n")}
        </ul>
      </section>

      <section class="about" aria-labelledby="about-title">
        <h2 class="section-title" id="about-title">${esc(t.aboutTitle)}</h2>
${t.aboutBody.map((paragraph) => `        <p>${esc(paragraph)}</p>`).join("\n")}
      </section>

      <section class="contact" aria-labelledby="contact-title">
        <h2 class="section-title" id="contact-title">${esc(t.contactTitle)}</h2>
        <p>${esc(t.contactBody)}</p>
        <ul>${contact}</ul>
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
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
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
