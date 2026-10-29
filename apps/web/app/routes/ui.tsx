import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { tr } from "react-day-picker/locale";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import type { Route } from "./+types/ui";

export function meta(_: Route.MetaArgs) {
  return [{ title: "UI kitchen sink · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2). Shows the tokens and the shadcn components on realistic
// pieces so the design can be judged on real screens. Not part of the product.

const PAIRS = [
  ["background", "foreground"],
  ["card", "card-foreground"],
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["muted", "muted-foreground"],
  ["accent", "accent-foreground"],
  ["destructive", "destructive-foreground"],
] as const;

const GRAIN_KEY = "mg-ui-grain";

function readStoredGrain(): boolean {
  try {
    // Grain is on by default for now; only an explicit "off" turns it off.
    return window.localStorage.getItem(GRAIN_KEY) !== "off";
  } catch {
    return true;
  }
}

const dateFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

export default function Ui() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [grain, setGrain] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 12));

  useEffect(() => {
    setMounted(true);
    setGrain(readStoredGrain());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.grain = grain ? "on" : "off";
    try {
      window.localStorage.setItem(GRAIN_KEY, grain ? "on" : "off");
    } catch {
      // Not critical: the choice just will not be remembered.
    }
  }, [grain, mounted]);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="mr-auto text-lg font-semibold">Tasarım önizlemesi</h1>
          <Button
            variant={grain ? "default" : "outline"}
            aria-pressed={grain}
            onClick={() => setGrain((v) => !v)}
          >
            Kâğıt dokusu: {grain ? "açık" : "kapalı"}
          </Button>
          <Button
            variant="outline"
            aria-pressed={dark}
            onClick={() => setTheme(dark ? "light" : "dark")}
          >
            {dark ? "Koyu tema" : "Açık tema"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-4 py-10">
        <p className="text-muted-foreground" data-testid="theme-note">
          Parchment renkleri · Lora + Source Sans 3 + Caveat · Paper şekli · shadcn/ui (Base UI,
          Vega)
        </p>

        <section aria-labelledby="type" className="space-y-4">
          <h2 id="type" className="text-2xl font-semibold">
            Yazı örneği
          </h2>
          <div className="flex flex-col gap-stack rounded-lg border bg-card p-card text-card-foreground shadow-card">
            <h3 className="text-4xl font-semibold">Bahçemizde ilk çiçek</h3>
            <h4 className="text-xl font-medium">İlk yağmurdan sonra, vapurda</h4>
            <p className="max-w-prose text-base leading-relaxed">
              Pijamalı hasta yağız şoföre çabucak güvendi. Ğüzel şiir ışığında İstanbul; ÇÖĞŞÜİ
              çöğşüı. Bir anıyı yazmak, onu ikinci kez yaşamaktır.
            </p>
            <p className="max-w-prose text-sm text-muted-foreground">
              Küçük yazı: 12 Ekim 2026, Kadıköy · 18°C · ₺120 çay ve simit.
            </p>
            <p className="font-hand text-3xl text-primary">Seni düşündüğüm bir akşam…</p>
          </div>
        </section>

        <section aria-labelledby="swatches" className="space-y-4">
          <h2 id="swatches" className="text-2xl font-semibold">
            Renk token'ları
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PAIRS.map(([bg, fg]) => (
              <li
                key={bg}
                className="rounded-lg border p-3 text-sm"
                style={{ background: `var(--${bg})`, color: `var(--${fg})` }}
              >
                <span className="block text-lg font-semibold">Aa</span>
                {bg}
              </li>
            ))}
            {(["border", "input", "ring"] as const).map((token) => (
              <li
                key={token}
                className="rounded-lg border bg-card p-3 text-sm text-card-foreground"
              >
                <span
                  className="mb-2 block h-5 rounded"
                  style={{ background: `var(--${token})` }}
                  aria-hidden="true"
                />
                {token}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="buttons" className="space-y-4">
          <h2 id="buttons" className="text-2xl font-semibold">
            Butonlar ve rozetler
          </h2>
          <div className="flex flex-wrap gap-3" data-testid="button-row">
            <Button>Anıyı kaydet</Button>
            <Button variant="secondary">Vazgeç</Button>
            <Button variant="outline">Çiçek ekle</Button>
            <Button variant="ghost">Daha fazla</Button>
            <Button variant="destructive">Sil</Button>
            <Button variant="link">Tümünü gör</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>vapur</Badge>
            <Badge variant="secondary">yağmur</Badge>
            <Badge variant="outline">Kadıköy</Badge>
            <Badge variant="destructive">çöp kutusunda</Badge>
          </div>
        </section>

        <section aria-labelledby="form" className="space-y-4">
          <h2 id="form" className="text-2xl font-semibold">
            Form
          </h2>
          <div className="grid max-w-md gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ui-title">Başlık</Label>
              <Input id="ui-title" placeholder="Bu anıya bir ad ver" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ui-note">Not</Label>
              <Textarea id="ui-note" placeholder="O gün neler oldu?" />
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-medium">Tarih</span>
              <Popover>
                <PopoverTrigger render={<Button variant="outline" className="justify-start" />}>
                  {date ? dateFormat.format(date) : "Tarih seç"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} locale={tr} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Button
                onClick={() => toast.success("Anı kaydedildi", { description: "Kadıköy, 12 Ekim" })}
              >
                Bildirim göster
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="overlays" className="space-y-4">
          <h2 id="overlays" className="text-2xl font-semibold">
            Menü, diyalog ve sekmeler
          </h2>
          <div className="flex flex-wrap gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                Seçenekler
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Anıyı düzenle</DropdownMenuItem>
                <DropdownMenuItem>Çiçek bırak</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Çöp kutusuna taşı</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>Anıyı sil…</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bu anı çöp kutusuna taşınsın mı?</DialogTitle>
                  <DialogDescription>
                    30 gün içinde çöp kutusundan geri alabilirsin.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Vazgeç</DialogClose>
                  <DialogClose render={<Button variant="destructive" />}>Taşı</DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="list" className="max-w-md">
            <TabsList>
              <TabsTrigger value="list">Liste</TabsTrigger>
              <TabsTrigger value="map">Harita</TabsTrigger>
              <TabsTrigger value="calendar">Takvim</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="pt-3 text-muted-foreground">
              Anılar tarih sırasıyla.
            </TabsContent>
            <TabsContent value="map" className="pt-3 text-muted-foreground">
              Anılar haritada.
            </TabsContent>
            <TabsContent value="calendar" className="pt-3 text-muted-foreground">
              Anılar takvimde.
            </TabsContent>
          </Tabs>
        </section>

        <section aria-labelledby="cards" className="space-y-4">
          <h2 id="cards" className="text-2xl font-semibold">
            Anı kartı ve uygulama iskeleti
          </h2>
          <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
            <nav
              aria-label="Örnek yan menü"
              className="rounded-lg border bg-sidebar p-3 text-sidebar-foreground"
            >
              <ul className="space-y-1 text-sm">
                <li className="rounded-md bg-sidebar-accent px-3 py-2 font-medium text-sidebar-accent-foreground">
                  Anılar
                </li>
                <li className="px-3 py-2">Günlük</li>
                <li className="px-3 py-2">Bahçe</li>
                <li className="px-3 py-2">Özel günler</li>
              </ul>
            </nav>
            <Card data-testid="memory-card">
              <CardHeader>
                <CardDescription className="font-hand text-xl">
                  12 Ekim 2026 · Kadıköy
                </CardDescription>
                <CardTitle className="font-heading text-xl">İlk yağmurdan sonra</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                <img
                  src="/flowers/art/anemone.webp"
                  alt="Elle boyanmış bir anemon çizimi"
                  className="h-44 w-full rounded-md border object-cover object-top sm:w-32"
                />
                <p className="text-base">
                  Vapurda yan yana oturduk, çay soğuyana kadar hiç konuşmadık. Sessizlik de bir
                  anıymış.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Badge variant="secondary">vapur</Badge>
                <Badge variant="secondary">yağmur</Badge>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
