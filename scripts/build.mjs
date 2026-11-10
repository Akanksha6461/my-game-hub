import { mkdir, readFile, writeFile, copyFile, unlink } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const games = [
  ['snake', 'Retro Snake', 'Eat apples, grow your snake and avoid walls. Play with touch buttons or arrow keys.'],
  ['math-master', 'Math Master', 'Solve fast arithmetic puzzles in a timed maths challenge.'],
  ['trex-run', 'T-Rex Run', 'The classic T-Rex running game. Tap to jump over cacti.'],
  ['farmland', 'Little Farmland', 'Plant wheat, carrots and corn, water crops, harvest for coins and unlock more farmland.'],
  ['basketball', 'Hoop Club Basketball', 'Aim and shoot baskets in a 60-second basketball challenge. Play with touch or keyboard.'],
  ['bubble-shot', 'Bubble Shot', 'Match three bubbles, bounce shots off walls and clear the board in this colorful bubble shooter.'],
  ['dino-dash', 'Dino Dash', 'Jump over cacti and chase a high score in this endless dinosaur runner.'],
  ['iron-man', 'Iron Man Sky Defense', 'A fan-made flying action game. Defend the city from drones with touch or keyboard controls.'],
  ['magic-garden', 'My Little Magic Garden', 'Create flowers, butterflies, sparkles and rainbows in a relaxing interactive garden.']
];
let domain = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'my-game-hub-brown.vercel.app';
let origin;
if (domain) {
  const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('SITE_URL must be a public HTTP(S) URL.');
  if(url.pathname!=='/'||url.search||url.hash)throw new Error('SITE_URL must be an origin.');
  origin = url.origin;
}
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const pages = [['', 'Abhinav Akanksha Games', 'Play nine free browser games on your phone or computer.'], ...games];
await mkdir(path.join(root, 'dist'), { recursive: true });
await copyFile(path.join(root, 'favicon.svg'), path.join(root, 'dist/favicon.svg'));
for (const [slug, name, description] of pages) {
  const relative = slug ? `${slug}/index.html` : 'index.html';
  let html = await readFile(path.join(root, slug ? relative : 'hub.html'), 'utf8');
  if (slug) {
    html = html.replace(/<title>.*?<\/title>/s, `<title>${escape(name)} | Abhinav Akanksha Games</title>`);
    html = html.replace('</head>', `<meta property="og:type" content="website"><meta property="og:site_name" content="Abhinav Akanksha Games"><meta property="og:title" content="${escape(name)}"><meta property="og:description" content="${escape(description)}"><meta name="twitter:card" content="summary"><meta name="description" content="${escape(description)}"><meta name="robots" content="index,follow"><link rel="icon" href="../favicon.svg" type="image/svg+xml"></head>`);
  }
  if (origin) {
    const url = `${origin}/${slug ? slug + '/' : ''}`;
    const schema = slug ? {
      '@context': 'https://schema.org', '@type': 'VideoGame', name,
      url, description, applicationCategory: 'Game', operatingSystem: 'Web browser',
      isAccessibleForFree: true, inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', name: 'Abhinav Akanksha Games', url: origin + '/' }
    } : {
      '@context': 'https://schema.org', '@graph': [
        { '@type': 'WebSite', '@id': origin + '/#website', url, name: 'Abhinav Akanksha Games', alternateName: 'Abhinav Akanksha Game Hub', inLanguage: 'en' },
        { '@type': 'CollectionPage', url, name: 'Abhinav Akanksha Games — All Games', mainEntity: {
          '@type': 'ItemList', itemListElement: games.map(([game, title], i) => ({ '@type': 'ListItem', position: i + 1, name: title, url: `${origin}/${game}/` }))
        } }
      ]
    };
    html = html.replace('</head>', `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}"><script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script></head>`);
  }
  await mkdir(path.dirname(path.join(root, 'dist', relative)), { recursive: true });
  await writeFile(path.join(root, 'dist', relative), html);
}
await writeFile(path.join(root, 'dist/robots.txt'), `User-agent: *\nAllow: /\n${origin ? '\nSitemap: ' + origin + '/sitemap.xml\n' : ''}`);
if (origin) {
  const entries = pages.map(([slug]) => `<url><loc>${escape(origin)}/${slug ? slug + '/' : ''}</loc></url>`).join('\n');
  await writeFile(path.join(root, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
} else {
  await unlink(path.join(root, 'dist/sitemap.xml')).catch(error => { if (error.code !== 'ENOENT') throw error; });
  console.log('Local build: no public domain configured; canonical URLs and sitemap will be generated during Vercel deployment.');
}
console.log(`Built homepage and ${games.length} games${origin ? ' for ' + origin : ''}.`);
