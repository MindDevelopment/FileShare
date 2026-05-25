import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Server, Lock, Zap, Globe, Download, Users } from "lucide-react";

const features = [
  {
    icon: Server,
    title: "Self-Hosted",
    description: "Full control over your data. Deploy on your own infrastructure with no third-party dependencies.",
  },
  {
    icon: Lock,
    title: "Secure Sharing",
    description: "Token-based authentication with role-based access control for your projects and releases.",
  },
  {
    icon: Zap,
    title: "Fast Downloads",
    description: "Direct file serving with no artificial speed limits. Your infrastructure, your bandwidth.",
  },
  {
    icon: Globe,
    title: "Public & Private",
    description: "Share projects publicly or keep them private. Granular control over visibility.",
  },
  {
    icon: Download,
    title: "Release Management",
    description: "Organize files into versioned releases with changelogs, tags, and categories.",
  },
  {
    icon: Users,
    title: "Team Ready",
    description: "Multi-user support with admin roles. Collaborate on projects securely.",
  },
];

const stats = [
  { value: "Unlimited", label: "File Size" },
  { value: "Your Own", label: "Infrastructure" },
  { value: "Open Source", label: "Code" },
  { value: "No Limits", label: "Bandwidth" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl dark:bg-gray-950/80 dark:border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="FileShare"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold">FileShare</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm shadow-blue-500/20"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden" style={{ minHeight: "70vh" }}>
          <div className="absolute inset-0">
            <Image
              src="/banner.png"
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-gray-950 dark:via-gray-950/70 dark:to-transparent" />
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything you need for{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  file distribution
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                A complete platform for managing and sharing your software releases, built for developers and teams.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group relative p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="FileShare"
                width={24}
                height={24}
                className="rounded"
              />
              <span className="text-sm font-semibold">FileShare</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Self-hosted file sharing platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
