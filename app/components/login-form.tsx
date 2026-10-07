"use client";
import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { useLanguage } from "./language-provider";
import { SiteHeader, SiteFooter } from "./site-header";
export default function LoginForm({ expired }: { expired: boolean }) {
  const { language } = useLanguage();
  const mn = language === "mn";
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function requestApproval() {
    setSending(true);
    setError("");
    setSent(false);
    try {
      const response = await fetch("/api/auth/request", { method: "POST" });
      if (!response.ok) {
        const result = await response.json();
        setError(result.error === "rate_limited" ? "rate" : "failed");
        return;
      }
      setSent(true);
    } catch {
      setError("failed");
    } finally {
      setSending(false);
    }
  }
  return (
    <>
      <SiteHeader />
      <main id="main" className="auth-main">
        <section className="auth-card">
          <ShieldCheck size={32} />
          <p className="eyebrow">TSENDSUREN / {mn ? "АДМИН" : "ADMIN"}</p>
          <h1>{mn ? "Таны зөвшөөрлөөр." : "With your approval."}</h1>
          <p>
            {mn
              ? "Нэвтрэх зөвшөөрлийн холбоос зөвхөн эзэмшигчийн бүртгэлтэй имэйлд очно."
              : "A sign-in approval link is sent only to the owner’s registered email address."}
          </p>
          {expired && (
            <p className="notice error" role="alert">
              {mn
                ? "Холбоосын хугацаа дууссан эсвэл ашиглагдсан байна. Шинэ холбоос аваарай."
                : "This link has expired or was already used. Request a new one."}
            </p>
          )}
          {error && (
            <p className="notice error" role="alert">
              {error === "rate"
                ? mn
                  ? "Хүсэлтийн хязгаарт хүрлээ. Минутанд нэг, цагт тав хүртэл илгээнэ. Өмнөх имэйлээ шалгах эсвэл дараа оролдоно уу."
                  : "Request limit reached: one per minute, five per hour. Check your previous email or try later."
                : mn
                  ? "Имэйл илгээж чадсангүй. Серверийн имэйл болон өгөгдлийн сангийн тохиргоог шалгана уу."
                  : "Could not send the email. Check the server email and database configuration."}
            </p>
          )}
          {sent && (
            <p className="notice" role="status">
              {mn
                ? "Имэйл илгээгдлээ. Inbox болон Spam хавтсаа шалгаад, холбоосыг нээж зөвшөөрнө үү."
                : "Email sent. Check your inbox and spam folder, open the link, and approve sign-in."}
            </p>
          )}
          <button
            className="button primary"
            disabled={sending}
            onClick={requestApproval}
          >
            <Mail size={18} />
            {sending
              ? mn
                ? "Илгээж байна…"
                : "Sending…"
              : mn
                ? "Имэйлээр зөвшөөрөл авах"
                : "Request email approval"}
          </button>
          <small>
            {mn
              ? "Холбоос 10 минутын хугацаатай. Зөвшөөрсний дараа 8 цаг нэвтэрсэн байна."
              : "The link expires in 10 minutes. Your session lasts 8 hours after approval."}
          </small>
          <a className="text-link" href="/">
            {mn ? "Портфолио руу буцах" : "Back to portfolio"}
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
