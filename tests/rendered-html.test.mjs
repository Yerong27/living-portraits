import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Living Portraits stage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Living Portraits/);
  assert.match(html, /Living Portraits with Emily Dickinson/);
  assert.match(html, />展示页</);
  assert.match(html, />悬浮宠物</);
  assert.match(html, />中文释义</);
  assert.match(html, /Would you like a line\?/);
  assert.match(html, /emily-spritesheet\.webp/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /再听一句/);
  assert.doesNotMatch(html, /codex-preview/);
});

test("ships a configurable and draggable floating portrait", async () => {
  const [portrait, motion, floating, page, readme, rights] = await Promise.all([
    readFile(new URL("../app/portrait.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/portrait-motion.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/FloatingPortrait.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../RIGHTS.md", import.meta.url), "utf8"),
  ]);

  assert.match(portrait, /chineseOutput:\s*true/);
  assert.match(portrait, /id:\s*"emily-dickinson"/);
  assert.match(portrait, /characterBasis:\s*"historical-person"/);
  assert.match(portrait, /translationSource:/);
  assert.match(portrait, /responses:\s*\[/);
  assert.equal((portrait.match(/^ {6}kind:\s*"quotation"/gm) ?? []).length, 10);
  assert.match(motion, /runningRight:\s*\{ row: 1, frames: 8/);
  assert.match(motion, /runningLeft:\s*\{ row: 2, frames: 8/);
  assert.match(floating, /Math\.hypot\(rawX, rawY\) > 6/);
  assert.match(floating, /stepX > 1\) setOverrideMotion\("runningRight"\)/);
  assert.match(floating, /stepX < -1\) setOverrideMotion\("runningLeft"\)/);
  assert.match(floating, /motion=\{overrideMotion \?\? motion\}/);
  assert.match(floating, /setPointerCapture/);
  assert.match(floating, /localStorage\.setItem/);
  assert.match(floating, /event\.detail === 0/);
  assert.match(floating, /onContextMenu/);
  assert.match(floating, /holdTimer/);
  assert.match(floating, /collapsedStorageKey/);
  assert.match(floating, /floating-restore/);
  assert.match(floating, /querySelector<HTMLElement>\("\.pet-sprite"\)/);
  assert.match(floating, /className="floating-figure"/);
  assert.match(floating, /arrowleft:\s*\{ x: -1, y: 0 \}/);
  assert.match(floating, /const distance = event\.shiftKey \? 28 : 12/);
  assert.match(floating, /onKeyUp=\{onKeyUp\}/);
  assert.match(floating, /keyboardKeys\.current\.size === 0/);
  assert.match(page, /<FloatingPortrait/);
  assert.match(page, /setChineseOutput/);
  assert.match(page, /arrow keys or WASD/);
  assert.doesNotMatch(page, /再听一句/);
  assert.match(readme, /chineseOutput: true/);
  assert.match(readme, /Floating companion/);
  assert.match(readme, /Interactive character companions/);
  assert.match(rights, /Current record: Emily Dickinson/);
  assert.match(rights, /public-domain book character depicted like a later film adaptation/);

  await access(new URL("../public/emily-spritesheet.webp", import.meta.url));
  await access(new URL("../public/og.png", import.meta.url));
});
