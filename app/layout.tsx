import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./components/language-provider";
export const metadata: Metadata = {
  title: {
    default: "Tsendsuren — Тал нутгаас, технологи руу",
    template: "%s | Tsendsuren",
  },
  description:
    "Tsendsuren — МУИС-ийн программ хангамжийн 3-р түвшний оюутан. Projects, ideas and learning from Mongolia.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        <LanguageProvider>
          <a className="skip-link" href="#main">
            Үндсэн агуулга / Skip to content
          </a>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
