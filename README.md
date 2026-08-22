# shuSteve

Personal website for **Steve Wang** — a portfolio, blog, photography gallery and vlog hub, designed to be minimal, fast and easy to maintain without ever touching MySQL by hand.

> **Design language:** ~50% Apple/Vercel minimalism, ~30% editorial magazine, ~20% Linear. Lots of whitespace, careful typography, large photography, hairline borders and subtle motion.

---

## ✨ Features

- **Public site** — Home, Blog, Photos (masonry + lightbox), Vlog, About
- **Markdown blog** with categories, cover images, reading time and drafts
- **Photo gallery** with upload, metadata (title / location / date) and fullscreen lightbox
- **Vlog hub** — stores only YouTube metadata, videos stay on YouTube
- **Admin dashboard** at `/admin` with secure login and full CRUD for posts, photos and vlogs
- **Light / dark mode**, fully responsive (mobile → desktop)
- **SEO + Open Graph**, lazy-loaded images, semantic/accessible markup
- **Docker** for local and production, with Nginx + HTTPS-ready config

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS, Framer Motion, Lucide |
| Backend | Go, Gin, GORM |
| Database | MySQL |
| Auth | bcrypt password hashing + JWT in an HttpOnly cookie |
| Deploy | Docker, Docker Compose, Nginx, Let's Encrypt |

---

## 🏗️ Architecture

```
Browser
   │
   ▼
Nginx  (React static files + /api/* proxy)
   ├── /            → React (Vite build)
   ├── /api/*       → Go + Gin
   └── /uploads/*   → Go + Gin (or Object Storage later)
                          │
                          ▼
                        GORM
                          │
                          ▼
                        MySQL
```

**Data flow (public):** React → REST API → Go/Gin → GORM → MySQL
**Data flow (admin):** You → Admin dashboard → React → POST/PUT/DELETE → Go API → GORM → MySQL

---

## 📁 Project Structure

```
shuSteve/
├── frontend/               React + TypeScript + Vite + Tailwind
│   ├── public/             static files (images, favicon, og-image)
│   └── src/
│       ├── components/     Navbar, Footer, Layout, Markdown, Lightbox…
│       ├── pages/          Home, Blog, BlogPost, Photos, Vlog, About, 404
│       ├── admin/          Admin dashboard (login + CRUD)
│       ├── api/            typed API client
│       ├── hooks/          theme, auth, data fetching
│       ├── config/         env-driven configuration
│       └── types/          shared TypeScript types
├── backend/                Go + Gin + GORM
│   ├── cmd/api/main.go     entrypoint
│   ├── config/             env config
│   ├── database/           connection, migrations, seeding
│   ├── models/             User, Post, Photo, Vlog
│   ├── controllers/        HTTP handlers
│   ├── middleware/         auth (JWT) + CORS
│   ├── storage/            storage abstraction (local now, S3/R2 later)
│   ├── routes/             route wiring
│   └── uploads/            local uploaded photos (gitignored)
├── deploy/
│   └── nginx.conf          production Nginx (HTTPS + proxy)
├── docker-compose.yml      full local stack
├── docker-compose.prod.yml production services (backend + MySQL)
└── .env.example            root env template for Docker Compose
```

---

## ✅ Requirements

- **Node.js** ≥ 20
- **Go** ≥ 1.24
- **MySQL** ≥ 8 (or Docker)
- **Docker + Docker Compose** (optional, but recommended)

---

## 🚀 Local Development

### Option A — Docker Compose (simplest)

```bash
cd shuSteve
cp .env.example .env        # edit the passwords/secret first
docker compose up -d --build
```

Then open:

- **Website:** http://localhost:3000
- **Admin:** http://localhost:3000/admin
- **API:** http://localhost:8080/api/health
- **MySQL:** localhost:3307 (user `shusteve`)

To stop:

```bash
docker compose down          # keep data
docker compose down -v       # remove database + uploads volumes too
```

### Option B — Run manually (no Docker)

You need a running MySQL server first (see MySQL Setup below).

**1. Backend**

```bash
cd backend
cp .env.example .env         # edit DB credentials + secrets
go mod download
go run ./cmd/api
# → listening on :8080
```

**2. Frontend** (new terminal)

```bash
cd frontend
cp .env.example .env         # optional
npm install
npm run dev
# → http://localhost:5173
```

Vite proxies `/api` and `/uploads` to the backend automatically, so you never
hit CORS in development.

---

## 🐬 MySQL Setup (manual, Homebrew example)

```bash
brew install mysql
brew services start mysql

# Create the database and user (match backend/.env)
mysql -uroot <<'SQL'
CREATE DATABASE IF NOT EXISTS shusteve CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'shusteve'@'localhost' IDENTIFIED BY 'shusteve_password';
GRANT ALL PRIVILEGES ON shusteve.* TO 'shusteve'@'localhost';
FLUSH PRIVILEGES;
SQL
```

Tables (`users`, `posts`, `photos`, `vlogs`) are created automatically by GORM
on first boot — no manual SQL needed.

---

## 🔐 Environment Variables

Secrets must never be hardcoded. Every service reads from environment variables.

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | API port (default `8080`) |
| `GIN_MODE` | `debug` or `release` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL connection |
| `JWT_SECRET` | secret used to sign sessions — use `openssl rand -base64 48` |
| `TOKEN_TTL_HOURS` | session length (default `72`) |
| `ADMIN_EMAIL` | initial admin email (first boot only) |
| `ADMIN_PASSWORD` | initial admin password (first boot only) |
| `COOKIE_SECURE` | `false` locally, `true` over HTTPS |
| `ALLOWED_ORIGIN` | allowed CORS origin |
| `UPLOAD_DIR` | where uploaded photos are stored |
| `MAX_UPLOAD_MB` | max upload size |
| `SEED_DATA` | `true` seeds placeholder content on first boot |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | leave empty in dev (uses proxy) |
| `VITE_SITE_URL` | canonical site URL (SEO) |
| `VITE_GITHUB_URL` | your GitHub profile |
| `VITE_YOUTUBE_URL` | your YouTube channel |
| `VITE_EMAIL` | your contact email |

---

## 👤 Admin Account Setup

The admin account is created **automatically on first boot** from
`ADMIN_EMAIL` and `ADMIN_PASSWORD`. The password is bcrypt-hashed before it is
written to MySQL. It is never created again on subsequent starts, so you can
safely remove `ADMIN_PASSWORD` afterwards if you like.

1. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` in `backend/.env` (or the
   root `.env` for Docker).
2. Start the backend once.
3. Open `/admin/login` and sign in.

> ⚠️ Change the default credentials before exposing the site publicly.

---

## 🖥️ Using the Admin Dashboard

Open `http://localhost:5173/admin` (manual dev) or `http://localhost:3000/admin`
(Docker).

### Publish a blog post

1. **Dashboard → Blog Posts → New Post**
2. Fill in Title (Slug auto-generates), Description, Category, Cover Image URL.
3. Write the body in **Markdown** (toggle **Preview** to check it).
4. Tick **Publish** and click **Publish post**.

### Upload a photo

1. **Photos → Upload photo**
2. Choose an image (JPG/PNG/WebP, ≤ 10 MB).
3. Add Title, Location and Date.
4. Click **Upload photo**.

### Add a vlog

1. **Vlogs → Add vlog**
2. Paste the **YouTube URL** (title + optional thumbnail/date).
3. Click **Save vlog**.

Everything is written to MySQL automatically — you never touch SQL again.

---

## 🖼️ Replacing Your Profile Photo

- **Location:** `frontend/public/images/profile.jpg`
- **Filename:** keep `profile.jpg` (or update `src/pages/Home.tsx`)
- **Recommended size:** 1200 × 1500 px
- **Recommended ratio:** 4:5 portrait (editorial)
- **How to replace:** overwrite the file, then rebuild/re-run the frontend.

The favicon (`frontend/public/favicon.png`) and Open Graph image
(`frontend/public/images/og-image.png`) can be replaced the same way.

---

## 🔗 Changing Social Links

Edit `frontend/.env`:

```env
VITE_GITHUB_URL=https://github.com/your-username
VITE_YOUTUBE_URL=https://www.youtube.com/@your-channel
VITE_EMAIL=hello@shusteve.com
```

These are read at **build time**, so restart `npm run dev` or rebuild after
changing them.

---

## 🐳 Docker

```bash
docker compose up -d --build      # start everything
docker compose logs -f backend    # follow backend logs
docker compose down               # stop
```

- `frontend` → Nginx on `:3000` (serves React + proxies `/api`, `/uploads`)
- `backend` → Go API on `:8080`
- `mysql` → MySQL on `:3307` (host) / `3306` (internal)

---

## 🛠️ Build

```bash
# Frontend
cd frontend
npm run build          # outputs to frontend/dist

# Backend
cd backend
go build ./...         # compiles all packages
go build -o shusteve-api ./cmd/api
```

---

## 🌍 Production Deployment (Ubuntu + Docker + Nginx)

### 0. Buy a domain

- **shusteve.com** (Namecheap, Porkbun, Cloudflare)
- **shusteve.dev** / **stevewang.dev** (cheap `.dev` TLDs)

### 1. Connect to your server

```bash
ssh root@YOUR_SERVER_IP
```

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

### 3. Clone the project

```bash
apt install -y git
git clone https://github.com/your-username/shusteve.git /opt/shusteve
cd /opt/shusteve
```

### 4. Configure production `.env`

```bash
cp .env.example .env
nano .env
```

Set strong `MYSQL_ROOT_PASSWORD`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, and `DOMAIN=shusteve.com`.

### 5. Start the production services

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This starts **MySQL** and the **Go backend** bound to `127.0.0.1` only.

### 6. Build the React app and install Nginx

```bash
apt install -y nginx
cd /opt/shusteve/frontend
npm ci && npm run build
mkdir -p /var/www/shusteve
cp -r dist/* /var/www/shusteve/

cp /opt/shusteve/deploy/nginx.conf /etc/nginx/sites-available/shusteve
# edit the server_name lines to your real domain
ln -s /etc/nginx/sites-available/shusteve /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 7. Point DNS

Create an `A` record for `@` (and optionally `www`) → your server's IPv4.
If you have IPv6, add an `AAAA` record too.

### 8. Enable HTTPS with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
mkdir -p /var/www/certbot
certbot --nginx -d shusteve.com -d www.shusteve.com
```

Certbot fetches certificates and updates Nginx so that
`http://shusteve.com` → **301** → `https://shusteve.com`.

---

## 🧭 DNS Cheat Sheet

| Record | Name | Value | Purpose |
|---|---|---|---|
| `A` | `@` | server IPv4 | point the root domain to your server |
| `AAAA` | `@` | server IPv6 | IPv6 version of the above |
| `CNAME` | `www` | `shusteve.com` | alias `www` to the root domain |
| `NS` | `@` | registrar's nameservers | usually managed automatically |

---

## 💾 Backup & Restore

### Database (posts, photos metadata, vlogs, user)

```bash
# Backup
docker compose exec -T mysql sh -c \
  'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" shusteve' > backup-$(date +%F).sql

# Restore
cat backup-YYYY-MM-DD.sql | docker compose exec -T mysql sh -c \
  'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" shusteve'
```

Or against a local MySQL install:

```bash
mysqldump -u shusteve -p shusteve > backup.sql
mysql -u shusteve -p shusteve < backup.sql
```

Schedule it with cron, e.g. daily at 03:00:

```cron
0 3 * * * /opt/shusteve/backup.sh
```

### Uploaded photos

Photos live in the `uploads_data` Docker volume (`backend/uploads/` when local).
Back them up by copying the directory:

```bash
tar -czf uploads-backup-$(date +%F).tar.gz -C backend uploads
```

> **When you migrate to Object Storage (Cloudflare R2 / AWS S3):** the storage
> code is already behind a `Storage` interface (`backend/storage/storage.go`).
> Implement `Save` / `Delete` against your provider, swap `LocalStorage` in
> `main.go`, and enable bucket versioning/lifecycle rules for backups.

---

## 🔒 Security Notes

- Passwords are **bcrypt-hashed**; sessions are signed **JWTs in HttpOnly cookies** (`Secure` + `SameSite=Lax` in production).
- All `/api/admin/*` routes require a valid token.
- Input is validated server-side; slugs are sanitized and unique.
- Uploads are size-limited and MIME-sniffed (JPG/PNG/WebP/GIF only).
- CORS uses a specific origin + credentials (never `*`).
- Secrets come only from environment variables — never committed to Git.

---

## 🧹 Troubleshooting

| Problem | Fix |
|---|---|
| `Access denied for user 'shusteve'` | Check `DB_USER`/`DB_PASSWORD` in `.env` and that the MySQL user exists. |
| Port already in use | Change `PORT`, `BACKEND_PORT` or `FRONTEND_PORT`. |
| Backend can't reach MySQL | In Docker use `DB_HOST=mysql`; locally use `127.0.0.1`. |
| Images don't load | Confirm the backend is running and serving `/uploads`. |
| Login fails after restart | The admin is created only on first boot; use the credentials you set then. |

---

## 📄 License

Personal project — do whatever you like with it.
