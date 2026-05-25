import { Router, Request, Response } from "express";
import { prisma } from "@fileshare/database";
import { authenticate } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.use(authenticate);

adminRouter.use((req: Request, res: Response, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ ok: false, error: "Admin access required" });
  }
  next();
});

adminRouter.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ ok: true, data: users });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

adminRouter.put("/users/:id/role", async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role || !["ADMIN", "USER"].includes(role)) {
      return res.status(400).json({ ok: false, error: "Invalid role" });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, username: true, email: true, role: true },
    });
    res.json({ ok: true, data: user });
  } catch (error) {
    console.error("Admin update user role error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

adminRouter.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true, data: { message: "User deleted" } });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

adminRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProjects = await prisma.project.count();
    const totalReleases = await prisma.release.count();
    const totalFiles = await prisma.file.count();
    const totalDownloads = await prisma.file.aggregate({
      _sum: { downloads: true },
    });
    const storageUsed = await prisma.file.aggregate({
      _sum: { size: true },
    });
    res.json({
      ok: true,
      data: {
        totalUsers,
        totalProjects,
        totalReleases,
        totalFiles,
        totalDownloads: totalDownloads._sum.downloads || 0,
        storageUsed: Number(storageUsed._sum.size) || 0,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});
