"use client";
import { useLanguage } from "./language-provider";
import { SiteHeader, SiteFooter } from "./site-header";
import type { Project } from "@/lib/project-types";
export default function ProjectArticle({ project }: { project: Project }) {
  const { language } = useLanguage();
  const mn = language === "mn";
  return (
    <>
      <SiteHeader />
      <main id="main" className="article-page">
        <a className="back-link" href="/#projects">
          {mn ? "Бүх төслүүд" : "All projects"}
        </a>
        <header className="article-heading">
          <p className="eyebrow">
            {project.id === "portfolio-preview"
              ? mn
                ? "ЖИШЭЭ НИЙТЛЭЛ"
                : "EXAMPLE ARTICLE"
              : project.published
                ? mn
                  ? "ТӨСЛИЙН ТЭМДЭГЛЭЛ"
                  : "PROJECT JOURNAL"
                : mn
                  ? "НООРОГ · ЗӨВХӨН ТАНД"
                  : "DRAFT · ONLY YOU"}{" "}
            {project.createdAt &&
              ` / ${new Date(project.createdAt).toLocaleDateString(mn ? "mn-MN" : "en-GB", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Ulaanbaatar" })}`}
          </p>
          <h1>{mn ? project.titleMn : project.titleEn}</h1>
          <p className="article-summary">
            {mn ? project.summaryMn : project.summaryEn}
          </p>
          <div className="tech-tags">
            {project.technologies
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
              .map((technology, index) => (
                <span key={index}>{technology}</span>
              ))}
          </div>
        </header>
        <img
          className="article-cover"
          src={
            project.imageKey
              ? `/api/images/${project.imageKey}`
              : "/winter-horses.png"
          }
          alt={mn ? project.titleMn : project.titleEn}
        />
        <article className="article-body">
          {(mn ? project.contentMn : project.contentEn)
            .split(/\n\s*\n/)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          {(project.githubUrl || project.demoUrl) && (
            <div className="article-links">
              {project.githubUrl && (
                <a
                  className="button primary"
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              )}
              {project.demoUrl && (
                <a
                  className="button secondary"
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mn ? "Ажиллаж буй хувилбар" : "Live demo"}
                </a>
              )}
            </div>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
