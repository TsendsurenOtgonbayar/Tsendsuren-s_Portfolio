"use client";
import { Code2, Database, Globe2, Snowflake } from "lucide-react";
import { useLanguage } from "./language-provider";
import { SiteHeader, SiteFooter } from "./site-header";
import { exampleProject, type Project } from "@/lib/project-types";
export default function PortfolioHome({
  projects = [],
  loadError = false,
}: {
  projects?: Project[];
  loadError?: boolean;
}) {
  const { language } = useLanguage();
  const isMongolian = language === "mn";
  const projectList = projects.length ? projects : [exampleProject];
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero">
          <img
            className="hero-image"
            src="/winter-horses.png"
            alt={
              isMongolian
                ? "Өвлийн Монголын тал нутаг дахь адуу"
                : "Mongolian horses on a snowy winter steppe"
            }
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow">
              <span className="small-line" />
              {isMongolian ? "МОНГОЛООС, МЭНДЧИЛЬЕ" : "HELLO, FROM MONGOLIA"}
            </p>
            <h1>
              {isMongolian ? (
                <>
                  Тал нутгаас,
                  <br />
                  <em>технологи руу.</em>
                </>
              ) : (
                <>
                  From the steppe,
                  <br />
                  <em>into technology.</em>
                </>
              )}
            </h1>
            <div className="hero-intro">
              <span className="intro-rule" />
              <p>
                {isMongolian ? (
                  <>
                    Намайг <strong>Tsendsuren</strong> гэдэг.
                    <br />
                    МУИС-ийн программ хангамжийн
                    <br className="desktop-break" /> 3-р түвшний оюутан.
                  </>
                ) : (
                  <>
                    I’m <strong>Tsendsuren.</strong>
                    <br />A third-year software engineering student
                    <br className="desktop-break" /> at the National University
                    of Mongolia.
                  </>
                )}
              </p>
            </div>
            <a className="button primary" href="#projects">
              {isMongolian ? "Бүтээж буй зүйлс" : "Explore my projects"}
            </a>
          </div>
          <div className="hero-bottom">
            <span>PORTFOLIO · TSENDSUREN</span>
            <span>
              {isMongolian ? "ӨВЛИЙН ТАЛ / МОНГОЛ" : "WINTER STEPPE / MONGOLIA"}
            </span>
          </div>
        </section>
        <div className="identity-strip">
          <span>
            {isMongolian ? "УГ ҮНДЭС МИНЬ МОНГОЛ" : "ROOTED IN MONGOLIA"}
          </span>
          <span className="strip-ornament" aria-hidden="true">
            ◇ ─ ◇ ─ ◇
          </span>
          <span>
            {isMongolian
              ? "ХИЙХ ЗҮЙЛ МИНЬ ХЯЗГААРГҮЙ"
              : "BUILDING BEYOND BOUNDARIES"}
          </span>
        </div>
        <section className="section projects-section" id="projects">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                01 / {isMongolian ? "БҮТЭЭЛИЙН ТЭМДЭГЛЭЛ" : "PROJECT JOURNAL"}
              </p>
              <h2>
                {isMongolian ? "Санаанаас, бүтээл рүү." : "Ideas, made real."}
              </h2>
            </div>
            <p>
              {isMongolian
                ? "Хийж, туршиж, суралцаж буй зүйлсийн минь түүх."
                : "Stories of building, experimenting, and learning."}
            </p>
          </div>
          {loadError ? (
            <div className="notice" role="alert">
              {isMongolian
                ? "Нийтлэлүүдийг ачаалж чадсангүй. Түр хүлээгээд хуудсаа дахин ачаална уу."
                : "Could not load projects. Please refresh in a moment."}
            </div>
          ) : (
            <div className="project-grid">
              {projectList.map((project, index) => (
                <a
                  className="project-card"
                  key={project.id}
                  href={`/projects/${project.id}`}
                >
                  <div className="project-image-wrap">
                    <img
                      src={
                        project.imageKey
                          ? `/api/images/${project.imageKey}`
                          : "/winter-horses.png"
                      }
                      alt=""
                      loading="lazy"
                    />
                    <span className="project-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {project.id === exampleProject.id && (
                      <span className="example-label">
                        {isMongolian ? "Жишээ нийтлэл" : "Example article"}
                      </span>
                    )}
                  </div>
                  <div className="project-card-body">
                    <p className="project-tech">
                      {project.technologies.split(",").join(" / ")}
                    </p>
                    <h3>{isMongolian ? project.titleMn : project.titleEn}</h3>
                    <p>{isMongolian ? project.summaryMn : project.summaryEn}</p>
                    <span className="text-link">
                      {isMongolian
                        ? "Төслийн түүхийг унших"
                        : "Read the project story"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
        <section className="about-section" id="about">
          <div className="about-title">
            <p className="eyebrow">
              02 / {isMongolian ? "МИНИЙ ТУХАЙ" : "A LITTLE ABOUT ME"}
            </p>
            <h2>
              {isMongolian ? (
                <>
                  Уужим бодож.
                  <br />
                  Учрыг нь олж.
                  <br />
                  <em>Өөрөө бүтээх.</em>
                </>
              ) : (
                <>
                  Think openly.
                  <br />
                  Understand deeply.
                  <br />
                  <em>Build thoughtfully.</em>
                </>
              )}
            </h2>
            <div className="about-seal">
              <Snowflake size={25} />
              <span>
                MONGOLIA
                <br />
                TSENDSUREN
              </span>
            </div>
          </div>
          <div className="about-description">
            <p className="about-lead">
              {isMongolian ? "Сайн уу, би Tsendsuren." : "Hi, I’m Tsendsuren."}
            </p>
            <p>
              {isMongolian
                ? "Би МУИС-д программ хангамжийн чиглэлээр суралцдаг. Энд өөрийн хийж буй төслүүд, тэдгээрийн ард байгаа шийдэл, суралцсан зүйлсээ хуваалцана."
                : "I study software engineering at the National University of Mongolia. This is where I share my projects, the decisions behind them, and what I learn along the way."}
            </p>
            <div className="about-facts">
              <div>
                <span>{isMongolian ? "СУРГУУЛЬ" : "UNIVERSITY"}</span>
                <strong>
                  {isMongolian ? "МУИС" : "National University of Mongolia"}
                </strong>
              </div>
              <div>
                <span>{isMongolian ? "ЧИГЛЭЛ" : "FIELD"}</span>
                <strong>
                  {isMongolian
                    ? "Программ хангамж · 3-р түвшин"
                    : "Software engineering · Year 3"}
                </strong>
              </div>
            </div>
            <div className="skill-groups">
              <div>
                <Code2 size={20} />
                <p>Frontend</p>
                <span>HTML · CSS · JavaScript · React</span>
              </div>
              <div>
                <Database size={20} />
                <p>Backend & Data</p>
                <span>Node.js · PostgreSQL · MySQL</span>
              </div>
            </div>
          </div>
        </section>
        <section className="closing-note">
          <Globe2 size={24} />
          <p>
            {isMongolian
              ? "Нэг төсөл. Нэг шинэ зүйл. Өдөр бүр урагш."
              : "One project. One new lesson. Always moving forward."}
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
