const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');

const app = express();
const PORT = 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure file upload with high limits for 10GB files
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 30 * 1024 * 1024 * 1024 }, // 30GB
    abortOnLimit: false,
    responseOnLimit: 'File size limit reached (30GB max)',
    uploadTimeout: 0 // No timeout
}));

// Routes
app.get('/', (req, res) => {
    res.render('upload', { serverIP: getLocalIP() });
});

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: 'No files were uploaded' });
    }

    const uploadedFile = req.files.file;
    const uploadPath = path.join(uploadsDir, uploadedFile.name);

    // Move file to uploads directory
    uploadedFile.mv(uploadPath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'File upload failed' });
        }

        res.json({
            success: true,
            fileName: uploadedFile.name,
            fileSize: uploadedFile.size,
            uploadPath: uploadPath
        });
    });
});

app.get('/files', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read files' });
        }

        const fileDetails = files.map(file => {
            const stats = fs.statSync(path.join(uploadsDir, file));
            return {
                name: file,
                size: stats.size,
                uploadDate: stats.mtime
            };
        });

        res.json({ files: fileDetails });
    });
});

app.get('/uploaded', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.render('uploaded', { files: [] });
        }

        const fileDetails = files.map(file => {
            const stats = fs.statSync(path.join(uploadsDir, file));
            return {
                name: file,
                size: formatBytes(stats.size),
                uploadDate: stats.mtime.toLocaleString()
            };
        });

        res.render('uploaded', { files: fileDetails });
    });
});

app.get('/download/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    res.download(filePath);
});

app.delete('/delete/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete file' });
        }
        res.json({ success: true });
    });
});

// Helper functions
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function generateQRCode(data) {
    qrcode.toString(data, { type: 'terminal' }, function (err, qr) {
        if (err) return console.log("Unable to generate QR code");
        console.log(qr);
    });
}

app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`\n🚀 File Storage Server Running!`);
    console.log(`\n📍 Access from this device: http://localhost:${PORT}`);
    console.log(`📍 Access from other devices: http://${localIP}:${PORT}\n`);
    generateQRCode(`http://${localIP}:${PORT}`);
    console.log(`\n📁 Files will be stored in: ${uploadsDir}\n`);
});