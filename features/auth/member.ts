import "server-only";

import { asc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDatabase, isDatabaseConfigured } from "@/db";
import { profiles } from "@/db/schema";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function isMember(userId: string) {
  if (!isDatabaseConfigured()) return false;

  const [profile] = await getDatabase()
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return Boolean(profile);
}

// Usernames live in the database so member identities never appear in source code.
export async function resolveLoginEmail(username: string) {
  const [account] = await getDatabase().execute<{ email: string | null }>(sql`
    select users.email
    from ${profiles}
    join auth.users as users on users.id = ${profiles.id}
    where ${profiles.username} = ${username}
    limit 1
  `);

  return account?.email ?? null;
}

export async function getMemberNames(memberId: string) {
  const rows = await getDatabase()
    .select({ id: profiles.id, displayName: profiles.displayName })
    .from(profiles)
    .orderBy(asc(profiles.createdAt));

  return {
    memberName: rows.find((row) => row.id === memberId)?.displayName ?? "Üye",
    memberNames: rows.map((row) => row.displayName),
  };
}

export async function getCurrentMemberId() {
  if (!getSupabasePublicConfig() || !isDatabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;

  if (!userId || !(await isMember(userId))) return null;
  return userId;
}

export async function requireMember() {
  const userId = await getCurrentMemberId();
  if (!userId) redirect("/login");
  return userId;
}
