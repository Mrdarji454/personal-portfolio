import { person, projects, skills, journey } from "../src/data.js";
import { Site, Project } from "./models.js";
import { siteSchema, projectSchema } from "./validation.js";
export const initialSite = {
  person: Object.fromEntries(
    [
      "name",
      "fullName",
      "role",
      "location",
      "email",
      "github",
      "linkedin",
      "languages",
      "portrait",
      "resumePdf",
    ].map((k) => [k, person[k]]),
  ),
  hero: {
    headline: "Building thoughtful digital experiences.",
    introduction:
      "A Computer Engineering student and MERN Stack Developer turning ideas into useful applications, one thoughtful detail at a time.",
    availability: "Open to internships & freelance",
    available: true,
  },
  biography:
    "I’m Mukesh, a Computer Engineering student at BVM in V.V. Nagar. I like understanding how things work — and then building something useful with what I learn.\n\nMy focus is full-stack development with the MERN stack. Alongside web projects, I practice C++ problem solving and strengthen my understanding of data structures and algorithms.",
  skills,
  education: [
    {
      degree: person.education,
      institution: person.college,
      graduation: person.graduation,
      score: person.score,
    },
  ],
  journey,
};
export const initialProjects = projects.map((p, index) => {
  const { features, number, repository, ...rest } = p;
  return {
    ...rest,
    repository: repository || "",
    liveUrl: "",
    videoUrl: "",
    implementedFeatures:
      p.slug === "weather-app"
        ? ["React application; detailed features await source review"]
        : [],
    plannedFeatures: p.slug === "weather-app" ? [] : features,
    architecture:
      p.slug === "school-erp"
        ? "Planned MERN structure: a React interface, Express / Node.js APIs, and MongoDB storage. Detailed implementation is pending source verification."
        : "Architecture details await source verification.",
    learning:
      "Detailed learning notes will be added after source review; no unverified technical outcomes are claimed.",
    published: true,
    featured: p.slug !== "weather-app",
    order: index,
  };
});
export async function seedContent() {
  const content = siteSchema.parse(initialSite);
  await Site.updateOne(
    { _id: "portfolio" },
    { $setOnInsert: { content } },
    { upsert: true },
  );
  for (const raw of initialProjects) {
    const { slug, published, featured, order, ...content } =
      projectSchema.parse(raw);
    await Project.updateOne(
      { slug },
      { $setOnInsert: { published, featured, order, content } },
      { upsert: true },
    );
  }
}
