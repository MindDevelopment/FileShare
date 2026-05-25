"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, CardHeader, CardContent, Badge, Input, Select } from "@fileshare/ui";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { ThemeToggle } from "@/components/theme-toggle";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Download,
  Trash2,
  Upload,
  Package,
  ExternalLink,
  Globe,
  Tag,
  ChevronDown,
  ChevronUp,
  Clock,
  FileUp,
  X,
  ArrowLeft,
  AlertCircle,
  Share2,
  BarChart3,
  Shield,
  Pencil,
} from "lucide-react";

interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  summary: string | null;
  category: string | null;
  visibility: string;
  tags: string[];
  iconUrl: string | null;
  bannerUrl: string | null;
  repoUrl: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; username: string };
  totalDownloads: number;
  releases: ReleaseDetail[];
}

interface ReleaseDetail {
  id: string;
  version: string;
  title: string;
  changelog: string | null;
  releaseType: string;
  createdAt: string;
  files: Array<{
    id: string;
    filename: string;
    size: number;
    downloads: number;
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

function getBadgeVariant(type: string) {
  if (type === "STABLE") return "success";
  if (type === "BETA") return "warning";
  return "danger";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewRelease, setShowNewRelease] = useState(false);
  const [version, setVersion] = useState("");
  const [releaseTitle, setReleaseTitle] = useState("");
  const [changelog, setChangelog] = useState("");
  const [releaseType, setReleaseType] = useState("STABLE");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [error, setError] = useState("");
  const [expandedReleases, setExpandedReleases] = useState<Set<string>>(new Set());
  const [downloadStats, setDownloadStats] = useState<{ filename: string; downloads: number }[] | null>(null);
  const [showStats, setShowStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadProject() {
    try {
      const slug = params.id as string;
      const res = await api.get<{ ok: boolean; data: ProjectDetail }>(
        `/projects/${slug}`
      );
      setProject(res.data);
    } catch {
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, [params.id]);

  async function handleCreateRelease(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;
    setError("");
    try {
      const res = await api.post<{ ok: boolean; data: { id: string } }>(
        "/releases/create",
        {
          projectId: project.id,
          version,
          title: releaseTitle,
          changelog: changelog || undefined,
          releaseType,
        }
      );

      if (selectedFiles && selectedFiles.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append("files", selectedFiles[i]);
        }
        setUploading(true);
        await api.upload(`/releases/upload/${res.data.id}`, formData);
      }

      setShowNewRelease(false);
      setVersion("");
      setReleaseTitle("");
      setChangelog("");
      setReleaseType("STABLE");
      setSelectedFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadProject();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create release");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteProject() {
    if (!project || !confirm("Delete this project permanently? This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${project.id}`);
      router.push("/projects");
    } catch {
      setError("Failed to delete project");
    }
  }

  async function handleDeleteRelease(releaseId: string) {
    if (!confirm("Delete this release? All associated files will be removed.")) return;
    try {
      await api.delete(`/releases/${releaseId}`);
      loadProject();
    } catch {
      setError("Failed to delete release");
    }
  }

  function toggleRelease(id: string) {
    setExpandedReleases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isOwner = user && project && (user.id === project.owner.id || user.role === "ADMIN");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 dark:border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/projects"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-lg font-bold truncate">{project.name}</h1>
                <Badge
                  variant={project.visibility === "PUBLIC" ? "success" : "default"}
                  size="sm"
                >
                  {project.visibility}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Download className="h-4 w-4" />
                {project.totalDownloads}
              </span>
              {isOwner && (
                <>
                  <Button size="sm" onClick={() => setShowNewRelease(true)}>
                    <Upload className="h-4 w-4 mr-1" /> New Release
                  </Button>
                  <Link href={`/projects/${project.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="danger" size="sm" onClick={handleDeleteProject}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {project.bannerUrl && (
          <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-6">
            <Image
              src={project.bannerUrl}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-start gap-4 mb-3">
              {project.iconUrl && (
                <Image
                  src={project.iconUrl}
                  alt={project.name}
                  width={64}
                  height={64}
                  className="rounded-xl shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
                </div>
              </div>
            </div>
            {!project.iconUrl && project.description && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="default" size="sm">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Globe className="h-3 w-3" /> Website
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <ExternalLink className="h-3 w-3" /> Repository
                  </a>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  by {project.owner.username}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  <Clock className="h-3 w-3 inline mr-0.5" />
                  {timeAgo(project.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {project.releases.length > 0 && (
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => {
                const link = `${window.location.origin}/download/${project.releases[0].id}`;
                navigator.clipboard.writeText(link).then(() => {
                  toast("Download link copied to clipboard", "success");
                }).catch(() => {
                  toast("Failed to copy link", "error");
                });
              }}
            >
              <Card className="card-hover">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Share Latest Release</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Click to copy download link</p>
                  </div>
                </CardContent>
              </Card>
            </button>
          )}
          {isOwner && (
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => {
                if (!showStats) {
                  api
                    .get<{ ok: boolean; data: { downloadStats: { filename: string; downloads: number }[] } }>(
                      `/stats/project/${project.id}`
                    )
                    .then((res) => setDownloadStats(res.data.downloadStats))
                    .catch(() => toast("Failed to load stats", "error"));
                }
                setShowStats(!showStats);
              }}
            >
              <Card className="card-hover">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Download Statistics</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View file download counts</p>
                  </div>
                </CardContent>
              </Card>
            </button>
          )}
        </div>

        {showStats && downloadStats && (
          <Card className="mb-6 animate-in">
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Download Statistics
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {downloadStats.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No downloads yet</p>
                ) : (
                  downloadStats.map((stat) => {
                    const maxDownloads = Math.max(...downloadStats.map((s) => s.downloads), 1);
                    const pct = (stat.downloads / maxDownloads) * 100;
                    return (
                      <div key={stat.filename} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate text-gray-700 dark:text-gray-300">{stat.filename}</span>
                          <span className="font-medium tabular-nums text-gray-500 dark:text-gray-400">{stat.downloads}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {showNewRelease && isOwner && (
          <Card className="mb-6 border-blue-200 dark:border-blue-900 animate-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  New Release
                </h2>
                <button
                  onClick={() => setShowNewRelease(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRelease} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    required
                    placeholder="e.g. v1.0.0"
                  />
                  <Select
                    label="Release Type"
                    value={releaseType}
                    onChange={(e) => setReleaseType(e.target.value)}
                    options={[
                      { value: "STABLE", label: "Stable" },
                      { value: "BETA", label: "Beta" },
                      { value: "ALPHA", label: "Alpha" },
                    ]}
                  />
                </div>
                <Input
                  label="Release Title"
                  value={releaseTitle}
                  onChange={(e) => setReleaseTitle(e.target.value)}
                  required
                  placeholder="What's new in this release?"
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Changelog
                  </label>
                  <textarea
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-gray-100 transition-colors"
                    rows={3}
                    placeholder="List the changes in this release..."
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                    <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Drop files here or click to browse
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                      ZIP, RAR, 7Z, EXE, DEB, AppImage (max 500 MB each)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900/70 cursor-pointer"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                    />
                    {selectedFiles && selectedFiles.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" loading={uploading}>
                    <Upload className="h-4 w-4 mr-1" /> Create Release
                  </Button>
                  <Button variant="ghost" onClick={() => setShowNewRelease(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            Releases ({project.releases.length})
          </h2>
        </div>

        {project.releases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No releases yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {isOwner ? "Create your first release to share files" : "No releases have been published yet"}
              </p>
              {isOwner && (
                <Button onClick={() => setShowNewRelease(true)}>
                  <Upload className="h-4 w-4 mr-1" /> Create First Release
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {project.releases.map((release) => {
              const isExpanded = expandedReleases.has(release.id);
              return (
                <Card key={release.id} className="overflow-hidden">
                  <button
                    onClick={() => toggleRelease(release.id)}
                    className="w-full text-left"
                  >
                    <CardContent className="py-3 px-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold truncate">{release.title}</span>
                            <Badge
                              variant={getBadgeVariant(release.releaseType)}
                              size="sm"
                            >
                              {release.releaseType}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                              {release.version}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                            {release.files.length} file{release.files.length !== 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                            {timeAgo(release.createdAt)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-800 animate-slide-up">
                      <div className="px-5 py-4 space-y-3">
                        {release.changelog && (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{release.changelog}</ReactMarkdown>
                          </div>
                        )}

                        {release.files.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Files
                            </p>
                            {release.files.map((file) => (
                              <a
                                key={file.id}
                                href={`${API_URL}/files/download/${file.id}`}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                                  <span className="text-sm font-medium truncate">
                                    {file.filename}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {formatFileSize(file.size)}
                                  </span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {file.downloads} dl
                                  </span>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Released {timeAgo(release.createdAt)}
                          </span>
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRelease(release.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
