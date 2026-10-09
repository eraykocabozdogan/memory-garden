// Compact HMAC-SHA256 tokens: base64url(JSON payload) + "." + base64url(signature).
// Uses WebCrypto so the same code runs in Workers, containers and tests.

export type ExpiringPayload = { expiresAt: number };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) return null;
  try {
    const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/"));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function signingKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSignedToken<T extends ExpiringPayload>(payload: T, secret: string) {
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(secret),
    encoder.encode(encodedPayload),
  );
  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySignedToken<T extends ExpiringPayload>(
  token: string,
  secret: string,
  isPayload: (value: unknown) => value is T,
  now = Date.now(),
): Promise<T | null> {
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra !== undefined) return null;

  const signature = fromBase64Url(encodedSignature);
  const payloadBytes = fromBase64Url(encodedPayload);
  if (!signature || !payloadBytes) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    await signingKey(secret),
    signature,
    encoder.encode(encodedPayload),
  );
  if (!valid) return null;

  try {
    const payload: unknown = JSON.parse(decoder.decode(payloadBytes));
    if (!isPayload(payload) || payload.expiresAt <= now) return null;
    return payload;
  } catch {
    return null;
  }
}
