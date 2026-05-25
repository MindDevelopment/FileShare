"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, CardHeader, CardContent, Badge } from "@fileshare/ui";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton, StatCardSkeleton, ReleaseCardSkeleton } from "@/components/skeleton";
import { formatBytes } from "@fileshare/shared";
import {
  FolderOpen,
  Upload,
  Download,
  HardDrive,
  Plus,
  Package,
  LogOut,
  Activity,
  Clock,
  ArrowRight,
  Shield,
} from "lucide-react";

interface DashboardData {
  totalProjects: number;
  totalReleases: number;
  totalDownloads: number;
  storageUsed: number;
  recentReleases: Array<{
    id: string;
    version: string;
    title: string;
    releaseType: string;
    createdAt: string;
    project: { name: string; slug: string };
  }>;
}

function getBadgeVariant(type: string) {
  if (type === "STABLE") return "success";
  if (type === "BETA") return "warning";
  return "danger";
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

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      const controller = new AbortController();
      api
        .get<{ ok: boolean; data: DashboardData }>("/stats/dashboard")
        .then((res) => setData(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
      return () => controller.abort();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="border-b border-gray-200/60 bg-white/80 dark:bg-gray-900/80 dark:border-gray-800/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3" />
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map((i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardContent className="py-8"><Skeleton className="h-32 w-full" /></CardContent></Card>
            <Card><CardContent className="py-8"><Skeleton className="h-32 w-full" /></CardContent></Card>
          </div>
        </main>
      </div>
    );
  }

  const stats = [
    {
      label: "Projects",
      value: data?.totalProjects ?? 0,
      icon: FolderOpen,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Releases",
      value: data?.totalReleases ?? 0,
      icon: Package,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Downloads",
      value: data?.totalDownloads ?? 0,
      icon: Download,
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Storage Used",
      value: formatBytes(data?.storageUsed ?? 0),
      icon: HardDrive,
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

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
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.username}
              </span>
            </div>
            {user?.role === "ADMIN" && (
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <Shield className="h-4 w-4 mr-1" /> Admin
                </Button>
              </Link>
            )}
            <Link href="/projects/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Project
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { logout(); toast("Logged out", "info"); router.push("/"); }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.username}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Here&apos;s what&apos;s happening with your projects
            </p>
          </div>
          <Link
            href="/projects"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <Icon className={`h-5 w-5 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Quick Upload</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload files to an existing release or browse your projects to get started.
              </p>
              <div className="flex gap-3">
                <Link href="/projects">
                  <Button variant="secondary">
                    <FolderOpen className="h-4 w-4 mr-1" /> Browse Projects
                  </Button>
                </Link>
                <Link href="/projects/new">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> New Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold">Recent Releases</h2>
              </div>
            </CardHeader>
            <CardContent>
              {data?.recentReleases && data.recentReleases.length > 0 ? (
                <div className="space-y-3">
                  {data.recentReleases.map((r) => (
                    <Link
                      key={r.id}
                      href={`/projects/${r.project.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {r.project.name}
                          </span>
                          <Badge variant={getBadgeVariant(r.releaseType)} size="sm">
                            {r.releaseType}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {r.title} — {r.version}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                        {timeAgo(r.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No releases yet</p>
                  <Link
                    href="/projects"
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline mt-1 inline-block"
                  >
                    Create your first project
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
