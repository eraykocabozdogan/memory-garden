import { CalendarHeart, Flower2, Images, NotebookPen, Plus, Settings, Sprout } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import type { Route } from "./+types/ui-shell";

export function meta(_: Route.MetaArgs) {
  return [{ title: "İskelet önizlemesi · Memory Garden" }, { name: "robots", content: "noindex" }];
}

// Design-system preview (stage 2): two app shells based on shadcn's sidebar-07 (collapses to
// icons) and sidebar-08 (inset). Desktop gets the sidebar, mobile a bottom bar (decision G4).

const VARIANTS = [
  { id: "ikon", name: "İkona daralan (sidebar-07)" },
  { id: "inset", name: "İçe gömülü (sidebar-08)" },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

const NAV = [
  { label: "Anılar", icon: Images, active: true },
  { label: "Günlük", icon: NotebookPen },
  { label: "Bahçe", icon: Flower2 },
  { label: "Özel günler", icon: CalendarHeart },
  { label: "Ayarlar", icon: Settings },
] as const;

const MEMORIES = [
  { title: "İlk yağmurdan sonra", meta: "12 Ekim 2026 · Kadıköy", tags: ["vapur", "yağmur"] },
  { title: "Moda sahilinde gün batımı", meta: "3 Ekim 2026 · Moda", tags: ["deniz"] },
  { title: "Annemin bahçesindeki gül", meta: "21 Eylül 2026 · Bursa", tags: ["aile", "gül"] },
];

function AppSidebar({ variant }: { variant: VariantId }) {
  return (
    <Sidebar collapsible="icon" variant={variant === "inset" ? "inset" : "sidebar"}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Memory Garden">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sprout className="size-4" aria-hidden="true" />
              </span>
              <span className="font-heading text-base font-semibold">Memory Garden</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton isActive={"active" in item} tooltip={item.label}>
                    <item.icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="truncate px-2 font-hand text-lg text-muted-foreground group-data-[collapsible=icon]:hidden">
          Eray & Partner
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function BottomNav() {
  return (
    <nav
      aria-label="Alt menü"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              aria-current={"active" in item ? "page" : undefined}
              className="flex w-full flex-col items-center gap-1 py-2 text-xs text-muted-foreground aria-[current=page]:text-primary"
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function UiShell() {
  const [params] = useSearchParams();
  const variant: VariantId = VARIANTS.find((v) => v.id === params.get("v"))?.id ?? "ikon";

  return (
    <SidebarProvider>
      <AppSidebar variant={variant} />
      <SidebarInset>
        <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2">
          <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
          <h1 className="text-lg font-semibold">Anılar</h1>
          <div className="flex w-full flex-wrap gap-1 md:ml-auto md:w-auto">
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
          </div>
        </header>
        <div className="grid gap-4 p-4 pb-24 md:pb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ekim 2026</p>
            <Button size="sm">
              <Plus aria-hidden="true" />
              Anı ekle
            </Button>
          </div>
          {MEMORIES.map((memory) => (
            <Card key={memory.title} size="sm">
              <CardHeader>
                <CardDescription className="font-hand text-lg">{memory.meta}</CardDescription>
                <CardTitle className="font-heading text-lg">{memory.title}</CardTitle>
                <div className="flex gap-2 pt-1">
                  {memory.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}
