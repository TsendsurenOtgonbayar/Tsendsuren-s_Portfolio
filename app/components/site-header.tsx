"use client";
import { useLanguage } from "./language-provider";
export function SiteHeader() {
  const { language, setLanguage } = useLanguage();
  return (
    <header className="site-header">
      <a className="wordmark" href="/" aria-label="Tsendsuren home">
        <span className="brand-symbol">T</span>Tsendsuren
        <span className="brand-dot">.</span>
      </a>
      <nav aria-label={language === "mn" ? "Үндсэн цэс" : "Main navigation"}>
        <a href="/#projects">{language === "mn" ? "Төслүүд" : "Projects"}</a>
        <a href="/#about">{language === "mn" ? "Миний тухай" : "About"}</a>
      </nav>
      <div className="language-switch" aria-label="Language / Хэл">
        <button
          type="button"
          aria-pressed={language === "mn"}
          onClick={() => setLanguage("mn")}
        >
          MN
        </button>
        <span>/</span>
        <button
          type="button"
          aria-pressed={language === "en"}
          onClick={() => setLanguage("en")}
        >
          EN
        </button>
      </div>
    </header>
  );
}
export function SiteFooter() {
  const { language } = useLanguage();
  return (
    <footer className="site-footer">
      <a className="wordmark" href="/">
        Tsendsuren.
      </a>
      <p>
        {language === "mn"
          ? "Тал нутгийн сэтгэлгээ. Технологийн ирээдүй."
          : "A steppe spirit. A future in technology."}
      </p>
      <a href="/admin">{language === "mn" ? "Удирдах" : "Manage"}</a>
    </footer>
  );
}
