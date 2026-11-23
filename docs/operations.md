# ResumeForge Operations Guide

This guide covers the self-hosted, single-instance SQLite deployment. Commands use **Bash on Linux**. Never operate multiple API replicas against the same SQLite file.

## Deploy With Docker Compose

```bash
git clone https://github.com/sm-joe/resumeforge-ats-resume.git
cd resumeforge-ats-resume
docker compose -f deploy/compose/compose.yaml up -d --build --wait
docker compose -f deploy/compose/compose.yaml ps
curl --fail http://127.0.0.1:8000/health
```

The application is available at `http://localhost:3000`. The API development port binds to `127.0.0.1:8000`. Do not publish either service directly over an unencrypted public network: add HTTPS termination and access controls first.

## Back Up The SQLite Database

Resume data is personal information. Use a trusted encrypted storage location with restricted permissions. Stop writers before copying the SQLite database:

```bash
mkdir -p backups
chmod 700 backups
umask 077

docker compose -f deploy/compose/compose.yaml stop web api
docker run --rm \
  -v resumeforge_data:/data:ro \
  -v "$PWD/backups:/backup" \
  alpine:3.21 \
  tar -czf /backup/resumeforge-data.tar.gz -C /data .

docker compose -f deploy/compose/compose.yaml start api web
```

Verify the backup archive is readable before deleting older copies:

```bash
tar -tzf backups/resumeforge-data.tar.gz
```

## Restore From A Trusted Backup

**This overwrites the existing SQLite database.** Make a second backup of the current volume first and ensure no application writers are running.

```bash
docker compose -f deploy/compose/compose.yaml stop web api
docker run --rm \
  -v resumeforge_data:/data \
  -v "$PWD/backups:/backup:ro" \
  alpine:3.21 \
  sh -c 'rm -f /data/resumeforge.db /data/resumeforge.db-shm /data/resumeforge.db-wal && tar -xzf /backup/resumeforge-data.tar.gz -C /data'

docker compose -f deploy/compose/compose.yaml start api web
curl --fail http://127.0.0.1:8000/health
```

The ownership capability is browser-held, not stored in the database. Database restoration does **not** restore a browser's ownership key. Keep the original browser storage intact, or import JSON resume backups under a new browser key.

## Kubernetes (Development Or Single-Replica Self-Hosting)

```bash
kubectl apply -k deploy/kubernetes
kubectl -n resumeforge get pvc resumeforge-data
kubectl -n resumeforge get pods
kubectl -n resumeforge rollout status deployment/resumeforge-api
```

A 2 GiB ReadWriteOnce persistent volume is requested by the API. Configure a compatible storage class and an appropriate backup mechanism before deployment. The deployment mounts the data volume at `/app/data` and uses **one API replica** to avoid concurrent SQLite writers. API rollouts stop the old pod before starting the replacement, so brief API downtime is expected.

Replace the sample `resumeforge-api:local` and `resumeforge-web:local` image references with immutable tested release images. The sample ingress host `resumeforge.local` is for development only. Configure TLS, ingress DNS and proper network controls before internet exposure. Do not assume the sample Kubernetes configuration is production multi-tenant infrastructure.

## Release Acceptance

Run the manually dispatched **Release Security & Docker Validation** and **CodeQL Pipeline** workflows against the exact release commit. Inspect Trivy, dependency audits, Playwright browser tests, Word/PDF exports and API persistence results. Record the tested image digests and rollback procedure. Never publish a stable release on the basis of a green build alone.

## Incident / Recovery Notes

If the browser shows a save conflict, preserve the local resume as JSON before reopening the latest server version. If a restore appears to lose resumes, do not clear browser data; check whether the original browser-held ownership key is still available. The API intentionally refuses access to ownerless legacy rows.
