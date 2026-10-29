import "@fontsource-variable/caveat";
import "@fontsource-variable/lora";
import "@fontsource-variable/source-sans-3";
import { IconContext } from "@phosphor-icons/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { Toaster } from "~/components/ui/sonner";
import type { Route } from "./+types/root";
import "./app.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    // next-themes sets the "dark" class on <html> before React hydrates.
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Light / dark / system theme (decision G2). The choice is stored in localStorage ("theme").
// Icons default to Phosphor's "light" weight (decision 8-7); navigation passes "regular".
const iconDefaults = { weight: "light" } as const;

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <IconContext.Provider value={iconDefaults}>
        <Outlet />
        <Toaster />
      </IconContext.Provider>
    </ThemeProvider>
  );
}

export function HydrateFallback() {
  return <p className="p-8 text-sm text-muted-foreground">Yükleniyor…</p>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Beklenmeyen bir hata oluştu.";

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Bir şeyler ters gitti</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
    </main>
  );
}
