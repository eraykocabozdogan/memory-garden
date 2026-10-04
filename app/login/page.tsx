import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/login-form";
import { getCurrentMemberId } from "@/features/auth/member";
import { ThemeControl } from "@/features/memories/memory-navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentMemberId()) redirect("/memories");

  return (
    <main className="login-shell">
      <div className="login-toolbar">
        <Link href="/" className="login-back-link">
          <ArrowLeft />
          Çiçek rehberine dön
        </Link>
        <ThemeControl />
      </div>
      <section className="login-card">
        <p className="eyebrow">Yalnızca ikimiz</p>
        <h1 className="mt-2 font-handwriting text-6xl leading-none text-accent-ink">Hoş geldin.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Anılar, günlükler ve bahçemiz bu kapının ardında.
        </p>
        <LoginForm />
        <p className="login-footnote">Yeni hesap oluşturulamaz.</p>
      </section>
    </main>
  );
}
