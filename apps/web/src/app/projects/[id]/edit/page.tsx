"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, CardHeader, CardContent, Select } from "@fileshare/ui";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import Image from "next/image";
import { ArrowLeft, Save } from "lucide-react";

interface Project {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  summary: string | null;
  category: string | null;
  visibility: string;
  tags: string[];
  repoUrl: string | null;
  websiteUrl: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
}

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [tags, setTags] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ ok: boolean; data: Project }>(`/projects/${id}`);
        setProject(res.data);
        setName(res.data.name);
        setDescription(res.data.description || "");
        setSummary(res.data.summary || "");
        setCategory(res.data.category || "");
        setVisibility(res.data.visibility);
        setTags(res.data.tags?.join(", ") || "");
        setRepoUrl(res.data.repoUrl || "");
        setWebsiteUrl(res.data.websiteUrl || "");
        setIconUrl(res.data.iconUrl || "");
        setBannerUrl(res.data.bannerUrl || "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500">{error || "Project not found"}</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/projects/${id}`, {
        name,
        description: description || undefined,
        summary: summary || undefined,
        category: category || undefined,
        visibility,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        repoUrl: repoUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        iconUrl: iconUrl || undefined,
        bannerUrl: bannerUrl || undefined,
      });
      toast("Project saved", "success");
      router.push(`/projects/${project!.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
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
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/projects/${project.slug}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Edit Project</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update project details for <strong>{project.name}</strong>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Project Details</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. My Launcher"
              />
              <Input
                label="Short Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A brief one-liner about your project"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-gray-100 transition-colors"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full description of your project"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. gaming, tools"
                />
                <Select
                  label="Visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  options={[
                    { value: "PUBLIC", label: "Public" },
                    { value: "PRIVATE", label: "Private" },
                  ]}
                />
              </div>
              <Input
                label="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. launcher, gaming, windows"
                helperText="Separate tags with commas"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Repository URL (optional)"
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
                <Input
                  label="Website URL (optional)"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                />
                <Input
                  label="Icon URL (optional)"
                  type="url"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  helperText="Shown next to project name"
                />
                <Input
                  label="Banner URL (optional)"
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.png"
                  helperText="Large hero image at the top of the project page"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </Button>
                <Link href={`/projects/${project.slug}`}>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
