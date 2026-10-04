import "server-only";

import { eq } from "drizzle-orm";
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
