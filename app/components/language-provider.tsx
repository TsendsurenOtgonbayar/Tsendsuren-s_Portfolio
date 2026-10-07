"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type Language = "mn" | "en";
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({ language: "mn", setLanguage: () => {} });
// Хэл нь зөвхөн энэ төхөөрөмжийн тохиргоо. Нийтлэлүүд серверт хадгалагдана.
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("mn");
  useEffect(() => {
    try {
      if (localStorage.getItem("portfolio-language") === "en")
        setLanguageState("en");
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  function setLanguage(value: Language) {
    setLanguageState(value);
    try {
      localStorage.setItem("portfolio-language", value);
    } catch {}
  }
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
