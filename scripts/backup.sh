#!/usr/bin/env bash
#
# BlueStay — PostgreSQL Backup Script
#
# Creates compressed database backups. Supports:
#   - Local filesystem backups
#   - S3/R2 upload (optional)
#   - Retention-based cleanup
#
# Usage:
#   ./scripts/backup.sh                     # Local backup only
#   ./scripts/backup.sh --upload-s3         # Local + S3 upload
#   ./scripts/backup.sh --retention 30      # Keep last 30 days
#
# Cron example (daily at 2 AM):
#   0 2 * * * /path/to/hotel-booking/scripts/backup.sh --upload-s3 >> /var/log/bluestay-backup.log 2>&1
#

set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Database connection (from .env or environment)
if [[ -f "$PROJECT_ROOT/.env" ]]; then
  source <(grep -E '^(DATABASE_URL|POSTGRES_|S3_)' "$PROJECT_ROOT/.env" | sed 's/^/export /')
fi

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-bluestay}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

# Backup settings
BACKUP_DIR="${PROJECT_ROOT}/backups"
RETENTION_DAYS=14
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="bluestay_${TIMESTAMP}.sql.gz"
UPLOAD_S3=false

# S3 settings (for offsite backups)
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_REGION="${S3_REGION:-ap-south-1}"
S3_ENDPOINT="${S3_ENDPOINT:-}"
S3_PREFIX="backups/postgres"

# ─── Parse Arguments ───────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --upload-s3)   UPLOAD_S3=true; shift ;;
    --retention)   RETENTION_DAYS="$2"; shift 2 ;;
    --backup-dir)  BACKUP_DIR="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--upload-s3] [--retention DAYS] [--backup-dir DIR]"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ─── Functions ─────────────────────────────────────────────────────
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

die() {
  log "ERROR: $*" >&2
  exit 1
}

check_dependencies() {
  for cmd in pg_dump gzip; do
    command -v "$cmd" >/dev/null 2>&1 || die "$cmd is required but not installed"
  done
  if [[ "$UPLOAD_S3" == true ]]; then
    command -v aws >/dev/null 2>&1 || die "aws CLI is required for S3 upload"
  fi
}

create_backup() {
  log "Starting PostgreSQL backup..."
  mkdir -p "$BACKUP_DIR"

  export PGPASSWORD="$DB_PASSWORD"

  pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-privileges \
    --verbose \
    2>/dev/null \
    | gzip > "$BACKUP_DIR/$BACKUP_FILE"

  unset PGPASSWORD

  local size
  size=$(du -sh "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
  log "Backup created: $BACKUP_FILE ($size)"
}

upload_to_s3() {
  if [[ "$UPLOAD_S3" != true ]]; then
    return
  fi

  if [[ -z "$S3_BUCKET" ]]; then
    log "WARNING: S3_BACKUP_BUCKET not set, skipping S3 upload"
    return
  fi

  log "Uploading to S3: s3://$S3_BUCKET/$S3_PREFIX/$BACKUP_FILE"

  local aws_args=(
    s3 cp
    "$BACKUP_DIR/$BACKUP_FILE"
    "s3://$S3_BUCKET/$S3_PREFIX/$BACKUP_FILE"
    --region "$S3_REGION"
    --storage-class STANDARD_IA
  )

  if [[ -n "$S3_ENDPOINT" ]]; then
    aws_args+=(--endpoint-url "$S3_ENDPOINT")
  fi

  aws "${aws_args[@]}"
  log "S3 upload complete"
}

cleanup_old_backups() {
  log "Cleaning up backups older than $RETENTION_DAYS days..."

  local count
  count=$(find "$BACKUP_DIR" -name "bluestay_*.sql.gz" -mtime +"$RETENTION_DAYS" -type f | wc -l)

  if [[ "$count" -gt 0 ]]; then
    find "$BACKUP_DIR" -name "bluestay_*.sql.gz" -mtime +"$RETENTION_DAYS" -type f -delete
    log "Removed $count old backup(s)"
  else
    log "No old backups to clean up"
  fi

  # Also clean up S3 if enabled
  if [[ "$UPLOAD_S3" == true && -n "$S3_BUCKET" ]]; then
    local cutoff_date
    cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d 2>/dev/null || date -v-"${RETENTION_DAYS}d" +%Y%m%d)
    log "S3 cleanup: use lifecycle rules for bucket $S3_BUCKET"
  fi
}

create_latest_link() {
  local latest_link="$BACKUP_DIR/latest.sql.gz"
  ln -sf "$BACKUP_FILE" "$latest_link"
  log "Symlink updated: latest.sql.gz -> $BACKUP_FILE"
}

# ─── Main ──────────────────────────────────────────────────────────
main() {
  log "=========================================="
  log "BlueStay Database Backup"
  log "=========================================="
  log "Database: $DB_NAME@$DB_HOST:$DB_PORT"
  log "Backup dir: $BACKUP_DIR"
  log "Retention: $RETENTION_DAYS days"
  log "S3 upload: $UPLOAD_S3"

  check_dependencies
  create_backup
  create_latest_link
  upload_to_s3
  cleanup_old_backups

  log "=========================================="
  log "Backup complete!"
  log "=========================================="
}

main
