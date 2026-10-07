import { z } from "zod";
const safeUrl = z
  .string()
  .max(2000)
  .refine(
    (value) => !value || /^https:\/\//i.test(value),
    "Use an https:// URL",
  );
export const projectInputSchema = z.object({
  titleMn: z.string().trim().min(1).max(160),
  titleEn: z.string().trim().min(1).max(160),
  summaryMn: z.string().trim().min(1).max(500),
  summaryEn: z.string().trim().min(1).max(500),
  contentMn: z.string().trim().min(1).max(30000),
  contentEn: z.string().trim().min(1).max(30000),
  technologies: z.string().trim().max(250),
  imageKey: z.string().regex(/^$|^[a-f0-9-]{36}\.(jpg|png|webp)$/),
  githubUrl: safeUrl,
  demoUrl: safeUrl,
  published: z.number().int().min(0).max(1),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;
