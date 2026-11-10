# Abhinav Akanksha Games

Production: https://my-game-hub-brown.vercel.app/

Nine games on one mobile-friendly homepage: Little Farmland, Hoop Club Basketball, Bubble Shot, Dino Dash, Iron Man Sky Defense, Magic Garden, Retro Snake, Math Master and T-Rex Run.

Run `npm ci` then `npm run build`. Vite preserves the original React games at `/classic-games/`; `scripts/build.mjs` adds the static homepage and individual game pages into `dist/`. Vercel uses the checked-in `vercel.json`. The deployable output contains no repository credentials or private configuration.

The homepage source is `hub.html`. The original Vite `index.html` remains as historical source; the configured Vite entry is `classic-games/index.html`.

The build generates each game's title, description, canonical URL, structured data, `robots.txt` and a ten-page `sitemap.xml`. `SITE_URL` can override the origin when moving to a verified custom domain. Otherwise Vercel's production domain is used, with the verified current public domain as fallback.

After deployment, verify the production property in Google Search Console, submit `https://my-game-hub-brown.vercel.app/sitemap.xml`, and request homepage indexing. Google controls indexing, ranking and search appearance; first place and an immediate listing are not guaranteed.

Progress saves are local to each browser and website origin. The Iron Man game is fan-made.
