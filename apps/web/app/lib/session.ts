// The browser side of sign-in. Plain fetch against the Worker's Better Auth endpoints; the
// session lives in an httpOnly cookie the browser sends on its own.

export type Member = { id: string; name: string; username: string | null };

export type SignInResult = "ok" | "wrong" | "limited" | "error";

export async function signIn(username: string, password: string): Promise<SignInResult> {
  try {
    const response = await fetch("/api/auth/sign-in/username", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
    });
    if (response.ok) return "ok";
    if (response.status === 429) return "limited";
    // Better Auth answers a wrong username or password with 401, a malformed one with 400/422.
    // Anything else (403 origin refused, 5xx) is not the member's mistake.
    return [400, 401, 422].includes(response.status) ? "wrong" : "error";
  } catch {
    return "error";
  }
}

export async function signOut() {
  const response = await fetch("/api/auth/sign-out", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error(`sign-out ${response.status}`);
}

/** The signed-in member, or null when there is no session. */
export async function currentMember(): Promise<Member | null> {
  const response = await fetch("/api/me");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`/api/me ${response.status}`);
  return (await response.json()) as Member;
}

export const SIGN_IN_MESSAGES: Record<Exclude<SignInResult, "ok">, string> = {
  wrong: "Kullanıcı adı ya da şifre yanlış.",
  limited: "Çok fazla deneme oldu. Biraz bekleyip tekrar dene.",
  error: "Bir sorun oldu, tekrar dene.",
};
