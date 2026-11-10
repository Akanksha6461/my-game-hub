# Abhinav Akanksha Games

Production: https://my-game-hub-brown.vercel.app/

Ten games on one mobile-friendly homepage: Little Farmland, Hoop Club Basketball, Bubble Shot, Dino Dash, Iron Man Sky Defense, Magic Garden, Retro Snake, Math Master T-Rex Run and Metro Rush.

Run `npm ci` then `npm run build`. Vite preserves the original React games at `/classic-games/`; `scripts/build.mjs` adds the static homepage and individual game pages into `dist/`. Vercel uses the checked-in `vercel.json`. The deployable output contains no repository credentials or private configuration.

The homepage source is `hub.html`. The original Vite `index.html` remains as historical source; the configured Vite entry is `classic-games/index.html`.

The build generates each game's title, description, canonical URL, structured data, `robots.txt` and a eleven-page `sitemap.xml`. `SITE_URL` can override the origin when moving to a verified custom domain. Otherwise Vercel's production domain is used, with the verified current public domain as fallback.

After deployment, verify the production property in Google Search Console, submit `https://my-game-hub-brown.vercel.app/sitemap.xml`, and request homepage indexing. Google controls indexing, ranking and search appearance; first place and an immediate listing are not guaranteed.

Progress saves are local to each browser and website origin. The Iron Man game is fan-made.

## Browser verification

Run `npm run build`, then `npm run preview:static` in one terminal. In another, run `npx playwright install chromium` once and `npm run test:browser`. This checks all ten pages at 320, 375, 390, 768 and 1440 pixels, verifies gameplay controls and farm saves, and writes screenshots to ignored `artifacts/`.

The updated mobile controls include basketball aim/power/shoot, bubble aiming/swap/shoot, dinosaur jump/pause, and Snake direction/pause/restart. Math Master accepts a full answer on submit and pauses when hidden.

## Metro Rush

An original sunset-city runner at `/metro-rush/`. Swipe left/right to change lanes, up to jump, and down to slide. Touch buttons and arrow/WASD keys also work; Space jumps and P pauses. Dodge trains, jump barriers, slide under signs and collect coins. Best distance saves locally. Obstacle rows always preserve an open lane.

With the static preview running, `npm run test:runner` verifies gameplay, collisions, touch input, responsive layouts, saved best and safe obstacle patterns. Set `BASE_URL` to run either browser suite against production.
