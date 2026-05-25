export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
}

export interface ProjectRequest {
  name: string;
  description?: string;
  summary?: string;
  category?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  tags?: string[];
  repoUrl?: string;
  websiteUrl?: string;
}

export interface ProjectResponse {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  summary: string | null;
  category: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  tags: string[];
  iconUrl: string | null;
  bannerUrl: string | null;
  repoUrl: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
  totalDownloads?: number;
  latestRelease?: ReleaseResponse;
}

export interface ReleaseRequest {
  version: string;
  title: string;
  changelog?: string;
  releaseType?: "STABLE" | "BETA" | "ALPHA";
}

export interface ReleaseResponse {
  id: string;
  projectId: string;
  version: string;
  title: string;
  changelog: string | null;
  releaseType: "STABLE" | "BETA" | "ALPHA";
  createdAt: string;
  files: FileResponse[];
}

export interface FileResponse {
  id: string;
  releaseId: string;
  filename: string;
  size: number;
  downloads: number;
  checksum: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalReleases: number;
  totalDownloads: number;
  storageUsed: number;
  recentReleases: ReleaseResponse[];
}
