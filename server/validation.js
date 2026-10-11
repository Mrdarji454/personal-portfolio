import { z } from "zod";
const text = (max = 5000) => z.string().trim().max(max);
const required = (max = 5000) => text(max).min(1);
const https = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return u.protocol === "https:" && !u.username && !u.password;
    } catch {
      return false;
    }
  }, "Use a valid HTTPS URL or leave empty");
const media = z
  .string()
  .regex(
    /^\/api\/media\/[a-f0-9]{24}$/,
    "Use a file uploaded through the dashboard",
  )
  .nullable();
const screenshot = z
  .object({
    src: media.unwrap(),
    alt: required(250),
    width: z.number().int().positive().max(10000),
    height: z.number().int().positive().max(10000),
  })
  .strict();
export const projectSchema = z
  .object({
    slug: required(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: required(150),
    category: required(150),
    summary: required(500),
    description: required(),
    problem: text(),
    contribution: required(250),
    contributionDetail: text(),
    status: required(150),
    theme: z.enum(["erp", "market", "weather"]),
    stack: z.array(required(100)).max(30),
    implementedFeatures: z.array(required(500)).max(50),
    plannedFeatures: z.array(required(500)).max(50),
    featureNote: text(),
    architecture: text(),
    challenges: text(),
    learning: text(),
    screenshots: z.array(screenshot).max(20),
    repository: https,
    liveUrl: https,
    videoUrl: https,
    published: z.boolean(),
    featured: z.boolean(),
    order: z.number().int().min(0).max(10000),
  })
  .strict();
export const siteSchema = z
  .object({
    person: z
      .object({
        name: required(100),
        fullName: required(150),
        role: required(150),
        location: required(200),
        email: z.email().max(250),
        github: https,
        linkedin: https,
        languages: z.array(required(80)).max(20),
        portrait: media,
        resumePdf: media,
      })
      .strict(),
    hero: z
      .object({
        headline: required(160),
        introduction: required(1000),
        availability: required(200),
        available: z.boolean(),
      })
      .strict(),
    biography: required(10000),
    skills: z
      .array(
        z
          .object({
            title: required(150),
            items: z.array(required(100)).max(40),
          })
          .strict(),
      )
      .max(20),
    education: z
      .array(
        z
          .object({
            degree: required(200),
            institution: required(300),
            graduation: text(100),
            score: text(200),
          })
          .strict(),
      )
      .max(20),
    journey: z
      .array(
        z
          .object({
            label: required(150),
            title: required(200),
            text: required(2000),
          })
          .strict(),
      )
      .max(30),
  })
  .strict();
export const inquirySchema = z
  .object({
    name: required(100),
    email: z.email().max(250),
    subject: required(150),
    message: required(5000).min(10),
    website: z.literal("").optional(),
  })
  .strict();
export const loginSchema = z
  .object({ email: z.email().max(250), password: z.string().min(1).max(72) })
  .strict();
export const reorderSchema = z
  .object({ ids: z.array(z.string().regex(/^[a-f0-9]{24}$/)).max(200) })
  .strict()
  .refine((v) => new Set(v.ids).size === v.ids.length, "Duplicate project IDs");
export function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const e = new Error("Please check the highlighted fields.");
    e.status = 422;
    e.fields = Object.fromEntries(
      result.error.issues.map((i) => [i.path.join("."), i.message]),
    );
    throw e;
  }
  return result.data;
}
