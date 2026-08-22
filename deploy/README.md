# Deployment assets

- `nginx.conf` — production Nginx config (HTTP→HTTPS redirect, TLS, static
  files, and `/api` + `/uploads` proxying to the Go backend).
- Build the React app to `/var/www/shusteve` on the server (see the root
  README → "Production Deployment").
