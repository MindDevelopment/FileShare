import { Router, Request, Response } from "express";
import { prisma } from "@fileshare/database";
import { authenticate } from "../middleware/auth";

export const statsRouter = Router();

statsRouter.get("/dashboard", authenticate, async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user!.role === "ADMIN";
    const projectFilter = isAdmin ? {} : { ownerId: req.user!.userId };

    const totalProjects = await prisma.project.count({ where: projectFilter });
    const totalReleases = await prisma.release.count({
      where: { project: projectFilter },
    });

    const files = await prisma.file.findMany({
      where: { release: { project: projectFilter } },
      select: { downloads: true, size: true },
    });

    const totalDownloads = files.reduce((sum, f) => sum + f.downloads, 0);
    const storageUsed = files.reduce((sum, f) => sum + Number(f.size), 0);

    const recentReleases = await prisma.release.findMany({
      where: { project: projectFilter },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        project: { select: { name: true, slug: true } },
        files: { select: { downloads: true } },
      },
    });

    res.json({
      ok: true,
      data: { totalProjects, totalReleases, totalDownloads, storageUsed, recentReleases },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

statsRouter.get("/project/:projectId", authenticate, async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        releases: {
          include: {
            files: true,
            _count: { select: { files: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ ok: false, error: "Project not found" });
    }
    if (project.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    const downloadStats = project.releases.flatMap((r) =>
      r.files.map((f) => ({
        fileId: f.id,
        filename: f.filename,
        downloads: f.downloads,
        releaseVersion: r.version,
        releaseTitle: r.title,
      }))
    );

    const totalDownloads = downloadStats.reduce((sum, d) => sum + d.downloads, 0);

    res.json({
      ok: true,
      data: {
        projectId: project.id,
        projectName: project.name,
        totalDownloads,
        totalReleases: project.releases.length,
        totalFiles: downloadStats.length,
        downloadStats,
      },
    });
  } catch (error) {
    console.error("Project stats error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});
