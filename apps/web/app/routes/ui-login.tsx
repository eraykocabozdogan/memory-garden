import { Sprout } from "lucide-react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/ui-login";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Giriş önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): three login layouts based on shadcn's login-01, login-02
// and login-04 blocks, with our own content (username + password, no sign-up: decision G1).

const VARIANTS = [
  { id: "sade", name: "Sade (login-01)" },
  { id: "iki-sutun", name: "İki sütun (login-02)" },
  { id: "kart", name: "Görselli kart (login-04)" },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-heading text-lg font-semibold", className)}>
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sprout className="size-4" aria-hidden="true" />
      </span>
      Memory Garden
    </span>
  );
}

function LoginFields() {
  const onSubmit = (event: FormEvent) => event.preventDefault();
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="login-username">Kullanıcı adı</Label>
        <Input id="login-username" autoComplete="username" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="login-password">Şifre</Label>
        <Input id="login-password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full">
        Giriş yap
      </Button>
    </form>
  );
}

function Plate({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt="Elle boyanmış bir Curtis çiçek çizimi"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

function Simple() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <Brand className="mb-2" />
            <CardTitle className="font-heading text-xl">Tekrar hoş geldin</CardTitle>
            <CardDescription>Bahçene girmek için bilgilerini yaz.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginFields />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TwoColumn() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <Brand />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Tekrar hoş geldin</h1>
              <p className="text-sm text-muted-foreground">Bahçene girmek için bilgilerini yaz.</p>
            </div>
            <LoginFields />
            <p className="font-hand text-xl text-muted-foreground">Her anı bir çiçek…</p>
          </div>
        </div>
      </div>
      <div className="relative hidden border-l bg-muted lg:block">
        <Plate src="/flowers/art/cyclamen.webp" className="absolute inset-0 object-top" />
      </div>
    </div>
  );
}

function ImageCard() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="flex flex-col gap-6 p-6 md:p-8">
              <Brand />
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Tekrar hoş geldin</h1>
                <p className="text-sm text-muted-foreground">
                  Bahçene girmek için bilgilerini yaz.
                </p>
              </div>
              <LoginFields />
            </div>
            <div className="relative hidden border-l bg-muted md:block">
              <Plate src="/flowers/art/anemone.webp" className="absolute inset-0 object-top" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UiLogin() {
  const [params] = useSearchParams();
  const variant: VariantId = VARIANTS.find((v) => v.id === params.get("v"))?.id ?? "sade";

  return (
    <div className="relative">
      <nav
        aria-label="Giriş varyantları"
        className="fixed top-3 left-1/2 z-20 flex -translate-x-1/2 flex-wrap justify-center gap-2 rounded-lg border bg-card/95 p-1 shadow-lift backdrop-blur"
      >
        {VARIANTS.map((v) => (
          <Button
            key={v.id}
            size="sm"
            variant={v.id === variant ? "default" : "ghost"}
            aria-current={v.id === variant ? "page" : undefined}
            render={<Link to={`?v=${v.id}`} replace />}
          >
            {v.name}
          </Button>
        ))}
        <Button size="sm" variant="ghost" render={<Link to="/ui" />}>
          ← Önizleme
        </Button>
      </nav>
      {variant === "sade" && <Simple />}
      {variant === "iki-sutun" && <TwoColumn />}
      {variant === "kart" && <ImageCard />}
    </div>
  );
}
