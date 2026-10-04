const loginEmails = {
  "uye-bir": "member-one@example.com",
  "uye-iki": "member-two@example.com",
} as const;

export function resolveLoginEmail(username: unknown) {
  if (typeof username !== "string") return null;

  const normalizedUsername = username.trim();
  if (!Object.hasOwn(loginEmails, normalizedUsername)) return null;

  return loginEmails[normalizedUsername as keyof typeof loginEmails];
}
