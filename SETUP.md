# FileShare Setup Guide

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **MySQL** >= 8.0 (running on localhost:3306, or adjust DATABASE_URL)

## Quick Start

### 1. Environment Variables

Copy the example env files and fill in your values:

```bash
# Root (used by the API)
cp .env.example .env

# Database (used by Prisma)
cp packages/database/.env.example packages/database/.env

# Frontend (used by Next.js)
cp apps/web/.env.example apps/web/.env
```

Edit `.env` in the project root:

```env
DATABASE_URL="mysql://your_user:your_password@localhost:3306/fileshare"
JWT_SECRET="generate-a-random-secret-here"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
UPLOAD_DIR="./uploads"
```

The other two env files only need a `DATABASE_URL` (database) and `NEXT_PUBLIC_API_URL=/api` (web) — both are pre-filled correctly.

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client & Create Tables

```bash
npm run db:generate
npm run db:push
```

This creates the `fileshare` database and all required tables in MySQL.

### 4. Build Packages

```bash
npm run build
```

### 5. Start Development

```bash
npm run dev
```

This starts:
- **API** on http://localhost:4000
- **Web** on http://localhost:3000

### 6. Create an Account

Open http://localhost:3000/register and create your account.  
The first user to register is automatically assigned the **ADMIN** role.

---

## Production Build

```bash
# Build everything
npm run build

# Start API
npm run start -w apps/api

# Start Web
npm run start -w apps/web
```

Or use a process manager like PM2 to run both.

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API and Web in development mode |
| `npm run dev:api` | Start API only |
| `npm run dev:web` | Start Web only |
| `npm run build` | Build all packages and apps |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to MySQL |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
