import mongoose from "mongoose";
const { Schema, model } = mongoose;
export const Admin = model(
  "Admin",
  new Schema(
    {
      _id: { type: String, default: "administrator" },
      email: { type: String, required: true },
      passwordHash: { type: String, required: true, select: false },
    },
    { timestamps: true },
  ),
);
export const Session = model(
  "Session",
  new Schema({
    _id: String,
    adminId: String,
    csrf: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  }),
);
export const Site = model(
  "Site",
  new Schema(
    {
      _id: { type: String, default: "portfolio" },
      content: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true },
  ),
);
export const Project = model(
  "Project",
  new Schema(
    {
      slug: { type: String, required: true, unique: true },
      published: { type: Boolean, default: false },
      featured: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
      content: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true },
  ),
);
export const Inquiry = model(
  "Inquiry",
  new Schema(
    {
      name: String,
      email: String,
      subject: String,
      message: String,
      status: {
        type: String,
        enum: ["unread", "read", "archived"],
        default: "unread",
      },
    },
    { timestamps: true },
  ),
);
export const Upload = model(
  "Upload",
  new Schema(
    {
      filename: { type: String, required: true },
      kind: { type: String, enum: ["image", "pdf"], required: true },
      mime: String,
      size: Number,
      width: Number,
      height: Number,
      originalName: String,
    },
    { timestamps: true },
  ),
);
export function serializeProject(p) {
  return {
    ...p.content,
    slug: p.slug,
    _id: String(p._id),
    published: p.published,
    featured: p.featured,
    order: p.order,
    updatedAt: p.updatedAt,
  };
}
