const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = (process.env.BASE_URL || 'http://127.0.0.1:4174').replace(/\/$/, '');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const [width, height] of [[320,640],[390,844],[768,1024],[1440,900],[844,390]]) {
    await page.setViewportSize({width,height});
    await page.goto(base + '/metro-rush/');
    assert.equal(await page.title(), 'Metro Rush | Abhinav Akanksha Games');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const start = await page.locator('#start').boundingBox();
    const overlay = await page.locator('#overlay').boundingBox();
    assert(start.y >= overlay.y && start.y + start.height <= overlay.y + overlay.height, 'Start button is clipped');
    await page.locator('#start').click();
    await page.waitForTimeout(160);
    assert(!(await page.locator('#overlay').isVisible()));
    await page.locator('#pause').click();
    assert(await page.locator('#overlay').isVisible());
  }
  await page.goto(base + '/');
  await page.locator('#search').fill('subway surfers');
  assert.equal(await page.locator('.card:visible').count(),1);
  assert.equal(await page.locator('.card:visible h3').textContent(),'Metro Rush');
  const sitemap = await (await page.request.get(base + '/sitemap.xml')).text();
  assert(sitemap.includes('/metro-rush/'));
  assert.equal([...sitemap.matchAll(/<loc>/g)].length,11);

  // Add controllable frames and a fixture interface only to this intercepted test response.
  // Production code and the delivered game do not contain any test hooks.
  await page.addInitScript(() => {
    window.__time = 0;
    window.requestAnimationFrame = fn => { window.__frame = fn; return 1; };
  });
  await page.route('**/metro-rush/game.js', async route => {
    const response = await route.fetch();
    let source = await response.text();
    const at = source.lastIndexOf('})();');
    assert(at > 0);
    source = source.slice(0,at) + `window.__runner = {
      read:()=>({state,lane,visualLane,jump,slide,distance,coins,speed}),
      scene:(items)=>{objects=items;spawn=999;},
      generate:()=>{objects=[];row(120);return objects;}
    };` + source.slice(at);
    await route.fulfill({response,body:source});
  });
  await page.setViewportSize({width:390,height:844});
  await page.goto(base + '/metro-rush/');
  const advance = seconds => page.evaluate(seconds => {
    for(let i=0;i<Math.ceil(seconds*60);i++) { window.__time += 1000/60; window.__frame(window.__time); }
  },seconds);
  const read = () => page.evaluate(() => window.__runner.read());
  const scene = (type,z=4,lane=0) => page.evaluate(({type,z,lane}) => window.__runner.scene([{type,z,lane,done:false}]),{type,z,lane});
  const start = async () => { await page.locator('#start').click(); await page.evaluate(() => window.__runner.scene([])); };
  await start(); await advance(1);
  assert((await read()).distance > 20);
  await page.locator('#pause').click();const paused=(await read()).distance;await advance(2);assert.equal((await read()).distance,paused);
  await page.locator('#start').click();await advance(.2);assert((await read()).distance>paused);
  await page.keyboard.press('ArrowLeft');await advance(.2);assert.equal((await read()).lane,-1);
  await page.keyboard.press('ArrowLeft');assert.equal((await read()).lane,-1);
  await page.locator('[data-action="right"]').click();await advance(.2);assert.equal((await read()).lane,0);
  await scene('coin');await advance(.25);assert.equal((await read()).coins,1);
  await scene('barrier',7);await page.locator('[data-action="jump"]').click();await advance(.55);assert.equal((await read()).state,'running');assert((await read()).jump>0);await advance(.5);assert.equal((await read()).jump,0);
  await scene('sign');await page.locator('[data-action="slide"]').click();await advance(.3);assert.equal((await read()).state,'running');assert((await read()).slide>0);await advance(1);assert.equal((await read()).slide,0);
  await scene('train');await advance(.3);assert.equal((await read()).state,'over');assert(await page.locator('#overlay').isVisible());
  const best=Number(await page.locator('#best').textContent());assert(best>0);
  await start();assert.equal((await read()).distance,0);assert.equal((await read()).coins,0);
  await scene('barrier');await advance(.3);assert.equal((await read()).state,'over');
  await start();await scene('sign');await advance(.3);assert.equal((await read()).state,'over');
  await start();await scene('train',8);await page.locator('[data-action="left"]').click();await advance(.5);assert.equal((await read()).state,'running');
  const bounds=await page.locator('canvas').boundingBox();
  await page.mouse.move(bounds.x+100,bounds.y+200);
  await page.mouse.down();
  await page.mouse.move(bounds.x+170,bounds.y+200,{steps:5});
  await page.mouse.up();
  assert.equal((await read()).lane,0);
  for(let i=0;i<60;i++) {
    const row=await page.evaluate(() => window.__runner.generate());
    const blocked=new Set(row.filter(o=>o.type!=='coin').map(o=>o.lane));
    assert(blocked.size<3,'An obstacle row blocks every lane');
    assert(row.filter(o=>o.type==='coin').every(o=>!blocked.has(o.lane)));
  }
  await page.evaluate(() => window.__runner.scene([]));await advance(.2);
  fs.mkdirSync('artifacts',{recursive:true});await page.screenshot({path:'artifacts/metro-rush-tested.png',fullPage:true});
  await page.reload();assert(Number(await page.locator('#best').textContent())>=best);
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS: runner layouts, search/sitemap, movement/swipe, lane bounds, jump, slide, coins, train/barrier/sign collisions, dodge, pause/resume, restart, saved best and 60 safe obstacle patterns.');
})().catch(e=>{console.error(e);process.exit(1)});
