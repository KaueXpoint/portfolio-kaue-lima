import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'dist');
const output = path.join(root, 'public');
const rawOrigin = process.env.SITE_URL || 'https://kaueink.vercel.app';
const basePath = process.env.SITE_BASE_PATH || '/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(basePath)) throw new Error('SITE_BASE_PATH inválido.');
const origin = new URL(rawOrigin);
if (origin.protocol !== 'https:' || origin.username || origin.password || origin.search || origin.hash)
  throw new Error('SITE_URL deve ser uma URL HTTPS de produção.');
if (!origin.pathname.endsWith('/')) origin.pathname += '/';
const preview = process.env.VERCEL_ENV === 'preview';
const pages = [['', 'WebPage'], ['works/', 'CollectionPage'], ['info/', 'ProfilePage'], ['contact/', 'ContactPage']];
const url = route => new URL(route, origin).href;
const xml = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
// Only the output directory is generated. Source assets always live in dist/.
await rm(output, {recursive: true, force: true});
await cp(source, output, {recursive: true});

const versionedDirectory = path.join(output, 'static');
await mkdir(versionedDirectory, {recursive: true});
const assetUrls = new Map();

async function versionPageAssets(html) {
  const localAssets = /\b(?:href|src)="((?:js\/|styles\/)[^"?]*?\.(?:js|css)|portfolio\.js)(?:\?[^"]*)?"/g;
  const matches = [...html.matchAll(localAssets)];
  for (const [, file] of matches) {
    if (assetUrls.has(file)) continue;
    const bytes = await readFile(path.join(source, file));
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const name = hash + '-' + path.basename(file);
    await writeFile(path.join(versionedDirectory, name), bytes);
    assetUrls.set(file, 'static/' + name);
  }
  return html.replace(localAssets, (attribute, file) =>
    attribute.slice(0, attribute.indexOf('"') + 1) + assetUrls.get(file) + '"');
}

for (const [route, type] of pages) {
  const filename = path.join(output, route, 'index.html');
  let html = await readFile(filename, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const image = url('assets/images/profile/kaue-lima.webp');
  const person = {
    '@type': 'Person', '@id': url('#kaue-lima'), name: 'Kauê Lima', url: url('info/'),
    jobTitle: 'Desenvolvedor de software e web', image, sameAs: ['https://dev011.netlify.app/']
  };
  const graph = [
    {'@type': 'WebSite', '@id': url('#website'), url: origin.href, name: 'Portfólio de Kauê Lima', inLanguage: 'pt-BR', author: {'@id': person['@id']}},
    person,
    {'@type': type, '@id': url(route + '#pagina'), url: url(route), name: title, inLanguage: 'pt-BR',
      isPartOf: {'@id': url('#website')}, ...(type === 'ProfilePage' ? {mainEntity: {'@id': person['@id']}} : {})}
  ];
  // Some CDN caches can still serve HTML for the former production hostname.
  const canonicalScript = JSON.stringify(url(route));
  const legacyRedirect = '<script>if(location.hostname==="portfolio-kaue-lima.vercel.app")' +
    '{location.replace(' + canonicalScript + '+location.search+location.hash)}</script>';
  const meta = [
    ...(origin.hostname === 'kaueink.vercel.app' ? [legacyRedirect] : []),
    '<link rel="canonical" href="' + xml(url(route)) + '">',
    '<meta property="og:url" content="' + xml(url(route)) + '">',
    '<meta property="og:image" content="' + xml(image) + '">',
    '<meta property="og:image:alt" content="Retrato de Kauê Lima">',
    '<script type="application/ld+json">' + JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replaceAll('<', '\\u003c') + '</script>'
  ];
  html = html.replace(/<!-- production-metadata -->[\s\S]*?<!-- end-metadata -->/,
    '<!-- production-metadata -->\n  ' + meta.join('\n  ') + '\n  <!-- end-metadata -->');
  html = html.replace('<base href="/">', '<base href="' + basePath + '">');
  if (preview) html = html.replace('index,follow,max-image-preview:large','noindex,follow');
  await writeFile(filename, await versionPageAssets(html));
}
const locs = pages.map(([route]) => '  <url><loc>' + xml(url(route)) + '</loc></url>');
await writeFile(path.join(output, 'sitemap.xml'),
  ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...locs,'</urlset>', ''].join('\n'));
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + url('sitemap.xml') + '\n');
