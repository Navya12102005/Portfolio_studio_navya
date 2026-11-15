/* export.mjs — frame-perfect export. Usage:
     node export.mjs [width=3840] [height=2160] [fps=30] [seconds=44] [outDir=./out]
   Renders window.renderFrame(t) for t = 0..seconds in 1/fps steps in headless Chromium, then encodes with ffmpeg:
     navya_intro_<h>p.mp4 (H.264, crf 14), plus a 1080p H.264 and a looping WebM when exporting at 4K. */
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // works for local or global installs
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const [W = 3840, H = 2160, FPS = 30, SECONDS = 44, OUT = "./out"] = process.argv.slice(2).map((v, i) => (i < 4 ? Number(v) : v));
const here = path.dirname(fileURLToPath(import.meta.url));
const frames = path.resolve(OUT, "frames");
rmSync(frames, { recursive: true, force: true }); mkdirSync(frames, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--headless=new"] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto("file://" + path.join(here, "index.html") + "?still");
await page.waitForFunction(() => window.__ready === true);
await page.evaluate(([w, h]) => window.setRenderSize(w, h), [W, H]);

const total = Math.round(SECONDS * FPS), t0 = Date.now();
for (let i = 0; i < total; i++) {
  const b64 = await page.evaluate((t) => { window.renderFrame(t); return document.getElementById("stage").toDataURL("image/png").split(",")[1]; }, i / FPS);
  writeFileSync(path.join(frames, `f_${String(i).padStart(5, "0")}.png`), Buffer.from(b64, "base64"));
  if (i % 30 === 0) console.log(`frame ${i}/${total}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
await browser.close();

const name = `navya_intro_${H}p`;
const enc = ["-y", "-framerate", String(FPS), "-i", path.join(frames, "f_%05d.png")];
execFileSync("ffmpeg", [...enc, "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.resolve(OUT, `${name}.mp4`)], { stdio: "inherit" });
if (H > 1080) execFileSync("ffmpeg", [...enc, "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.resolve(OUT, "navya_intro_1080p.mp4")], { stdio: "inherit" });
execFileSync("ffmpeg", [...enc, "-vf", "scale=1920:-2", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "32", "-an", path.resolve(OUT, "navya_intro_loop.webm")], { stdio: "inherit" });
console.log("done ->", path.resolve(OUT));
