"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, Badge } from "@fileshare/ui";
import { api } from "@/lib/api";
import { Download, Package, Calendar, FileDown } from "lucide-react";

interface ReleaseDetail {
  id: string;
  version: string;
  title: string;
  changelog: string | null;
  releaseType: string;
  createdAt: string;
  project: { id: string; name: string; slug: string; visibility: string };
  files: Array<{
    id: string;
    filename: string;
    size: number;
    downloads: number;
  }>;
}

function getBadgeVariant(type: string) {
  if (type === "STABLE") return "success";
  if (type === "BETA") return "warning";
  return "danger";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function PublicDownloadPage() {
  const params = useParams();
  const [release, setRelease] = useState<ReleaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ ok: boolean; data: ReleaseDetail }>(`/releases/${params.releaseId}`)
      .then((res) => setRelease(res.data))
      .catch(() => setRelease(null))
      .finally(() => setLoading(false));
  }, [params.releaseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 px-4">
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Release not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            This release may have been removed or the link is invalid.
          </p>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-8 animate-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Download className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {release.project.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
            {release.title}
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <Badge variant={getBadgeVariant(release.releaseType)}>
              {release.releaseType}
            </Badge>
            <span>{release.version}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(release.createdAt)}
            </span>
          </div>
        </div>

        {release.changelog && (
          <Card className="mb-6">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Changelog
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{release.changelog}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Download Files
            </h2>
            <div className="space-y-2">
              {release.files.map((file) => (
                <a
                  key={file.id}
                  href={`/api/files/download/${file.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileDown className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{file.filename}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} — {file.downloads} downloads
                      </p>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
          Powered by FileShare — Self-hosted file sharing platform
        </p>
      </div>
    </div>
  );
}
