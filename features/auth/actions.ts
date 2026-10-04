"use server";

import { redirect } from "next/navigation";

import { isDatabaseConfigured } from "@/db";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeLoginUsername } from "./login-identity";
import { isMember, resolveLoginEmail } from "./member";

export type LoginState = {
  message?: string;
};

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const username = normalizeLoginUsername(formData.get("username"));
  const password = formData.get("password");

  if (
    !username ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 256
  ) {
    return { message: "Kullanıcı adı veya şifre hatalı." };
  }

  if (!getSupabasePublicConfig() || !isDatabaseConfigured()) {
    return { message: "Giriş sistemi henüz yapılandırılmadı." };
  }

  const email = await resolveLoginEmail(username);
  if (!email) return { message: "Kullanıcı adı veya şifre hatalı." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { message: "Kullanıcı adı veya şifre hatalı." };

  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;

  if (!userId || !(await isMember(userId))) {
    await supabase.auth.signOut();
    return { message: "Bu alan yalnızca iki tanımlı hesaba açık." };
  }

  redirect("/memories");
}

export async function logout() {
  if (getSupabasePublicConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  redirect("/");
}
