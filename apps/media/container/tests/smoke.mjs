import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { Readable } from "node:stream";

import { fixedSizeParts } from "/worker/src/parts.mjs";

const splitSource = Buffer.from("abcdefghijklmnopqrstuvwxyz0123456789");
const splitParts = [];
for await (const part of fixedSizeParts(
  Readable.from([splitSource.subarray(0, 7), splitSource.subarray(7, 29), splitSource.subarray(29)]),
  16,
)) {
  splitParts.push(part);
}
assert.deepEqual(splitParts.map((part) => part.length), [16, 16, 4]);
assert.deepEqual(Buffer.concat(splitParts), splitSource);

function fixture(kind) {
  const args =
    kind === "photo"
      ? [
          "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=320x180",
          "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "pipe:1",
        ]
      : [
          "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=12",
          "-f", "lavfi", "-i", "sine=frequency=440", "-t", "0.5",
          "-c:v", "libx264", "-c:a", "aac",
          "-movflags", "frag_keyframe+empty_moov+default_base_moof",
          "-f", "mp4", "pipe:1",
        ];
  const result = spawnSync("ffmpeg", args, { maxBuffer: 20 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr.toString());
  return result.stdout;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

const state = {
  kind: "photo",
  source: Buffer.alloc(0),
  display: Buffer.alloc(0),
  displayParts: new Map(),
  preview: Buffer.alloc(0),
  callback: null,
};

const server = createServer(async (request, response) => {
  const origin = `http://127.0.0.1:${server.address().port}`;
  if (request.method === "POST" && request.url === "/config") {
    response.setHeader("content-type", "application/json");
    response.end(
      JSON.stringify({
        kind: state.kind,
        sourceUrl: `${origin}/source`,
        displayUpload: {
          uploadId: "display-upload",
          verificationUrl: `${origin}/display`,
          contentType: state.kind === "photo" ? "image/webp" : "video/mp4",
        },
        previewUpload: { url: `${origin}/preview`, contentType: "image/webp" },
      }),
    );
    return;
  }
  if (request.method === "POST" && request.url === "/multipart") {
    const body = JSON.parse((await readBody(request)).toString("utf8"));
    assert.equal(body.uploadId, "display-upload");

    if (body.action === "part") {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ uploadUrl: `${origin}/display-part/${body.partNumber}` }));
      return;
    }
    if (body.action === "complete") {
      assert.deepEqual(
        body.parts.map((part) => part.partNumber),
        Array.from(state.displayParts.keys()),
      );
      state.display = Buffer.concat(Array.from(state.displayParts.values()));
      response.setHeader("content-type", "application/json");
      response.end('{"completed":true}');
      return;
    }
    if (body.action === "abort") {
      state.displayParts.clear();
      response.setHeader("content-type", "application/json");
      response.end('{"aborted":true}');
      return;
    }
  }
  if (request.method === "POST" && request.url === "/callback") {
    state.callback = JSON.parse((await readBody(request)).toString("utf8"));
    response.setHeader("content-type", "application/json");
    response.end('{"ok":true}');
    return;
  }
  if (request.method === "PUT" && request.url.startsWith("/display-part/")) {
    const partNumber = Number(request.url.slice("/display-part/".length));
    const body = await readBody(request);
    assert.equal(Number(request.headers["content-length"]), body.length);
    assert.equal(request.headers["transfer-encoding"], undefined);
    state.displayParts.set(partNumber, body);
    response.setHeader("etag", `"part-${partNumber}"`);
    response.statusCode = 200;
    response.end();
    return;
  }
  if (request.method === "PUT" && request.url === "/preview") {
    const body = await readBody(request);
    assert.equal(Number(request.headers["content-length"]), body.length);
    assert.equal(request.headers["transfer-encoding"], undefined);
    state.preview = body;
    response.statusCode = 200;
    response.end();
    return;
  }
  if (request.method === "GET" && ["/source", "/display", "/preview"].includes(request.url)) {
    const body = state[request.url.slice(1)];
    response.setHeader("content-length", body.length);
    response.end(body);
    return;
  }
  response.statusCode = 404;
  response.end();
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

try {
  for (const kind of ["photo", "video"]) {
    state.kind = kind;
    state.source = fixture(kind);
    state.display = Buffer.alloc(0);
    state.displayParts = new Map();
    state.preview = Buffer.alloc(0);
    state.callback = null;

    const exitCode = await new Promise((resolve, reject) => {
      const child = spawn("node", ["/worker/src/index.mjs"], {
        env: {
          ...process.env,
          MEDIA_JOB_TOKEN: `smoke-${kind}`,
          MEDIA_PROCESSING_API_URL: `http://127.0.0.1:${server.address().port}`,
        },
        stdio: "inherit",
      });
      child.on("error", reject);
      child.on("close", resolve);
    });

    assert.equal(exitCode, 0);
    assert.equal(state.callback?.status, "succeeded");
    assert.equal(state.callback?.width, 320);
    assert.equal(state.callback?.height, 180);
    assert.ok(state.display.length > 0);
    assert.ok(state.preview.length > 0);
    assert.equal(state.preview.subarray(0, 4).toString("ascii"), "RIFF");
    if (kind === "photo") {
      assert.equal(state.display.subarray(0, 4).toString("ascii"), "RIFF");
    } else {
      assert.ok(state.display.subarray(0, 64).includes(Buffer.from("ftyp")));
    }
  }
  console.log("Photo and video worker smoke tests passed.");
} finally {
  server.close();
}
