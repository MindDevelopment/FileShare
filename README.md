# FileShare

**Self-hosted platform for sharing and managing software releases.**

FileShare lets you organize files, versions, and releases for your projects — all on your own infrastructure. No file size limits, no bandwidth caps, no third-party dependencies.

---

## Features

- **Release Management** — Organize files into versioned releases with changelogs, version numbers, and categories (Stable / Beta / Alpha)
- **Projects** — Create projects with descriptions, tags, categories, and visibility settings (public or private)
- **File Uploads** — Upload multiple files per release through a simple interface
- **Public Download Page** — Every release gets a shareable link with changelog (Markdown) and download buttons
- **Download Statistics** — Track download counts per file with visual bar charts
- **Dashboard** — Overview of your projects, releases, downloads, and storage usage
- **Admin Panel** — User management, role assignment (ADMIN/USER), and system-wide statistics
- **Authentication** — JWT-based with registration, login, and role-based access control
- **Dark Mode** — Full support for light and dark themes
- **Download Logging** — IP and user-agent recorded for every download

## Tech Stack

| Laag     | Technologie                                    |
| -------- | ---------------------------------------------- |
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, TypeScript |
| Backend  | Express.js, TypeScript                         |
| Database | MySQL + Prisma ORM                             |
| Auth     | JWT (jsonwebtoken) + bcrypt                    |
| Uploads  | Multer                                         |
| Monorepo | npm workspaces + Turborepo                     |

## Architectuur

```
fileshare/
├── apps/
│   ├── api/          # Express API server (port 4000)
│   └── web/          # Next.js frontend (port 6058)
├── packages/
│   ├── shared/       # Gedeelde types en utility functies
│   ├── database/     # Prisma client en schema
│   └── ui/           # Gedeelde React componenten (Button, Card, Badge, etc.)
├── uploads/          # Uploaded bestanden (gitignored)
├── package.json      # Monorepo root
└── turbo.json        # Turborepo configuratie
```

## Data Model

- **User** — username, email, password_hash, role (ADMIN/USER)
- **Project** — naam, slug, beschrijving, tags, visibility (PUBLIC/PRIVATE), links, eigenaar
- **Release** — versie, titel, changelog, type (STABLE/BETA/ALPHA), gekoppeld aan project
- **File** — bestandsnaam, grootte, pad, downloads, checksum, gekoppeld aan release
- **DownloadLog** — IP, user-agent, tijdstip per download

## API Endpoints

| Endpoint                 | Methode | Auth   | Beschrijving                 |
| ------------------------ | ------- | ------ | ---------------------------- |
| `/api/auth/register`     | POST    | -      | Registreer nieuwe gebruiker  |
| `/api/auth/login`        | POST    | -      | Login                        |
| `/api/auth/me`           | GET     | Ja     | Huidige gebruiker ophalen    |
| `/api/projects`          | GET     | -      | Projectenlijst (met filters) |
| `/api/projects/:idOrSlug`| GET     | -      | Projectdetails               |
| `/api/projects`          | POST    | Ja     | Nieuw project                |
| `/api/projects/:id`      | PUT     | Ja     | Project bijwerken            |
| `/api/projects/:id`      | DELETE  | Ja     | Project verwijderen          |
| `/api/releases/create`   | POST    | Ja     | Nieuwe release aanmaken      |
| `/api/releases/upload/:id`| POST   | Ja     | Bestanden uploaden           |
| `/api/releases/:id`      | GET     | -      | Release details ophalen      |
| `/api/releases/:id`      | DELETE  | Ja     | Release verwijderen          |
| `/api/files/download/:id`| GET     | -      | Bestand downloaden           |
| `/api/files/:id`         | DELETE  | Ja     | Bestand verwijderen          |
| `/api/stats/dashboard`   | GET     | Ja     | Dashboard statistieken       |
| `/api/stats/project/:id` | GET     | Ja     | Project downloadstatistieken |
| `/api/admin/users`       | GET     | Admin  | Gebruikerslijst              |
| `/api/admin/users/:id/role`| PUT   | Admin  | Gebruikersrol wijzigen       |
| `/api/admin/users/:id`   | DELETE  | Admin  | Gebruiker verwijderen        |
| `/api/admin/stats`       | GET     | Admin  | Systeemstatistieken          |
| `/api/health`            | GET     | -      | Health check                 |

## Snel Starten

Zie [SETUP.md](SETUP.md) voor volledige instructies.

```bash
# 1. Omgevingsvariabelen instellen
cp .env.example .env

# 2. Afhankelijkheden installeren
npm install

# 3. Database opzetten (MySQL vereist)
npm run db:generate
npm run db:push

# 4. Alles builden
npm run build

# 5. Ontwikkelserver starten
npm run dev
```

- **API**: http://localhost:4000
- **Web**: http://localhost:6058

Het eerste geregistreerde account krijgt automatisch de **ADMIN** rol.

## Commando's

| Commando               | Beschrijving                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start API en Web (ontwikkelmodus)       |
| `npm run dev:api`      | Start alleen de API                     |
| `npm run dev:web`      | Start alleen de Web frontend            |
| `npm run build`        | Build alle packages en apps             |
| `npm run db:generate`  | Genereer Prisma client                  |
| `npm run db:push`      | Push Prisma schema naar MySQL           |
| `npm run db:studio`    | Open Prisma Studio (database GUI)       |
| `npm run lint`         | Lint alle projecten                     |

## Licentie

MIT
