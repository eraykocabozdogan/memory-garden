const MAX_USERNAME_LENGTH = 64;

export function normalizeLoginUsername(username: unknown) {
  if (typeof username !== "string") return null;

  const normalizedUsername = username.trim();
  if (!normalizedUsername || normalizedUsername.length > MAX_USERNAME_LENGTH) return null;

  return normalizedUsername;
}
