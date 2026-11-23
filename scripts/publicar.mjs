import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'dist');
const output = path.join(root, 'public');
const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const rawOrigin = process.env.SITE_URL || (deploymentHost && 'https://' + deploymentHost) || 'https://portfolio-kaue-lima.vercel.app';
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
await mkdir(output, {recursive: true});
await cp(source, output, {recursive: true});

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
  const meta = [
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
  await writeFile(filename, html);
}
const locs = pages.map(([route]) => '  <url><loc>' + xml(url(route)) + '</loc></url>');
await writeFile(path.join(output, 'sitemap.xml'),
  ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...locs,'</urlset>', ''].join('\n'));
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + url('sitemap.xml') + '\n');
