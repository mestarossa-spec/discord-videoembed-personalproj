# Discord Video Embedder

A small Windows desktop app, drag in a video, get back a direct link that Discord
will inline-embed (playable in-chat, no click-through) — bypassing Discord's own
upload size limit LEGALLY :D by hosting the file externally.

## How it works

Discord only inline-embeds a video when the link points **directly** to the raw
video file (not a webpage), with a supported format. This app uploads your file
to a free host and hands you back that direct link.

## Supported formats

`.mp4` and `.webm` only — these are the two formats Discord reliably plays inline
across desktop and mobile. `.mov` is deliberately excluded (inconsistent support).

## Hosts (pluggable)

| Provider | Storage | Size limit | Notes |
|---|---|---|---|
| Catbox | Permanent | 200MB | No account needed |
| Litterbox | Temporary (1–72h, your choice) | 1GB | Auto-deletes after expiry |

New hosts can be added by implementing the same `upload(filePath)` contract in
`src/providers/` — see `catbox.js` / `litterbox.js` as the reference shape.

## Requirements

- Node.js (with npm)
- Windows

## Setup

\`\`\`bash
npm install
npm start
\`\`\`

## Usage

1. Drag a `.mp4` or `.webm` file onto the app (or click to browse).
2. Choose a host (Catbox or Litterbox). If Litterbox, pick an expiry.
3. Click **Upload**.
4. Copy the resulting link and paste it into Discord — it'll embed and play inline.

## Status

MVP complete. Not yet packaged as a standalone `.exe` (currently run via `npm start`).