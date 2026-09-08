const fs = require('fs');
const path = require('path');

const LITTERBOX_API_URL = 'https://litterbox.catbox.moe/resources/internals/api.php';
const VALID_TIMES = new Set(['1h', '12h', '24h', '72h']);

/**
 * HostProvider contract: uploadToLitterbox(filePath, time) -> Promise<string> (direct file URL)
 * Litterbox: temporary storage (auto-deletes after `time`), 1GB cap, no API key required.
 */
async function uploadToLitterbox(filePath, time = '72h') {
  if (!VALID_TIMES.has(time)) {
    throw new Error(`Invalid Litterbox expiry "${time}". Must be one of: 1h, 12h, 24h, 72h.`);
  }

  const buffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const blob = new Blob([buffer]);

  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('time', time);
  form.append('fileToUpload', blob, fileName);

  const response = await fetch(LITTERBOX_API_URL, {
    method: 'POST',
    body: form,
  });

  const text = (await response.text()).trim();

  if (!response.ok || !text.startsWith('http')) {
    throw new Error(`Litterbox rejected the upload: ${text || `HTTP ${response.status}`}`);
  }

  return text;
}

module.exports = { uploadToLitterbox };
