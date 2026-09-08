# Discord Video Embedder

A small Windows desktop app: drag in or choose a video, get back a link that Discord
will inline-embed (playable in-chat, no click-through) — bypassing Discord's own
upload size limit by hosting the file externally.

## How it works

Thanks to autocompressor.net

Discord only reliably inline-embeds a video when the link points to a raw video
file with metadata its link-preview crawler can read. A bare hotlinked file
(especially from smaller/throttled hosts) often fails to embed on its own, so
this app does two things:

1. Uploads your file to a free host, getting a direct file link.
2. Wraps that link through [Autocompressor's AV1 Embed Tool](https://autocompressor.net/av1),
   which serves the metadata Discord's crawler needs, plus a fixed custom
   thumbnail (set in `src/main.js` as `THUMBNAIL_URL`) so every embed has a
   consistent look with no aspect-ratio gap.

You get three outputs after upload: the Discord-ready (wrapped) link, the raw
direct file link, and a "copy as masked link" option (`[Text](url)` Markdown
format) to hide the URL behind custom text in Discord.

## Supported formats

`.mp4` and `.webm` only. `.mov` is deliberately excluded (inconsistent support
across desktop/mobile Discord clients).

## Hosts (pluggable)

| Provider | Storage | Size limit | Notes |
|---|---|---|---|
| Catbox | Permanent | 200MB | No account needed |
| Litterbox | Temporary (1–72h, your choice) | 1GB | Auto-deletes after expiry |

New hosts can be added by implementing the same `upload(filePath)` contract in
`src/providers/` — see `catbox.js` / `litterbox.js` as the reference shape.

### Known network caveat

Catbox.moe is blocked by some ISPs (including certain PLDT connections in the
Philippines) at the network level, even though DNS resolves correctly.
Separately, Catbox rejects uploads originating from VPN/proxy IPs. This means
a VPN gets you past the ISP block but then triggers the VPN block — a genuine
dead end for Catbox on some networks. If Catbox uploads fail with a connection
timeout or an "Invalid uploader" error, this is an external network
restriction, not a bug — use Litterbox instead, or try from a different
network (e.g. mobile data, no VPN).

## Requirements

- Node.js (with npm)
- Windows

## Setup

```bash
npm install
npm start
```

## Usage

1. Drag a `.mp4` or `.webm` file onto the app (or click to browse).
2. Choose a host (Catbox or Litterbox). If Litterbox, pick an expiry.
3. Click **Upload**.
4. Copy the **Discord-ready link** (or the masked-link version) and paste it
   into Discord — it'll embed and play inline with the app's thumbnail.

## Status

Working end-to-end, confirmed embedding correctly in real Discord messages.
Not yet packaged as a standalone `.exe` (currently run via `npm start`).