import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Memory Garden" },
    {
      name: "description",
      content: "Çiçeklerin dili üzerine bir rehber ve iki kişilik bir anı bahçesi.",
    },
  ];
}

// Placeholder for the public flower guide (stage 3). Prerendered at build time.
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">Memory Garden</h1>
      <p className="mt-3 text-neutral-600">Yapım aşamasında.</p>
    </main>
  );
}
