# Music Metadata Collector

Background worker for the Music Playback System 2.0.

## Features
- Fetches metadata from YouTube Music.
- writes to Supabase `tracks` table.
- Runs via Vercel Cron (every 1 minute).

## Setup
Env Vars required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
