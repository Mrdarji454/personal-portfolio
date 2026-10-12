import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { Admin } from "../models.js";
import { readConfig } from "../config.js";
async function hiddenPassword() {
  if (!stdin.isTTY)
    throw new Error(
      "Run this script in an interactive terminal so the password can be entered privately.",
    );
  stdout.write("Password (8–72 UTF-8 bytes, hidden): ");
  stdin.setRawMode(true);
  stdin.resume();
  return new Promise((resolve, reject) => {
    let password = "";
    const clean = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
    };
    const onData = (buffer) => {
      for (const char of buffer.toString()) {
        if (char === "\u0003") {
          clean();
          reject(new Error("Cancelled."));
          return;
        }
        if (char === "\r" || char === "\n") {
          clean();
          resolve(password);
          return;
        }
        if (char === "\u007f" || char === "\b")
          password = password.slice(0, -1);
        else if (char >= " ") password += char;
      }
    };
    stdin.on("data", onData);
  });
}
try {
  await mongoose.connect(readConfig().mongoUri);
  if (await Admin.exists({ _id: "administrator" }))
    throw new Error(
      "Administrator already exists. Public registration and replacement are disabled.",
    );
  const rl = createInterface({ input: stdin, output: stdout });
  const email = (await rl.question("Administrator email: "))
    .trim()
    .toLowerCase();
  rl.close();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 250)
    throw new Error("Enter a valid email.");
  const password = await hiddenPassword();
  if (Buffer.byteLength(password) < 8 || Buffer.byteLength(password) > 72)
    throw new Error("Password must contain 8–72 UTF-8 bytes.");
  await Admin.create({
    _id: "administrator",
    email,
    passwordHash: await bcrypt.hash(password, 12),
  });
  console.log("Administrator created. Sign in at /admin.");
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
