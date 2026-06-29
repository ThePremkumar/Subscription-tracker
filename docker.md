# 🐳 Docker — Containerization

This folder contains Dockerfiles for containerizing the frontend and backend applications.

## Structure

```
├── backend/
│   └── Dockerfile         # Node.js backend image
├── frontend/
│   ├── Dockerfile         # React frontend image (multi-stage)
│   └── nginx.conf         # Nginx reverse proxy config
└── docker-compose.yml     # Local development setup
```

## Backend Dockerfile

Multi-stage not needed — Node.js runs directly:

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "app.js"]
```

## Frontend Dockerfile

Two-stage build — build React then serve with Nginx:

```dockerfile
# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Nginx Configuration

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://backend:3000;  # no trailing slash!
    }
}
```

## docker-compose.yml (Local Dev)

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env.production.local
    networks:
      - app-network

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Commands

```bash
# Build and start locally
docker-compose up --build -d

# Check running containers
docker ps

# View logs
docker logs subsription_tracker_backend
docker logs subsription_tracker_frontend

# Push to DockerHub
docker tag subscriptiontracker-backend:latest thepremkumar/subscriptiontracker-backend:v1
docker push thepremkumar/subscriptiontracker-backend:v1
```

## Key Learnings

- Vite env vars are baked at **build time** — set `VITE_API_URL` before building
- Use relative path `/api/v1` as baseURL — Nginx proxies to backend
- No trailing slash in `proxy_pass` — avoids path stripping
- `credentials: true` cannot be used with `origin: '*'` in CORS
- `prom-client` must be installed before importing