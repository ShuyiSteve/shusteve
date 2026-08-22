# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_SITE_URL=""
ARG VITE_GITHUB_URL=""
ARG VITE_YOUTUBE_URL=""
ARG VITE_EMAIL=""
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_GITHUB_URL=$VITE_GITHUB_URL \
    VITE_YOUTUBE_URL=$VITE_YOUTUBE_URL \
    VITE_EMAIL=$VITE_EMAIL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
