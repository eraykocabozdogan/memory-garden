import { useEffect, useState } from "react";

// Placeholder for the private app (stage 1+). Rendered in the browser from the SPA shell.
export default function AppHome() {
  const [apiStatus, setApiStatus] = useState("kontrol ediliyor…");

  useEffect(() => {
    fetch("/api/health")
      .then((response) => response.json() as Promise<{ ok: boolean }>)
      .then((body) => setApiStatus(body.ok ? "çalışıyor" : "hata"))
      .catch(() => setApiStatus("ulaşılamıyor"));
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">Uygulama</h1>
      <p className="mt-3 text-neutral-600" data-testid="api-status">
        API: {apiStatus}
      </p>
    </main>
  );
}
