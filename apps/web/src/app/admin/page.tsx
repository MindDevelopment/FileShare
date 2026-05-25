"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardHeader, CardContent, Badge } from "@fileshare/ui";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import Image from "next/image";
import { useToast } from "@/lib/toast";
import { StatCardSkeleton } from "@/components/skeleton";
import {
  Users,
  FolderOpen,
  Package,
  HardDrive,
  Download,
  Shield,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { formatBytes } from "@fileshare/shared";

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalReleases: number;
  totalFiles: number;
  totalDownloads: number;
  storageUsed: number;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { projects: number };
}

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }
    if (user?.role === "ADMIN") {
      Promise.all([
        api.get<{ ok: boolean; data: AdminStats }>("/admin/stats"),
        api.get<{ ok: boolean; data: AdminUser[] }>("/admin/users"),
      ])
        .then(([statsRes, usersRes]) => {
          setStats(statsRes.data);
          setUsers(usersRes.data);
        })
        .catch(() => toast("Failed to load admin data", "error"))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router, toast]);

  async function handleToggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast(`User role updated to ${newRole}`, "success");
    } catch {
      toast("Failed to update user role", "error");
    }
  }

  async function handleDeleteUser(userId: string, username: string) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast(`User "${username}" deleted`, "success");
    } catch {
      toast("Failed to delete user", "error");
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Users", value: stats?.totalUsers ?? 0, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Projects", value: stats?.totalProjects ?? 0, icon: FolderOpen, color: "from-emerald-500 to-emerald-600" },
    { label: "Releases", value: stats?.totalReleases ?? 0, icon: Package, color: "from-purple-500 to-purple-600" },
    { label: "Files", value: stats?.totalFiles ?? 0, icon: HardDrive, color: "from-orange-500 to-orange-600" },
    { label: "Downloads", value: stats?.totalDownloads ?? 0, icon: Download, color: "from-pink-500 to-pink-600" },
    { label: "Storage", value: formatBytes(stats?.storageUsed ?? 0), icon: HardDrive, color: "from-teal-500 to-teal-600" },
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
            <span className="text-sm text-gray-400 dark:text-gray-500">/</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { logout(); router.push("/"); }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            System overview and user management
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Users ({users.length})</h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Email</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
                    <th className="text-center px-5 py-3 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Projects</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {u.email}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={u.role === "ADMIN" ? "info" : "default"} size="sm">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-center hidden md:table-cell">
                        {u._count.projects}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleRole(u.id, u.role)}
                          >
                            {u.role === "ADMIN" ? "Demote" : "Promote"}
                          </Button>
                          {u.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
