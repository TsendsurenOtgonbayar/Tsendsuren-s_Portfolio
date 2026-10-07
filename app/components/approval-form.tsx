"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "./language-provider";
import { SiteHeader, SiteFooter } from "./site-header";
export default function ApprovalForm({ token }: { token: string }) {
  const { language } = useLanguage();
  const mn = language === "mn";
  const [submitting, setSubmitting] = useState(false);
  return (
    <>
      <SiteHeader />
      <main id="main" className="auth-main">
        <section className="auth-card">
          <ShieldCheck size={32} />
          <p className="eyebrow">
            TSENDSUREN / {mn ? "БАТАЛГААЖУУЛАЛТ" : "APPROVAL"}
          </p>
          <h1>{mn ? "Нэвтрэлтийг зөвшөөрөх үү?" : "Approve this sign-in?"}</h1>
          <p>
            {mn
              ? "Та өөрөө хүсэлт гаргасан бол зөвшөөрнө үү. Энэ холбоосыг нээсэн хөтөч дээр админ эрх идэвхжинэ."
              : "Approve only if you requested this sign-in. The browser in which you opened this link will receive administrator access."}
          </p>
          {token ? (
            <form
              method="post"
              action="/api/auth/approve"
              onSubmit={() => setSubmitting(true)}
            >
              <input type="hidden" name="token" value={token} />
              <button
                disabled={submitting}
                className="button primary"
                type="submit"
              >
                {submitting
                  ? mn
                    ? "Нэвтэрч байна…"
                    : "Signing in…"
                  : mn
                    ? "Зөвшөөрч нэвтрэх"
                    : "Approve and sign in"}
              </button>
            </form>
          ) : (
            <p className="notice error">
              {mn
                ? "Холбоос буруу байна. Шинэ хүсэлт гаргана уу."
                : "Invalid link. Please request a new one."}
            </p>
          )}
          <a href="/admin/login" className="text-link">
            {mn ? "Буцах" : "Back"}
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
