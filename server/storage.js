import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { Upload } from "./models.js";
export function localStorageAdapter(directory) {
  return {
    path: (filename) => path.join(directory, path.basename(filename)),
    async write(filename, buffer) {
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(path.join(directory, filename), buffer, {
        flag: "wx",
      });
    },
    async remove(filename) {
      await fs
        .unlink(path.join(directory, path.basename(filename)))
        .catch((e) => {
          if (e.code !== "ENOENT") throw e;
        });
    },
  };
}
export async function saveUpload(file, kind, storage) {
  if (!file)
    throw Object.assign(new Error("Choose a file to upload."), { status: 422 });
  let buffer, mime, width, height, extension;
  if (kind === "pdf") {
    if (
      file.mimetype !== "application/pdf" ||
      !file.buffer.subarray(0, 5).equals(Buffer.from("%PDF-")) ||
      !file.buffer.subarray(-2048).includes(Buffer.from("%%EOF"))
    )
      throw Object.assign(new Error("Choose a valid PDF file."), {
        status: 422,
      });
    buffer = file.buffer;
    mime = "application/pdf";
    extension = "pdf";
  } else if (kind === "image") {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))
      throw Object.assign(new Error("Use a JPEG, PNG, or WebP image."), {
        status: 422,
      });
    try {
      const image = sharp(file.buffer, {
        limitInputPixels: 25000000,
        animated: false,
      });
      const meta = await image.metadata();
      if (!["jpeg", "png", "webp"].includes(meta.format)) throw new Error();
      const result = await image
        .rotate()
        .resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      buffer = result.data;
      width = result.info.width;
      height = result.info.height;
    } catch {
      throw Object.assign(
        new Error("The image could not be decoded or exceeds the pixel limit."),
        { status: 422 },
      );
    }
    mime = "image/webp";
    extension = "webp";
  } else
    throw Object.assign(new Error("Upload kind must be image or pdf."), {
      status: 422,
    });
  const filename = `${randomUUID()}.${extension}`;
  await storage.write(filename, buffer);
  try {
    const upload = await Upload.create({
      filename,
      kind,
      mime,
      size: buffer.length,
      width,
      height,
      originalName: file.originalname.slice(0, 200),
    });
    return {
      _id: String(upload._id),
      src: `/api/media/${upload._id}`,
      kind,
      width,
      height,
      size: buffer.length,
      originalName: upload.originalName,
    };
  } catch (e) {
    await storage.remove(filename);
    throw e;
  }
}
