import { spawn } from "node:child_process";

import { fixedSizeParts } from "./parts.mjs";

const token = process.env.MEDIA_JOB_TOKEN;
const apiUrl = process.env.MEDIA_PROCESSING_API_URL?.replace(/\/$/, "");

if (!token || !apiUrl) {
  throw new Error("MEDIA_JOB_TOKEN and MEDIA_PROCESSING_API_URL are required.");
}

const authorization = { authorization: `Bearer ${token}` };

function collectProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdout));
        return;
      }
      reject(
        new Error(
          `${command} exited with ${code}: ${Buffer.concat(stderr).toString("utf8").slice(-4000)}`,
        ),
      );
    });
  });
}

async function probe(url) {
  const output = await collectProcess("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_type,width,height,duration,color_transfer,color_primaries,color_space:format=duration",
    "-of",
    "json",
    url,
  ]);
  return JSON.parse(output.toString("utf8"));
}

async function uploadSingleOutput(args, upload) {
  const output = await collectProcess("ffmpeg", args);
  const response = await fetch(upload.url, {
    method: "PUT",
    headers: {
      "content-length": String(output.length),
      "content-type": upload.contentType,
    },
    body: output,
  });
  if (!response.ok) throw new Error(`R2 upload failed with ${response.status}.`);
}

async function multipartRequest(body) {
  const response = await fetch(`${apiUrl}/multipart`, {
    method: "POST",
    headers: { ...authorization, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Multipart ${body.action} failed with ${response.status}.`);
  return response.json();
}

async function uploadMultipartPart(uploadId, partNumber, body) {
  const { uploadUrl } = await multipartRequest({ action: "part", uploadId, partNumber });
  if (typeof uploadUrl !== "string") throw new Error("Multipart part URL is invalid.");

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "content-length": String(body.length) },
    body,
  });
  if (!response.ok) throw new Error(`R2 multipart upload failed with ${response.status}.`);

  const eTag = response.headers.get("etag");
  if (!eTag) throw new Error("R2 multipart upload did not return an ETag.");
  return { eTag, partNumber };
}

async function transcodeAndUploadMultipart(args, upload) {
  const child = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
  const stderr = [];
  child.stderr.on("data", (chunk) => stderr.push(chunk));

  const exitPromise = new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(`ffmpeg exited with ${code}: ${Buffer.concat(stderr).toString("utf8").slice(-4000)}`),
      );
    });
  });
  exitPromise.catch(() => undefined);

  try {
    const parts = [];
    for await (const part of fixedSizeParts(child.stdout)) {
      parts.push(await uploadMultipartPart(upload.uploadId, parts.length + 1, part));
    }
    await exitPromise;
    if (parts.length === 0) throw new Error("Multipart output is empty.");
    await multipartRequest({ action: "complete", uploadId: upload.uploadId, parts });
  } catch (error) {
    child.kill("SIGTERM");
    await exitPromise.catch(() => undefined);
    try {
      await multipartRequest({ action: "abort", uploadId: upload.uploadId });
    } catch (abortError) {
      console.error(abortError);
    }
    throw error;
  }
}

function sourceVideo(probeResult) {
  return probeResult.streams?.find((stream) => stream.codec_type === "video");
}

function isHdr(stream) {
  return (
    stream?.color_transfer === "smpte2084" ||
    stream?.color_transfer === "arib-std-b67" ||
    stream?.color_primaries === "bt2020"
  );
}

function videoFilter(stream) {
  if (!isHdr(stream)) return "scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p";
  return [
    "zscale=t=linear:npl=100",
    "format=gbrpf32le",
    "zscale=p=bt709",
    "tonemap=tonemap=hable:desat=0",
    "zscale=t=bt709:m=bt709:r=tv",
    "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "format=yuv420p",
  ].join(",");
}

async function uploadPhoto(config) {
  await transcodeAndUploadMultipart(
    [
      "-v", "error", "-i", config.sourceUrl,
      "-map_metadata", "-1", "-frames:v", "1",
      "-c:v", "libwebp", "-quality", "88", "-compression_level", "6",
      "-f", "image2pipe", "pipe:1",
    ],
    config.displayUpload,
  );
  await uploadSingleOutput(
    [
      "-v", "error", "-i", config.sourceUrl,
      "-map_metadata", "-1", "-frames:v", "1",
      "-vf", "scale=720:720:force_original_aspect_ratio=decrease",
      "-c:v", "libwebp", "-quality", "82", "-compression_level", "6",
      "-f", "image2pipe", "pipe:1",
    ],
    config.previewUpload,
  );
}

async function uploadVideo(config, inputProbe) {
  const filter = videoFilter(sourceVideo(inputProbe));
  await transcodeAndUploadMultipart(
    [
      "-v", "error", "-i", config.sourceUrl,
      "-map", "0:v:0", "-map", "0:a?", "-map_metadata", "-1",
      "-vf", filter,
      "-c:v", "libx264", "-preset", "medium", "-crf", "20",
      "-c:a", "aac", "-b:a", "192k",
      "-movflags", "frag_keyframe+empty_moov+default_base_moof",
      "-f", "mp4", "pipe:1",
    ],
    config.displayUpload,
  );
  await uploadSingleOutput(
    [
      "-v", "error", "-ss", "0.1", "-i", config.sourceUrl,
      "-map_metadata", "-1", "-frames:v", "1",
      "-vf", `${filter},scale=720:720:force_original_aspect_ratio=decrease`,
      "-c:v", "libwebp", "-quality", "82", "-compression_level", "6",
      "-f", "image2pipe", "pipe:1",
    ],
    config.previewUpload,
  );
}

async function callback(body) {
  const response = await fetch(`${apiUrl}/callback`, {
    method: "POST",
    headers: { ...authorization, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Callback failed with ${response.status}.`);
}

function failureCode(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("ffprobe")) return "input_probe_failed";
  if (message.includes("ffmpeg")) return "transcode_failed";
  if (message.includes("R2 upload") || message.includes("R2 multipart") || message.includes("Multipart")) {
    return "output_upload_failed";
  }
  return "worker_failed";
}

async function main() {
  const configResponse = await fetch(`${apiUrl}/config`, {
    method: "POST",
    headers: authorization,
  });
  if (!configResponse.ok) throw new Error(`Configuration failed with ${configResponse.status}.`);
  const config = await configResponse.json();
  const inputProbe = await probe(config.sourceUrl);

  if (config.kind === "photo") await uploadPhoto(config);
  else if (config.kind === "video") await uploadVideo(config, inputProbe);
  else throw new Error("Unsupported media kind.");

  const outputProbe = await probe(config.displayUpload.verificationUrl);
  const video = sourceVideo(outputProbe);
  const duration =
    config.kind === "video"
      ? Number(outputProbe.format?.duration ?? video?.duration ?? 0)
      : 0;
  if (!video?.width || !video?.height || !Number.isFinite(duration)) {
    throw new Error("Output probe did not return valid metadata.");
  }

  await callback({
    status: "succeeded",
    width: video.width,
    height: video.height,
    durationSeconds: config.kind === "video" ? Math.max(0, Math.round(duration)) : undefined,
  });
}

try {
  await main();
} catch (error) {
  console.error(error);
  try {
    await callback({ status: "failed", errorCode: failureCode(error) });
  } catch (callbackError) {
    console.error(callbackError);
  }
  process.exitCode = 1;
}
