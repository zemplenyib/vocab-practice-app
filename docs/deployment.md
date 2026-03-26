# Deployment Guide

Continuous deployment via GitHub Actions → Docker → home server.

The `build-and-push` job runs on GitHub's hosted runners (builds the image).
The `deploy` job runs on a **self-hosted runner on your server** (pulls and restarts the container) — no port forwarding or tunnel needed.

## Architecture

```
git push main
  → GitHub Actions (hosted): builds Docker image → pushes to ghcr.io
  → GitHub Actions (self-hosted, on your server): pulls image → docker compose up -d
```

---

## Step 1 — Prepare the server directory

```bash
sudo mkdir -p /srv/vocab
sudo chown $USER:$USER /srv/vocab
```

Copy `compose.yml` to the server (run this on your local machine):

```bash
scp compose.yml youruser@yourserver:/srv/vocab/compose.yml
```

## Step 2 — Install the GitHub Actions self-hosted runner

1. Go to your GitHub repo → **Settings** → **Actions** → **Runners** → **New self-hosted runner**
2. Select **Linux** and **x64**
3. Follow the commands GitHub shows you — they look like:

```bash
# On the server
mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/download/v2.x.x/actions-runner-linux-x64-2.x.x.tar.gz
tar xzf actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/YOUR_ORG/YOUR_REPO --token YOUR_TOKEN
```

> Copy the exact commands from GitHub — the token is unique and short-lived.

4. Install as a system service so it starts on boot:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

Verify it's running — back in GitHub the runner should show as **Idle** (green).

## Step 3 — Give the runner user access to Docker

```bash
sudo usermod -aG docker $USER
# Log out and back in for the group change to take effect
```

If the runner runs as a different user (e.g. `svc_runner`), apply to that user instead.

## Step 4 — First deploy

Push any commit to `main`:

```bash
git push origin main
```

Watch the **Actions** tab on GitHub. The workflow has two jobs:
- `Build image` — runs on GitHub's servers (~2-3 min)
- `Deploy to server` — runs on your server, pulls the new image and restarts

## Checking the running container

```bash
cd /srv/vocab
docker compose ps
docker compose logs -f
```

## Database

The SQLite database is bind-mounted from the host at `/srv/vocab/vocab.db`. It persists across container restarts and image updates.

**Manual backup:**
```bash
cp /srv/vocab/vocab.db /srv/vocab/vocab.db.bak
```

**Automatic daily backup via cron:**
```bash
crontab -e
# Add:
0 3 * * * cp /srv/vocab/vocab.db /srv/vocab/vocab.db.$(date +\%Y\%m\%d).bak
```

## Exposing via Nginx Proxy Manager

Add a proxy host in Nginx Proxy Manager:

- **Domain**: `vocab.yourdomain.com` (once you have a domain)
- **Forward hostname/IP**: `localhost`
- **Forward port**: `3000`
- Enable SSL via Let's Encrypt

## Later: migrating to Cloudflare Tunnel

When you have a domain, the `deploy` job can move back to `runs-on: ubuntu-latest` and SSH into the server via a Cloudflare Tunnel instead of using a self-hosted runner. The rest of the workflow stays the same.
