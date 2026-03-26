# Release & Deploy Workflow

## Day-to-day development

Push freely to any branch. On every push and pull request, the **CI** workflow runs automatically:
- Builds the Docker image
- Starts the container and hits `/api/health` to verify the app starts correctly

No deploy happens until you explicitly create a release.

## Releasing a new version

When you're happy with what's on `main` and want to deploy to the server:

```bash
# Make sure you're on main and up to date
git checkout main && git pull

# Create a release (auto-generates release notes from commit messages)
gh release create v1.2.0 --generate-notes
```

This triggers the **Deploy** workflow automatically:
1. Builds a new Docker image tagged with the version (e.g. `v1.2.0`) and `latest`
2. Pushes it to GitHub Container Registry (ghcr.io)
3. Self-hosted runner on the server pulls the new image and restarts the container

## Versioning convention

Use [semantic versioning](https://semver.org): `vMAJOR.MINOR.PATCH`

| Change | Example |
|---|---|
| Bug fix | `v1.0.1` |
| New feature | `v1.1.0` |
| Breaking change | `v2.0.0` |

## Checking a deploy

After releasing, watch the Actions tab on GitHub for the Deploy workflow.
Once it completes, verify on the server:

```bash
cd /srv/vocab
docker compose ps
docker compose logs -f
```

## Rolling back

If a release is broken, redeploy the previous image:

```bash
# On the server
cd /srv/vocab
docker compose down
docker run -d ... ghcr.io/YOUR_USERNAME/vocab-practice-app:v1.1.0
```

Or create a new patch release with the fix — preferred since it keeps the release history clean.
