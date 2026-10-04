import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getR2Config } from "./config";

export const SINGLE_UPLOAD_LIMIT_BYTES = 100 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 5_000_000_000;
export const MULTIPART_PART_SIZE_BYTES = 16 * 1024 * 1024;

export type MediaKind = "photo" | "video";

export type UploadTokenPayload = {
  version: 1;
  expiresAt: number;
  userId: string;
  mode: "single" | "multipart";
  objectKey: string;
  uploadId?: string;
  kind: MediaKind;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
};

function signature(encodedPayload: string) {
  return createHmac("sha256", getR2Config().uploadTokenSecret)
    .update(encodedPayload)
    .digest("base64url");
}

export function createUploadToken(payload: UploadTokenPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${signature(encodedPayload)}`;
}

function isPayload(value: unknown): value is UploadTokenPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<UploadTokenPayload>;
  return (
    payload.version === 1 &&
    typeof payload.expiresAt === "number" &&
    typeof payload.userId === "string" &&
    (payload.mode === "single" || payload.mode === "multipart") &&
    typeof payload.objectKey === "string" &&
    (payload.kind === "photo" || payload.kind === "video") &&
    typeof payload.originalFileName === "string" &&
    typeof payload.mimeType === "string" &&
    typeof payload.fileSizeBytes === "number" &&
    (payload.mode !== "multipart" || typeof payload.uploadId === "string")
  );
}

export function verifyUploadToken(token: string) {
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra) return null;

  const expected = Buffer.from(signature(encodedPayload));
  const received = Buffer.from(encodedSignature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload: unknown = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!isPayload(payload) || payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
