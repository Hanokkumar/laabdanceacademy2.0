#!/usr/bin/env python3
"""
Copy all app collections from a source MongoDB (your local DB with real data)
to the destination MongoDB (Render / Atlas — what the hosted API uses).

Your data did not “vanish”: local and production are different databases. This script
replays your local documents into production.

Prerequisites:
  - MongoDB reachable locally (source) with your data
  - Destination URI from Render: Dashboard → your Web Service → Environment → MONGO_URL
  - Same DB_NAME on Render as you use locally, or pass --dest-db

Usage (PowerShell, from repo root):

  $env:DEST_MONGO_URL = "<paste Render MONGO_URL>"
  $env:DEST_DB_NAME = "test_database"
  python backend/scripts/copy_mongo_to_production.py

Or one-liner with explicit source:

  python backend/scripts/copy_mongo_to_production.py --dest-url "<URI>" --dest-db test_database

Dry run (counts only):

  python backend/scripts/copy_mongo_to_production.py --dry-run

Gallery images stored as Cloudinary URLs in DB are unchanged; only DB rows are copied.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

BACKEND_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_ROOT / ".env")

# All collections used by server.py + site_content.py
COLLECTIONS = [
    "events",
    "form_submissions",
    "dance_school_categories",
    "dance_school_items",
    "gallery_items",
    "instructors",
    "blog_posts",
    "testimonials",
    "class_schedule",
]


def main() -> int:
    p = argparse.ArgumentParser(description="Copy MongoDB data from local to production.")
    p.add_argument(
        "--source-url",
        default=os.environ.get("SOURCE_MONGO_URL") or os.environ.get("MONGO_URL", "mongodb://localhost:27017"),
        help="Source Mongo URI (default: MONGO_URL from backend/.env or localhost)",
    )
    p.add_argument(
        "--source-db",
        default=os.environ.get("SOURCE_DB_NAME") or os.environ.get("DB_NAME", "test_database"),
        help="Source database name (default: DB_NAME from backend/.env)",
    )
    p.add_argument(
        "--dest-url",
        default=os.environ.get("DEST_MONGO_URL"),
        help="Destination Mongo URI (Render MONGO_URL). Or set env DEST_MONGO_URL.",
    )
    p.add_argument(
        "--dest-db",
        default=os.environ.get("DEST_DB_NAME") or os.environ.get("DB_NAME", "test_database"),
        help="Destination database name (must match DB_NAME on Render if you use one DB)",
    )
    p.add_argument("--dry-run", action="store_true", help="Print counts only; do not write.")
    p.add_argument(
        "--collections",
        default="",
        help="Comma-separated subset (e.g. gallery_items,events). Default: all.",
    )
    args = p.parse_args()

    if not args.dest_url and not args.dry_run:
        print("Error: set DEST_MONGO_URL or pass --dest-url with your Render Mongo connection string.", file=sys.stderr)
        print("  Render → Web Service → Environment → MONGO_URL", file=sys.stderr)
        return 1

    subset = [c.strip() for c in args.collections.split(",") if c.strip()]
    cols = subset if subset else COLLECTIONS
    unknown = set(cols) - set(COLLECTIONS)
    if unknown:
        print(f"Unknown collections: {unknown}. Known: {COLLECTIONS}", file=sys.stderr)
        return 1

    try:
        src_client = MongoClient(args.source_url, serverSelectionTimeoutMS=8000)
        src_db = src_client[args.source_db]
        src_client.admin.command("ping")
    except ServerSelectionTimeoutError as e:
        print(
            "Cannot connect to SOURCE MongoDB. Start MongoDB locally or set SOURCE_MONGO_URL / --source-url.",
            file=sys.stderr,
        )
        print(e, file=sys.stderr)
        return 1

    if args.dry_run:
        print(f"DRY RUN - source {args.source_db} @ {args.source_url!r}")
        for name in cols:
            n = src_db[name].count_documents({})
            print(f"  {name}: {n} documents")
        src_client.close()
        return 0

    try:
        dest_client = MongoClient(args.dest_url, serverSelectionTimeoutMS=15000)
        dest_client.admin.command("ping")
    except ServerSelectionTimeoutError as e:
        print("Cannot connect to DESTINATION MongoDB. Check DEST_MONGO_URL (Render) and IP allowlist.", file=sys.stderr)
        print(e, file=sys.stderr)
        src_client.close()
        return 1
    dest_db = dest_client[args.dest_db]

    print(f"Source: {args.source_db} @ {args.source_url}")
    print(f"Dest:   {args.dest_db} @ (hidden)")
    total = 0
    for name in cols:
        docs = list(src_db[name].find({}))
        dest_db[name].delete_many({})
        if docs:
            dest_db[name].insert_many(docs)
        n = len(docs)
        total += n
        print(f"  {name}: {n} documents copied")
    print(f"Done. Total documents written: {total}")
    src_client.close()
    dest_client.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
