import type { Metadata } from "next";
import { Caveat, DM_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-app-sans",
  subsets: ["latin", "latin-ext"],
});

const serif = Newsreader({
  variable: "--font-app-serif",
  subsets: ["latin", "latin-ext"],
});

const handwriting = Caveat({
  variable: "--font-app-handwriting",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "İkimize",
  description: "İki kişilik özel anı ve günlük alanı.",
};

const themeScript = `
  (() => {
    const saved = localStorage.getItem("ikimize-theme") || "system";
    const dark = saved === "dark" || (saved === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.dataset.theme = saved;
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${handwriting.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
