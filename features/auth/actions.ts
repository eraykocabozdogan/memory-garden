"use server";

import { redirect } from "next/navigation";

import { isDatabaseConfigured } from "@/db";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveLoginEmail } from "./login-identity";
import { isMember } from "./member";

export type LoginState = {
  message?: string;
};

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = resolveLoginEmail(formData.get("username"));
  const password = formData.get("password");

  if (
    !email ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 256
  ) {
    return { message: "Kullanıcı adı veya şifre hatalı." };
  }

  if (!getSupabasePublicConfig() || !isDatabaseConfigured()) {
    return { message: "Giriş sistemi henüz yapılandırılmadı." };
  }

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
