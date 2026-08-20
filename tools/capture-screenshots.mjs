import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "screenshots");
const BASE = process.env.BASE_URL || "http://127.0.0.1:3456";

const VIEWS = [
  { id: "bag", wait: 600 },
  { id: "maps", wait: 1800 },
  { id: "original", wait: 1800 },
  { id: "vehicles", wait: 900 },
  { id: "drops", wait: 900 },
  { id: "tips", wait: 700 },
  { id: "rank", wait: 900 },
  { id: "ranked", wait: 900 },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle", timeout: 60000 });
await page.evaluate(() => {
  localStorage.setItem("pubg-backpack-lang", "tr");
  localStorage.setItem("pubg-app-view", "bag");
});

for (const { id, wait } of VIEWS) {
  await page.click(`.top-nav [data-view="${id}"]`, { timeout: 15000 });
  await page.waitForFunction(
    (view) => document.body.dataset.view === view && !document.getElementById(`view-${view}`)?.hidden,
    id,
    { timeout: 15000 }
  );
  await page.waitForTimeout(wait);
  const file = join(OUT, `${id}.png`);
  await page.screenshot({ path: file, fullPage: id !== "maps" && id !== "original" });
  console.log("saved", file);
}

await browser.close();
