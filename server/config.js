import path from "node:path";
export function readConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  if (!env.MONGODB_URI)
    throw new Error("MONGODB_URI is required. See .env.example.");
  if (
    !env.SESSION_SECRET ||
    env.SESSION_SECRET.length < 32 ||
    env.SESSION_SECRET.startsWith("replace-")
  )
    throw new Error("Set a random SESSION_SECRET of at least 32 characters.");
  const origins = (env.CLIENT_ORIGINS || "http://127.0.0.1:5173")
    .split(",")
    .map((s) => s.trim());
  if (production && origins.some((s) => !s.startsWith("https://")))
    throw new Error("Production CLIENT_ORIGINS must use HTTPS.");
  if ((env.STORAGE_DRIVER || "local") !== "local")
    throw new Error(
      "Only the durable local-volume storage adapter is configured.",
    );
  return {
    production,
    secret: env.SESSION_SECRET,
    origins,
    mongoUri: env.MONGODB_URI,
    port: Number(env.PORT || 4000),
    uploadDir: path.resolve(env.UPLOAD_DIR || "./uploads"),
    trustProxy: env.TRUST_PROXY === "1",
    publicOrigin: env.PUBLIC_ORIGIN || origins[0],
  };
}
