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
  const [portrait, floating, page, readme] = await Promise.all([
    readFile(new URL("../app/portrait.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/FloatingPortrait.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(portrait, /chineseOutput:\s*true/);
  assert.match(floating, /Math\.hypot\(rawX, rawY\) > 6/);
  assert.match(floating, /setPointerCapture/);
  assert.match(floating, /localStorage\.setItem/);
  assert.match(floating, /event\.detail === 0/);
  assert.match(page, /<FloatingPortrait/);
  assert.match(page, /setChineseOutput/);
  assert.doesNotMatch(page, /再听一句/);
  assert.match(readme, /chineseOutput: true/);
  assert.match(readme, /Floating companion/);

  await access(new URL("../public/emily-spritesheet.webp", import.meta.url));
  await access(new URL("../public/og.png", import.meta.url));
});
