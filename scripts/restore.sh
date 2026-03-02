#!/usr/bin/env bash
#
# BlueStay — PostgreSQL Restore Script
#
# Restores a database from a backup file created by backup.sh.
#
# Usage:
#   ./scripts/restore.sh backups/bluestay_20250101_020000.sql.gz
#   ./scripts/restore.sh backups/latest.sql.gz
#   ./scripts/restore.sh --from-s3 bluestay_20250101_020000.sql.gz
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load env
if [[ -f "$PROJECT_ROOT/.env" ]]; then
  source <(grep -E '^(DATABASE_URL|POSTGRES_|S3_)' "$PROJECT_ROOT/.env" | sed 's/^/export /')
fi

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-bluestay}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
BACKUP_DIR="${PROJECT_ROOT}/backups"

S3_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_REGION="${S3_REGION:-ap-south-1}"
S3_ENDPOINT="${S3_ENDPOINT:-}"
S3_PREFIX="backups/postgres"

FROM_S3=false
BACKUP_PATH=""

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"; }
die() { log "ERROR: $*" >&2; exit 1; }

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --from-s3) FROM_S3=true; shift ;;
    --help|-h) echo "Usage: $0 [--from-s3] BACKUP_FILE"; exit 0 ;;
    *) BACKUP_PATH="$1"; shift ;;
  esac
done

[[ -n "$BACKUP_PATH" ]] || die "No backup file specified"

# Download from S3 if needed
if [[ "$FROM_S3" == true ]]; then
  [[ -n "$S3_BUCKET" ]] || die "S3_BACKUP_BUCKET not set"
  
  mkdir -p "$BACKUP_DIR"
  local_path="$BACKUP_DIR/$(basename "$BACKUP_PATH")"
  
  log "Downloading from S3: s3://$S3_BUCKET/$S3_PREFIX/$BACKUP_PATH"
  
  aws_args=(s3 cp "s3://$S3_BUCKET/$S3_PREFIX/$BACKUP_PATH" "$local_path" --region "$S3_REGION")
  [[ -n "$S3_ENDPOINT" ]] && aws_args+=(--endpoint-url "$S3_ENDPOINT")
  aws "${aws_args[@]}"
  
  BACKUP_PATH="$local_path"
fi

# Validate file
[[ -f "$BACKUP_PATH" ]] || die "Backup file not found: $BACKUP_PATH"

file_size=$(du -sh "$BACKUP_PATH" | cut -f1)
log "=========================================="
log "BlueStay Database Restore"
log "=========================================="
log "Source: $BACKUP_PATH ($file_size)"
log "Target: $DB_NAME@$DB_HOST:$DB_PORT"

# Confirmation
echo ""
echo "⚠️  WARNING: This will DROP and recreate the '$DB_NAME' database."
echo "   All existing data will be lost!"
echo ""
read -rp "Type 'yes' to continue: " confirm
[[ "$confirm" == "yes" ]] || die "Restore cancelled"

export PGPASSWORD="$DB_PASSWORD"

# Drop and recreate database
log "Dropping database $DB_NAME..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
  2>/dev/null || true

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
  -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" \
  -c "CREATE DATABASE \"$DB_NAME\";"

# Restore
log "Restoring from backup..."
if [[ "$BACKUP_PATH" == *.gz ]]; then
  gunzip -c "$BACKUP_PATH" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --quiet
else
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --quiet < "$BACKUP_PATH"
fi

unset PGPASSWORD

# Run Prisma migrations to ensure schema is up to date
log "Running Prisma migrations..."
cd "$PROJECT_ROOT/apps/api"
npx prisma migrate deploy 2>/dev/null || log "WARNING: Prisma migrate deploy failed (may be ok)"

log "=========================================="
log "Restore complete!"
log "=========================================="
