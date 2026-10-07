"use client";
import { useLanguage } from "./components/language-provider";
import { SiteHeader, SiteFooter } from "./components/site-header";
export default function NotFound() {
  const { language } = useLanguage();
  return (
    <>
      <SiteHeader />
      <main id="main" className="section status-page">
        <p className="eyebrow">404</p>
        <h1>
          {language === "mn"
            ? "Энэ хуудас олдсонгүй."
            : "This page could not be found."}
        </h1>
        <a href="/" className="button primary">
          {language === "mn" ? "Нүүр хуудас" : "Back home"}
        </a>
      </main>
      <SiteFooter />
    </>
  );
}
