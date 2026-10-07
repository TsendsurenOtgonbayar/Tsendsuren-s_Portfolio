"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, Upload, FileText, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "./language-provider";
import { SiteHeader, SiteFooter } from "./site-header";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { Project } from "@/lib/project-types";
import type { ProjectInput } from "@/lib/project-validation";
const emptyProject: ProjectInput = {
  titleMn: "",
  titleEn: "",
  summaryMn: "",
  summaryEn: "",
  contentMn: "",
  contentEn: "",
  technologies: "",
  imageKey: "",
  githubUrl: "",
  demoUrl: "",
  published: 0,
};
export default function AdminEditor() {
  const { language } = useLanguage();
  const mn = language === "mn";
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState<ProjectInput>({
    ...emptyProject,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingSelection, setPendingSelection] = useState<
    Project | "new" | null
  >(null);
  const messages: Record<string, [string, string]> = {
    saved: ["Нийтлэл хадгалагдлаа.", "Article saved."],
    deleted: ["Нийтлэл устгагдлаа.", "Article deleted."],
    uploaded: [
      "Зураг орлоо. Нийтлэлээ хадгалаарай.",
      "Image uploaded. Save the article to keep it.",
    ],
    failed: [
      "Үйлдэл амжилтгүй. Оруулсан мэдээлэл хэвээрээ байна. Дахин оролдоно уу.",
      "The action failed. Your inputs are preserved. Please try again.",
    ],
    load: ["Нийтлэлүүдийг ачаалж чадсангүй.", "Could not load articles."],
    image: [
      "PNG, JPG эсвэл WebP зураг сонгоно уу. Дээд хэмжээ 4 MB.",
      "Choose a PNG, JPG or WebP image, up to 4 MB.",
    ],
  };
  function translated(code: string) {
    return messages[code]?.[mn ? 0 : 1] || code;
  }
  async function refreshProjects() {
    setLoading(true);
    try {
      const response = await fetch("/api/projects?admin=1");
      if (!response.ok) throw new Error();
      setProjectList(await response.json());
    } catch {
      setError("load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refreshProjects();
  }, []);
  useEffect(() => {
    const preventExit = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", preventExit);
    return () => window.removeEventListener("beforeunload", preventExit);
  }, [dirty]);
  // WebMCP нь зөвхөн дэлгэц дээрх одоогийн нийтлэлүүдийг уншина.
  useEffect(() => {
    type Registry = {
      registerTool: (
        tool: unknown,
        options: { signal: AbortSignal },
      ) => unknown;
    };
    const registry = (document as unknown as { modelContext?: Registry })
      .modelContext;
    if (!registry) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        registry.registerTool(
          {
            name: "list_portfolio_articles",
            description:
              "Read the articles currently loaded in the administrator editor, including draft status.",
            inputSchema: {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            execute(input: unknown) {
              if (
                !input ||
                typeof input !== "object" ||
                Array.isArray(input) ||
                Object.keys(input).length
              )
                throw new Error("Expected empty object");
              return {
                loading,
                articles: projectList.map((p) => ({
                  id: p.id,
                  titleMn: p.titleMn,
                  titleEn: p.titleEn,
                  published: Boolean(p.published),
                })),
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, [projectList, loading]);
  function updateField(field: keyof ProjectInput, value: string | number) {
    setProjectForm((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setNotice("");
  }
  function openEditor(project: Project | "new") {
    setEditingId(project === "new" ? null : project.id);
    setProjectForm(
      project === "new"
        ? { ...emptyProject }
        : {
            titleMn: project.titleMn,
            titleEn: project.titleEn,
            summaryMn: project.summaryMn,
            summaryEn: project.summaryEn,
            contentMn: project.contentMn,
            contentEn: project.contentEn,
            technologies: project.technologies,
            imageKey: project.imageKey,
            githubUrl: project.githubUrl,
            demoUrl: project.demoUrl,
            published: project.published,
          },
    );
    setDirty(false);
    setNotice("");
    setError("");
  }
  function chooseProject(project: Project | "new") {
    if (dirty) setPendingSelection(project);
    else openEditor(project);
  }
  async function saveArticle(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        editingId ? `/api/projects/${editingId}` : "/api/projects",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectForm),
        },
      );
      if (!response.ok) throw new Error();
      const result = (await response.json()) as { id: string };
      setEditingId(result.id);
      setDirty(false);
      setNotice("saved");
      await refreshProjects();
    } catch {
      setError("failed");
    } finally {
      setSaving(false);
    }
  }
  async function uploadImage(file: File | undefined) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 4 * 1024 * 1024
    ) {
      setError("image");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error();
      const result = (await response.json()) as { key: string };
      updateField("imageKey", result.key);
      setNotice("uploaded");
    } catch {
      setError("failed");
    } finally {
      setUploading(false);
    }
  }
  async function deleteArticle() {
    if (!deleteId) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${deleteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      if (editingId === deleteId) openEditor("new");
      setNotice("deleted");
      setDeleteId(null);
      await refreshProjects();
    } catch {
      setError("failed");
      setDeleteId(null);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <SiteHeader />
      <main id="main" className="admin-main">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">
              TSENDSUREN / {mn ? "УДИРДЛАГА" : "EDITOR"}
            </p>
            <h1>{mn ? "Бүтээлийн тэмдэглэл" : "Your project journal"}</h1>
            <p>
              {mn
                ? "Төслийнхөө түүхийг хоёр хэлээр хуваалцаарай."
                : "Tell the story of your project in two languages."}
            </p>
          </div>
          <form className="logout-form" action="/api/auth/logout" method="post">
            <button type="submit">{mn ? "Гарах" : "Sign out"}</button>
          </form>
        </div>
        <div className="editor-layout">
          <aside className="article-sidebar">
            <button
              disabled={saving || uploading}
              className="button primary"
              onClick={() => chooseProject("new")}
            >
              <Plus size={16} />
              {mn ? "Шинэ нийтлэл" : "New article"}
            </button>
            <h2>
              {mn ? "Миний нийтлэлүүд" : "My articles"}{" "}
              <span>{projectList.length}</span>
            </h2>
            {loading ? (
              <p role="status">{mn ? "Ачаалж байна…" : "Loading…"}</p>
            ) : projectList.length === 0 ? (
              <p className="muted">
                {mn
                  ? "Анхны төслөө эндээс нэмээрэй."
                  : "Add your first project here."}
              </p>
            ) : (
              projectList.map((project) => (
                <div
                  className={`article-row ${editingId === project.id ? "selected" : ""}`}
                  key={project.id}
                >
                  <button
                    disabled={saving || uploading}
                    className="article-select"
                    onClick={() => chooseProject(project)}
                  >
                    <FileText size={17} />
                    <span>
                      <strong>{mn ? project.titleMn : project.titleEn}</strong>
                      <small>
                        {project.published
                          ? mn
                            ? "Нийтлэгдсэн"
                            : "Published"
                          : mn
                            ? "Ноорог"
                            : "Draft"}
                      </small>
                    </span>
                    <Pencil size={14} />
                  </button>
                  <button
                    disabled={saving || uploading}
                    className="delete-button"
                    aria-label={`${mn ? "Устгах" : "Delete"}: ${mn ? project.titleMn : project.titleEn}`}
                    onClick={() => setDeleteId(project.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
            <button
              className="text-link"
              onClick={() => {
                setError("");
                void refreshProjects();
              }}
              disabled={loading}
            >
              {mn ? "Жагсаалтыг шинэчлэх" : "Refresh list"}
            </button>
          </aside>
          <form className="project-form" onSubmit={saveArticle}>
            <div className="form-title">
              <h2>
                {editingId
                  ? mn
                    ? "Нийтлэл засах"
                    : "Edit article"
                  : mn
                    ? "Шинэ нийтлэл"
                    : "New article"}
              </h2>
              <span>
                {dirty ? (mn ? "Хадгалаагүй өөрчлөлт" : "Unsaved changes") : ""}
              </span>
            </div>
            {error && (
              <div className="notice error" role="alert">
                {translated(error)}
              </div>
            )}
            {notice && (
              <div className="notice" role="status">
                {translated(notice)}
              </div>
            )}
            <fieldset disabled={saving || uploading}>
              <legend>{mn ? "Нүүр зураг" : "Cover image"}</legend>
              <div className="image-upload">
                {projectForm.imageKey ? (
                  <img
                    src={`/api/images/${projectForm.imageKey}`}
                    alt={mn ? "Сонгосон нүүр зураг" : "Selected cover"}
                  />
                ) : (
                  <div className="upload-placeholder">
                    <Upload size={28} />
                    <span>
                      {mn
                        ? "Төслийн зураг эсвэл дэлгэцийн агшин"
                        : "A project image or screenshot"}
                    </span>
                  </div>
                )}
                <label className="upload-label">
                  <span>
                    {uploading
                      ? mn
                        ? "Оруулж байна…"
                        : "Uploading…"
                      : mn
                        ? "Зураг сонгох"
                        : "Choose image"}
                  </span>
                  <input
                    aria-label={mn ? "Нүүр зураг сонгох" : "Choose cover image"}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => {
                      void uploadImage(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
                <small>PNG, JPG, WebP · 4 MB</small>
                {projectForm.imageKey && (
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => updateField("imageKey", "")}
                  >
                    {mn ? "Зургийг хасах" : "Remove image"}
                  </button>
                )}
              </div>
            </fieldset>
            <fieldset disabled={saving || uploading}>
              <legend>{mn ? "Нийтлэлийн агуулга" : "Article content"}</legend>
              <div className="bilingual-fields">
                {(["Mn", "En"] as const).map((suffix) => (
                  <div className="language-fields" key={suffix}>
                    <h3>{suffix === "Mn" ? "Монгол" : "English"}</h3>
                    <label htmlFor={`title${suffix}`}>
                      {mn ? "Гарчиг" : "Title"} *
                    </label>
                    <input
                      id={`title${suffix}`}
                      required
                      maxLength={160}
                      value={projectForm[`title${suffix}`]}
                      onChange={(event) =>
                        updateField(`title${suffix}`, event.target.value)
                      }
                    />
                    <label htmlFor={`summary${suffix}`}>
                      {mn ? "Товч тайлбар" : "Summary"} *
                    </label>
                    <textarea
                      id={`summary${suffix}`}
                      required
                      maxLength={500}
                      rows={3}
                      value={projectForm[`summary${suffix}`]}
                      onChange={(event) =>
                        updateField(`summary${suffix}`, event.target.value)
                      }
                    />
                    <label htmlFor={`content${suffix}`}>
                      {mn ? "Дэлгэрэнгүй нийтлэл" : "Full story"} *
                    </label>
                    <textarea
                      id={`content${suffix}`}
                      required
                      maxLength={30000}
                      rows={10}
                      placeholder={
                        mn
                          ? "Зорилго, хийсэн ажил, сурсан зүйлс…"
                          : "The goal, what you built, what you learned…"
                      }
                      value={projectForm[`content${suffix}`]}
                      onChange={(event) =>
                        updateField(`content${suffix}`, event.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
              <p className="field-help">
                {mn
                  ? "Догол мөрүүдээ хоосон мөрөөр тусгаарлана. Хоёр хэлний агуулгыг тус тус бичнэ."
                  : "Separate paragraphs with a blank line. Write each language separately."}
              </p>
            </fieldset>
            <fieldset disabled={saving || uploading}>
              <legend>
                {mn ? "Технологи ба холбоос" : "Technology & links"}
              </legend>
              <label htmlFor="technologies">
                {mn ? "Ашигласан технологи" : "Technologies"}
              </label>
              <input
                id="technologies"
                maxLength={250}
                placeholder="React, Node.js, PostgreSQL"
                value={projectForm.technologies}
                onChange={(event) =>
                  updateField("technologies", event.target.value)
                }
              />
              <div className="bilingual-fields">
                <div>
                  <label htmlFor="githubUrl">GitHub URL</label>
                  <input
                    type="url"
                    pattern="https://.*"
                    id="githubUrl"
                    placeholder="https://github.com/…"
                    value={projectForm.githubUrl}
                    onChange={(event) =>
                      updateField("githubUrl", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label htmlFor="demoUrl">Demo URL</label>
                  <input
                    type="url"
                    pattern="https://.*"
                    id="demoUrl"
                    placeholder="https://…"
                    value={projectForm.demoUrl}
                    onChange={(event) =>
                      updateField("demoUrl", event.target.value)
                    }
                  />
                </div>
              </div>
            </fieldset>
            <div className="save-bar">
              <label className="publish-choice">
                <Checkbox
                  id="publish"
                  disabled={saving || uploading}
                  checked={projectForm.published === 1}
                  onCheckedChange={(checked) =>
                    updateField("published", checked ? 1 : 0)
                  }
                />
                <span>
                  {mn ? "Нүүр хуудсанд нийтлэх" : "Publish on homepage"}
                  <small>
                    {mn
                      ? "Сонгоогүй бол ноорог хадгална."
                      : "Leave unchecked to save as a draft."}
                  </small>
                </span>
              </label>
              <button
                disabled={saving || uploading}
                type="submit"
                className="button primary"
              >
                <Save size={17} />
                {saving
                  ? mn
                    ? "Хадгалж байна…"
                    : "Saving…"
                  : mn
                    ? "Хадгалах"
                    : "Save article"}
              </button>
            </div>
            {editingId && (
              <a
                href={`/projects/${editingId}`}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {mn ? "Нийтлэлийг харах" : "View article"}
              </a>
            )}
          </form>
        </div>
        <AlertDialog
          open={Boolean(deleteId)}
          onOpenChange={(open) => {
            if (!open && !saving) setDeleteId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {mn ? "Нийтлэлийг устгах уу?" : "Delete this article?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {mn
                  ? "Энэ нийтлэлийг буцааж сэргээх боломжгүй."
                  : "This article cannot be recovered after deletion."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>
                {mn ? "Болих" : "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={saving}
                onClick={(event) => {
                  event.preventDefault();
                  void deleteArticle();
                }}
              >
                {mn ? "Устгах" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog
          open={Boolean(pendingSelection)}
          onOpenChange={(open) => {
            if (!open) setPendingSelection(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {mn ? "Хадгалаагүй өөрчлөлт байна" : "You have unsaved changes"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {mn
                  ? "Өөр нийтлэл нээвэл одоогийн өөрчлөлт алга болно."
                  : "Opening another article will discard your current changes."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {mn ? "Буцах" : "Keep editing"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingSelection) openEditor(pendingSelection);
                  setPendingSelection(null);
                }}
              >
                {mn ? "Хадгалахгүй үргэлжлүүлэх" : "Discard changes"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <SiteFooter />
    </>
  );
}
