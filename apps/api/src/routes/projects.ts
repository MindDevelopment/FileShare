import { Router, Request, Response } from "express";
import { prisma } from "@fileshare/database";
import { slugify } from "@fileshare/shared";
import { authenticate } from "../middleware/auth";

function parseTags(t: string): string[] {
  try { return JSON.parse(t); } catch { return []; }
}

export const projectsRouter = Router();

projectsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { visibility, search, ownerId } = req.query;
    const where: Record<string, unknown> = {};

    if (visibility) where.visibility = visibility;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: { select: { releases: true } },
        releases: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { files: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const data = projects.map((p) => ({
      ...p,
      tags: parseTags(p.tags as string),
      totalDownloads: p.releases.reduce(
        (sum, r) => sum + r.files.reduce((s, f) => s + f.downloads, 0),
        0
      ),
      latestRelease: p.releases[0] || null,
    }));

    res.json({ ok: true, data });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

projectsRouter.get("/:idOrSlug", async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        owner: { select: { id: true, username: true } },
        releases: {
          orderBy: { createdAt: "desc" },
          include: {
            files: true,
            _count: { select: { files: true } },
          },
        },
        _count: { select: { releases: true } },
      },
    });

    if (!project) {
      return res.status(404).json({ ok: false, error: "Project not found" });
    }

    const totalDownloads = project.releases.reduce(
      (sum, r) => sum + r.files.reduce((s, f) => s + f.downloads, 0),
      0
    );

    res.json({
      ok: true,
      data: { ...project, tags: parseTags(project.tags as string), totalDownloads },
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

projectsRouter.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { name, description, summary, category, visibility, tags, repoUrl, websiteUrl, iconUrl, bannerUrl } = req.body;
    if (!name) {
      return res.status(400).json({ ok: false, error: "Project name is required" });
    }

    let slug = slugify(name);
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const project = await prisma.project.create({
      data: {
        ownerId: req.user!.userId,
        name,
        slug,
        description,
        summary,
        category,
        visibility: visibility || "PUBLIC",
        tags: JSON.stringify(tags || []),
        repoUrl,
        websiteUrl,
        iconUrl,
        bannerUrl,
      },
    });

    res.status(201).json({ ok: true, data: { ...project, tags: parseTags(project.tags as string) } });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

projectsRouter.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ ok: false, error: "Project not found" });
    }
    if (project.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    const { name, description, summary, category, visibility, tags, repoUrl, websiteUrl, iconUrl, bannerUrl } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (summary !== undefined) data.summary = summary;
    if (category !== undefined) data.category = category;
    if (visibility !== undefined) data.visibility = visibility;
    if (tags !== undefined) data.tags = JSON.stringify(tags);
    if (repoUrl !== undefined) data.repoUrl = repoUrl;
    if (websiteUrl !== undefined) data.websiteUrl = websiteUrl;
    if (iconUrl !== undefined) data.iconUrl = iconUrl;
    if (bannerUrl !== undefined) data.bannerUrl = bannerUrl;

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ ok: true, data: { ...updated, tags: parseTags(updated.tags as string) } });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

projectsRouter.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      return res.status(404).json({ ok: false, error: "Project not found" });
    }
    if (project.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ ok: false, error: "Not authorized" });
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ ok: true, data: { message: "Project deleted" } });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});
