import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

(BigInt.prototype as unknown as Record<string, unknown>).toJSON = function () {
  return Number(this);
};

const ROOT = path.resolve(__dirname, "../../..");
export const UPLOAD_DIR = path.resolve(ROOT, process.env.UPLOAD_DIR || "./uploads");
