import { Router, Request, Response } from "express";
import { prisma } from "@fileshare/database";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

export const releasesRouter = Router();

releasesRouter.post("/create", authenticate, async (req: Request, res: Response) => {
  try {
    const { projectId, version, title, changelog, releaseType } = req.body;
    if (!projectId || !version || !title) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ ok: false, error: "Project not found" });
    }
    if (project.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    const release = await prisma.release.create({
      data: {
        projectId,
        version,
        title,
        changelog,
        releaseType: releaseType || "STABLE",
      },
    });

    res.status(201).json({ ok: true, data: release });
  } catch (error) {
    console.error("Create release error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

releasesRouter.post("/upload/:releaseId", authenticate, upload.array("files", 10), async (req: Request, res: Response) => {
  try {
    const { releaseId } = req.params;
    const release = await prisma.release.findUnique({
      where: { id: releaseId },
      include: { project: true },
    });
    if (!release) {
      return res.status(404).json({ ok: false, error: "Release not found" });
    }
    if (release.project.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    const files = req.files as Express.Multer.File[];
    const created = await Promise.all(
      files.map((f) =>
        prisma.file.create({
          data: {
            releaseId,
            filename: f.originalname,
            size: f.size,
            path: f.path,
            checksum: null,
          },
        })
      )
    );

    res.status(201).json({ ok: true, data: created });
  } catch (error) {
    console.error("Upload files error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

releasesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const release = await prisma.release.findUnique({
      where: { id: req.params.id },
      include: {
        files: true,
        project: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!release) {
      return res.status(404).json({ ok: false, error: "Release not found" });
    }

    res.json({ ok: true, data: release });
  } catch (error) {
    console.error("Get release error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

releasesRouter.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const release = await prisma.release.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!release) {
      return res.status(404).json({ ok: false, error: "Release not found" });
    }
    if (release.project.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    await prisma.release.delete({ where: { id: req.params.id } });
    res.json({ ok: true, data: { message: "Release deleted" } });
  } catch (error) {
    console.error("Delete release error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});
