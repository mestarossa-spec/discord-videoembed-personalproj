const fs = require('fs');
const path = require('path');

const CATBOX_API_URL = 'https://catbox.moe/user/api.php';

/**
 * HostProvider contract: uploadToCatbox(filePath) -> Promise<string> (direct file URL)
 * Catbox: permanent storage, 200MB cap, no API key required for anonymous upload.
 */
async function uploadToCatbox(filePath) {
  const buffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const blob = new Blob([buffer]);

  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', blob, fileName);

  const response = await fetch(CATBOX_API_URL, {
    method: 'POST',
    body: form,
  });

  const text = (await response.text()).trim();

  if (!response.ok || !text.startsWith('http')) {
    throw new Error(`Catbox rejected the upload: ${text || `HTTP ${response.status}`}`);
  }

  return text;
}

module.exports = { uploadToCatbox };
