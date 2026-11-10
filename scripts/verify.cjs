const { chromium } = require("playwright");
const assert = require("assert");
const fs = require("fs");
const base = (process.env.BASE_URL || "http://127.0.0.1:4174").replace(/\/$/, "");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  const slugs = [
    "",
    "farmland",
    "basketball",
    "bubble-shot",
    "dino-dash",
    "iron-man",
    "magic-garden",
    "snake",
    "math-master",
    "trex-run",
  ];
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    for (const slug of slugs) {
      await page.goto(base + "/" + (slug ? slug + "/" : ""));
      await page.waitForTimeout(80);
      assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
      assert.equal(await page.locator('meta[name="description"]').count(), 1);
      for (const button of await page.locator('.overlay button').all()) {
        if (await button.isVisible()) {
          const visible = await button.evaluate(el => {
            const a = el.getBoundingClientRect();
            const b = el.closest('.overlay').getBoundingClientRect();
            return a.top >= b.top - 1 && a.bottom <= b.bottom + 1;
          });
          assert(visible, `${slug}: start button clipped at ${width}`);
        }
      }
      const layout = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
      }));
      assert(
        layout.scroll <= layout.width + 1,
        `${slug || "home"} overflows ${width}: ${layout.scroll}`,
      );
      if (slug === "dino-dash" || slug === "iron-man") {
        const ratio = await page.locator("canvas").evaluate((c) => {
          const r = c.getBoundingClientRect();
          return r.width / r.height / (c.width / c.height);
        });
        assert(Math.abs(ratio - 1) < 0.01, `${slug} stretched`);
      }
      if (width === 390 || width === 1440) {
        fs.mkdirSync("artifacts", { recursive: true });
        await page.screenshot({
          path: `artifacts/${slug || "home"}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/");
  await page.getByRole("button", { name: "Sports", exact: true }).click();
  await page.locator("#search").fill("dino");
  assert.equal(await page.locator(".card:visible").count(), 1);
  assert((await page.locator(".card:visible").textContent()).includes("Dino"));
  await page.locator("#search").fill("doesnotexist");
  assert(await page.locator("#empty").isVisible());
  await page.locator("#search").fill("");
  assert.equal(await page.locator(".card:visible").count(), 9);
  await page.goto(base + "/farmland/");
  await page.locator("#plot0").click();
  assert(await page.evaluate(() => farm.plots[0].crop !== null));
  await page.locator('[data-tool="water"]').click();
  await page.locator("#plot0").click();
  assert(await page.evaluate(() => farm.plots[0].crop.watered));
  await page.evaluate(() => (farm.plots[0].crop.end = Date.now() - 1));
  await page.locator("#plot0").click();
  assert.equal(await page.evaluate(() => farm.harvests), 1);
  await page.reload();
  assert.equal(await page.evaluate(() => farm.harvests), 1);
  await page.goto(base + "/dino-dash/");
  await page.locator("#start").click();
  await page.locator("#jump-control").click();
  assert(await page.evaluate(() => dino.vy < 0));
  await page.locator("#pause-control").click();
  assert.equal(await page.evaluate(() => state), "paused");
  await page.locator("#start").click();
  assert.equal(await page.evaluate(() => state), "running");
  await page.goto(base + "/basketball/");
  await page.locator("#play").click();
  await page.locator("#shoot-control").click();
  assert.equal(await page.evaluate(() => attempts), 1);
  await page.locator("#pause-control").click();
  assert.equal(await page.evaluate(() => state), "paused");
  await page.locator("#play").click();
  assert.equal(await page.evaluate(() => state), "playing");
  await page.goto(base + "/bubble-shot/");
  const color = await page.evaluate(() => current);
  await page.locator("#swap-control").click();
  assert.equal(await page.evaluate(() => next), color);
  await page.locator("#fire-control").click();
  await page.waitForTimeout(1200);
  assert(await page.evaluate(() => !shot));
  await page.goto(base + "/iron-man/");
  await page.locator("#start").click();
  await page
    .locator("canvas")
    .dispatchEvent("pointerdown", { clientX: 200, clientY: 330, pointerId: 1 });
  await page.waitForTimeout(200);
  assert(await page.evaluate(() => shots.length > 0));
  await page.locator("#pause").click();
  assert.equal(await page.evaluate(() => state), "paused");
  await page.goto(base + "/magic-garden/");
  const count = await page.evaluate(() => flowers.length);
  await page.locator("canvas").click({ position: { x: 160, y: 300 } });
  assert.equal(await page.evaluate(() => flowers.length), count + 1);
  await page.locator('[data-tool="butterfly"]').click();
  const fliesBefore = await page.evaluate(() => flies.length);
  await page.locator("canvas").click({ position: { x: 180, y: 320 } });
  assert.equal(await page.evaluate(() => flies.length), fliesBefore + 1);
  await page.goto(base + "/snake/");
  let frame = page.frameLocator("iframe");
  await frame.getByRole("button", { name: "Start game", exact: true }).click();
  await frame.getByRole("button", { name: "Move Right", exact: true }).click();
  await frame
    .getByRole("button", { name: "Pause / Resume", exact: true })
    .click();
  assert(
    await frame.getByRole("heading", { name: "Take a breather." }).isVisible(),
  );
  await frame.getByRole("button", { name: "Resume", exact: true }).click();
  await frame.getByRole("button", { name: "New game", exact: true }).click();
  await page.goto(base + "/math-master/");
  frame = page.frameLocator("iframe");
  await frame.getByRole("button", { name: "Start challenge" }).click();
  const text = await frame.locator(".equation").textContent();
  const parts = text.match(/(\d+)\s*([+−×])\s*(\d+)/);
  const a = Number(parts[1]),
    b = Number(parts[3]);
  await frame
    .locator("#answer")
    .fill(String(parts[2] === "+" ? a + b : parts[2] === "−" ? a - b : a * b));
  await frame.getByRole("button", { name: "Check answer" }).click();
  assert.equal(
    await frame.locator(".classic-heading strong").textContent(),
    "1 points",
  );
  await frame.getByRole("button", { name: "Pause", exact: true }).click();
  assert(
    await frame.getByRole("heading", { name: "Your brain break." }).isVisible(),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 50 responsive page checks; search; farm/save/water/harvest; dino jump/pause; basketball shoot/pause; bubbles swap/settle; flight/fire/pause; garden tools; snake start/turn/pause/restart; math answer/score/pause; no browser errors.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
