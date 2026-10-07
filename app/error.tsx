"use client";
import { useLanguage } from "./components/language-provider";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { language } = useLanguage();
  return (
    <main id="main" className="section status-page">
      <h1>
        {language === "mn"
          ? "Хуудсыг ачаалж чадсангүй."
          : "This page could not be loaded."}
      </h1>
      <p>
        {language === "mn"
          ? "Түр хүлээгээд дахин оролдоно уу."
          : "Please try again in a moment."}
      </p>
      <button className="button primary" onClick={reset}>
        {language === "mn" ? "Дахин оролдох" : "Try again"}
      </button>
      <a className="text-link" href="/">
        Tsendsuren
      </a>
    </main>
  );
}
