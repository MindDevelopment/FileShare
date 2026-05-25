import { Router, Request, Response } from "express";
import path from "path";
import { prisma } from "@fileshare/database";
import { authenticate } from "../middleware/auth";

export const filesRouter = Router();

filesRouter.get("/download/:fileId", async (req: Request, res: Response) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId },
      include: {
        release: {
          include: { project: true },
        },
      },
    });

    if (!file) {
      return res.status(404).json({ ok: false, error: "File not found" });
    }

    if (file.release.project.visibility === "PRIVATE") {
      const token = req.query.token;
      if (!token) {
        return res.status(401).json({ ok: false, error: "Private project requires token" });
      }
    }

    await prisma.file.update({
      where: { id: file.id },
      data: { downloads: { increment: 1 } },
    });

    await prisma.downloadLog.create({
      data: {
        fileId: file.id,
        ip: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    const filePath = path.resolve(file.path);
    res.download(filePath, file.filename);
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

filesRouter.delete("/:fileId", authenticate, async (req: Request, res: Response) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId },
      include: { release: { include: { project: true } } },
    });
    if (!file) {
      return res.status(404).json({ ok: false, error: "File not found" });
    }
    if (file.release.project.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    await prisma.file.delete({ where: { id: req.params.fileId } });
    res.json({ ok: true, data: { message: "File deleted" } });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});
