# Orbit — Production Single-VM Deployment Runbook

This guide details the end-to-end production deployment process for Orbit targeting a single virtual machine (VM) running Docker and Docker Compose.

---

## 1. Prerequisites

### 1.1 VM Host Requirements

- **Operating System:** Ubuntu 22.04 LTS or 24.04 LTS (recommended)
- **Minimum Compute:** 2 vCPU, 2 GB RAM, 25 GB SSD
- **Network Ports Open:**
  - `80` (HTTP - Public Web Entry via Nginx)
  - `443` (HTTPS - TLS termination if using Reverse Proxy / Cloudflare)
  - `3001` (Internal API port, optional host binding)
  - `22` (SSH Access)

### 1.2 Host Software Dependencies

Ensure Docker Engine and the Docker Compose V2 plugin are installed on the host VM:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

---

## 2. Production `.env` Environment Configuration

Create a `.env` file in the root `/orbit` repository directory on the host VM. All required variables listed below must be set with valid production values (the API will fail fast at boot if any required key is missing when `NODE_ENV=production`):

```ini
# ─── Database ───────────────────────────────────────
DATABASE_URL=postgresql://orbit:<SECURE_PASSWORD>@postgres:5432/orbit

# ─── Redis ──────────────────────────────────────────
REDIS_URL=redis://redis:6379

# ─── API & Environment ──────────────────────────────
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://orbit.yourdomain.com

# ─── Auth (Clerk Production Keys) ───────────────────
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# ─── Frontend Build & Routing ────────────────────────
VITE_API_URL=/api
VITE_WS_URL=wss://orbit.yourdomain.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# ─── Storage (Cloudflare R2 - Optional) ──────────────
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=orbit-uploads
R2_PUBLIC_URL=

# ─── AI Integration (OpenAI - Optional) ──────────────
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

---

## 3. Initial First Deployment Procedure

1. **Clone Repository on VM:**
   ```bash
   git clone https://github.com/Sairaj567/orbit.git /opt/orbit
   cd /opt/orbit
   ```
2. **Configure Environment:**
   ```bash
   cp .env.example .env
   nano .env # Fill in production credentials
   ```
3. **Build & Start Container Stack:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
4. **Verify Health Status:**
   ```bash
   curl -i http://localhost/health
   ```
   _Expected Response (`200 OK`):_
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-07-26T23:30:00.000Z",
     "checks": {
       "api": "healthy",
       "database": "healthy",
       "redis": "healthy"
     }
   }
   ```

---

## 4. Subsequent Deployments & Automated Migrations

During subsequent deployments, `prisma migrate deploy` runs automatically inside the API container's production entrypoint (`docker/docker-entrypoint.sh`) before NestJS initializes.

To deploy updates:

```bash
cd /opt/orbit
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 5. Automated Database Backups & Recovery Procedure

### 5.1 Host Cron Backup Schedule

Automate daily database backups by installing a host crontab entry:

```bash
# Edit host crontab
crontab -e
```

Add the following line to execute daily backups at 02:00 AM UTC:

```cron
0 2 * * * /bin/bash /opt/orbit/scripts/backup-db.sh >> /var/log/orbit-backup.log 2>&1
```

### 5.2 Restoration Procedure

In the event of database corruption or data recovery:

```bash
# List available timestamped backups
ls -lh /opt/orbit/backups/

# Restore specified backup dump
/bin/bash /opt/orbit/scripts/restore-db.sh /opt/orbit/backups/orbit_db_YYYYMMDD_HHMMSS.sql.gz
```

---

## 6. Rollback Procedure for Bad Deployments

If a newly deployed release contains critical issues:

1. **Restore Previous Database State (if database schema changed):**
   ```bash
   /bin/bash /opt/orbit/scripts/restore-db.sh /opt/orbit/backups/pre_deploy_backup.sql.gz
   ```
2. **Checkout Known Good Git Release / Commit Tag:**
   ```bash
   git checkout <LAST_STABLE_TAG_OR_COMMIT>
   ```
3. **Rebuild and Restart Stack:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
