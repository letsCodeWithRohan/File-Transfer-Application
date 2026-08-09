let selectedFiles = [];

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadBtn = document.getElementById('uploadBtn');

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.size > 30 * 1024 * 1024 * 1024) {
            alert(`${file.name} exceeds 30GB limit`);
            return;
        }
        selectedFiles.push(file);
    });
    renderFileList();
}

function renderFileList() {
    fileList.innerHTML = '';
    
    if (selectedFiles.length === 0) {
        uploadBtn.classList.add('hidden');
        return;
    }

    uploadBtn.classList.remove('hidden');

    selectedFiles.forEach((file, index) => {
        const fileCard = document.createElement('div');
        fileCard.className = 'bg-white rounded-lg shadow p-4 flex items-center justify-between';
        fileCard.innerHTML = `
            <div class="flex items-center space-x-3 flex-1">
                <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <div class="flex-1">
                    <p class="font-semibold text-gray-800 truncate">${file.name}</p>
                    <p class="text-sm text-gray-500">${formatBytes(file.size)}</p>
                </div>
            </div>
            <button onclick="removeFile(${index})" class="text-red-600 hover:text-red-800">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        fileList.appendChild(fileCard);
    });
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderFileList();
}

uploadBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    for (let i = 0; i < selectedFiles.length; i++) {
        await uploadFile(selectedFiles[i], i);
    }

    alert('All files uploaded successfully!');
    window.location.href = '/uploaded';
});

async function uploadFile(file, index) {
    const formData = new FormData();
    formData.append('file', file);

    const fileCard = fileList.children[index];
    const progressHTML = `
        <div class="mt-2">
            <div class="flex justify-between text-sm mb-1">
                <span class="upload-status">Uploading...</span>
                <span class="upload-speed">0 MB/s</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="upload-progress bg-blue-600 h-2 rounded-full transition-all" style="width: 0%"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span class="upload-percent">0%</span>
                <span class="upload-time">Time left: calculating...</span>
            </div>
        </div>
    `;
    fileCard.querySelector('div').insertAdjacentHTML('beforeend', progressHTML);

    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                const currentTime = Date.now();
                const timeElapsed = (currentTime - lastTime) / 1000;
                const bytesTransferred = e.loaded - lastLoaded;
                const speed = bytesTransferred / timeElapsed;
                const timeLeft = (e.total - e.loaded) / speed;

                lastLoaded = e.loaded;
                lastTime = currentTime;

                fileCard.querySelector('.upload-progress').style.width = percent + '%';
                fileCard.querySelector('.upload-percent').textContent = percent.toFixed(1) + '%';
                fileCard.querySelector('.upload-speed').textContent = formatBytes(speed) + '/s';
                fileCard.querySelector('.upload-time').textContent = `Time left: ${formatTime(timeLeft)}`;
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                fileCard.querySelector('.upload-status').textContent = 'Completed!';
                fileCard.querySelector('.upload-status').className = 'upload-status text-green-600 font-semibold';
                resolve();
            } else {
                reject(new Error('Upload failed'));
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));

        xhr.open('POST', '/upload');
        xhr.send(formData);
    });
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatTime(seconds) {
    if (!isFinite(seconds)) return 'calculating...';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}
