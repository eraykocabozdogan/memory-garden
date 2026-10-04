import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getMediaProcessingConfig } from "./config";

export type ProcessingTokenPayload = {
  version: 1;
  expiresAt: number;
  itemId: string;
  runId: string;
};

function signature(encodedPayload: string) {
  return createHmac("sha256", getMediaProcessingConfig().tokenSecret)
    .update(encodedPayload)
    .digest("base64url");
}

export function createProcessingToken(payload: ProcessingTokenPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${signature(encodedPayload)}`;
}

export function verifyProcessingToken(token: string) {
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra) return null;

  const expected = Buffer.from(signature(encodedPayload));
  const received = Buffer.from(encodedSignature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const value: unknown = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
    if (!value || typeof value !== "object") return null;
    const payload = value as Partial<ProcessingTokenPayload>;
    if (
      payload.version !== 1 ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now() ||
      typeof payload.itemId !== "string" ||
      typeof payload.runId !== "string"
    ) {
      return null;
    }
    return payload as ProcessingTokenPayload;
  } catch {
    return null;
  }
}

export function readProcessingBearer(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return verifyProcessingToken(authorization.slice("Bearer ".length));
}
