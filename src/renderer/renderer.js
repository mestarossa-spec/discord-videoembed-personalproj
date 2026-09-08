const dropZone = document.getElementById('dropZone');
const dropZoneLabel = document.getElementById('dropZoneLabel');
const selectedFileLabel = document.getElementById('selectedFile');
const fileInput = document.getElementById('fileInput');
const providerSelect = document.getElementById('provider');
const litterboxTimeRow = document.getElementById('litterboxTimeRow');
const litterboxTimeSelect = document.getElementById('litterboxTime');
const uploadBtn = document.getElementById('uploadBtn');
const status = document.getElementById('status');
const resultBox = document.getElementById('resultBox');
const resultUrl = document.getElementById('resultUrl');
const copyBtn = document.getElementById('copyBtn');

let selectedPath = null;

providerSelect.addEventListener('change', () => {
  litterboxTimeRow.style.display = providerSelect.value === 'litterbox' ? 'flex' : 'none';
});

function setSelectedFile(filePath) {
  selectedPath = filePath;
  selectedFileLabel.textContent = filePath ? filePath.split(/[\\/]/).pop() : '';
  resultBox.style.display = 'none';
  status.textContent = '';
  status.classList.remove('error');
}

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) setSelectedFile(window.api.getPathForFile(file));
});

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) setSelectedFile(window.api.getPathForFile(file));
});

uploadBtn.addEventListener('click', async () => {
  status.classList.remove('error');

  if (!selectedPath) {
    status.textContent = 'Select a video first.';
    status.classList.add('error');
    return;
  }
  if (!providerSelect.value) {
    status.textContent = 'Choose a host provider first.';
    status.classList.add('error');
    return;
  }

  uploadBtn.disabled = true;
  status.textContent = 'Uploading...';
  resultBox.style.display = 'none';

  const res = await window.api.uploadVideo({
    filePath: selectedPath,
    provider: providerSelect.value,
    litterboxTime: litterboxTimeSelect.value,
  });

  uploadBtn.disabled = false;

  if (res.ok) {
    status.textContent = '';
    resultUrl.value = res.url;
    resultBox.style.display = 'flex';
  } else {
    status.textContent = res.error;
    status.classList.add('error');
  }
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(resultUrl.value);
  const original = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = original), 1200);
});
