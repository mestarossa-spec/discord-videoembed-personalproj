const fs = require('fs');
const path = require('path');

/**
 * HostProvider contract: uploadToZeroXZero(filePath) -> Promise<string> (direct file URL)
 * 0x0.st: no account required, retention is size-dependent (roughly 30 days to
 * 1 year), 512MB cap. Their own etiquette page asks uploaders to use a unique,
 * honest User-Agent identifying the software rather than spoofing a browser -
 * we do that here.
 */
async function uploadToZeroXZero(filePath) {
  const buffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const blob = new Blob([buffer]);

  const form = new FormData();
  form.append('file', blob, fileName);

  const response = await fetch('https://0x0.st', {
    method: 'POST',
    headers: {
      'User-Agent': 'DiscordVideoEmbedder/1.0 (personal use; https://github.com/mestarossa-spec/discord-videoembed-personalproj)',
    },
    body: form,
  });

  const text = (await response.text()).trim();

  if (!response.ok || !text.startsWith('http')) {
    throw new Error(`0x0.st rejected the upload: ${text || `HTTP ${response.status}`}`);
  }

  return text;
}

module.exports = { uploadToZeroXZero };