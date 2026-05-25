"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, CardHeader, CardContent, Badge } from "@fileshare/ui";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  Plus,
  FolderOpen,
  Download,
  LogOut,
  Search,
  Grid3X3,
  List,
  Clock,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: string;
  tags: string[];
  updatedAt: string;
  totalDownloads: number;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function ProjectsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      api
        .get<{ ok: boolean; data: Project[] }>(`/projects?ownerId=${user.id}`)
        .then((res) => setProjects(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [projects, search]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 dark:border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="FileShare"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-bold">FileShare</span>
            </Link>
            <span className="hidden sm:inline text-sm text-gray-400 dark:text-gray-500">/</span>
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">Projects</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/projects/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Project
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => { logout(); router.push("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Projects</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {projects.length} {projects.length === 1 ? "project" : "projects"} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors dark:text-gray-100"
              />
            </div>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="h-8 w-8 text-gray-400" />
              </div>
              {search ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No projects found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No results matching &ldquo;{search}&rdquo;
                  </p>
                  <Button variant="secondary" onClick={() => setSearch("")}>Clear search</Button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No projects yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Create your first project to start sharing files
                  </p>
                  <Link href="/projects/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-1" /> Create Your First Project
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group"
              >
                <Card className="h-full card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge
                        variant={project.visibility === "PUBLIC" ? "success" : "default"}
                        size="sm"
                      >
                        {project.visibility}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {project.totalDownloads} downloads
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(project.updatedAt)}
                      </span>
                    </div>
                    {project.tags.length > 0 && (
                      <div className="flex gap-1 mt-3 flex-wrap">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="default" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group"
              >
                <Card className="card-hover">
                  <CardContent className="py-3 px-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {project.name}
                          </span>
                          <Badge
                            variant={project.visibility === "PUBLIC" ? "success" : "default"}
                            size="sm"
                          >
                            {project.visibility}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        <span>{project.totalDownloads} downloads</span>
                        <span>{timeAgo(project.updatedAt)}</span>
                      </div>
                      {project.tags.length > 0 && (
                        <div className="hidden md:flex gap-1 shrink-0">
                          {project.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="default" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 2 && (
                            <Badge variant="default" size="sm">
                              +{project.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
