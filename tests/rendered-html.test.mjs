import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("server-renders the game shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Cyber Crime: Find the Intruder<\/title>/i);
  assert.match(html, /<iframe[^>]+src="\/game\.html"/i);
  assert.doesNotMatch(html, /codex-preview|loading skeleton/i);
});

test("ships one complete offline game file", async () => {
  const [standalone, hostedCopy] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../public/game.html", import.meta.url), "utf8"),
  ]);

  assert.equal(hostedCopy, standalone);
  assert.match(standalone, /<style>[\s\S]+<\/style>/i);
  assert.match(standalone, /<script>[\s\S]+<\/script>/i);
  assert.doesNotMatch(standalone, /(?:src|href)=["']https?:/i);
  assert.equal(
    (standalone.match(/id:'(?:aram|dara|ronak|shiler)'/g) ?? []).length,
    4,
  );
  assert.match(standalone, /secondsLeft = 180/);
  assert.match(
    standalone,
    /selectedWho === 'dara' && selectedWhen === '08:43'/,
  );
  assert.match(standalone, /prefers-reduced-motion/);
  assert.match(standalone, /aria-live=/);
});
