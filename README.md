<div align="center">

# 📁 High-Speed File Transfer & Local Storage Platform

A lightweight, modern, and high-speed local network file transfer application built with **Node.js**, **Express**, **EJS**, and **Tailwind CSS**. Upload, manage, and download large files (up to 10GB) seamlessly across devices on the same network without relying on external cloud services.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

[Key Features](#-key-features) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[Project Structure](#-project-structure) •
[API Reference](#-api-reference)

</div>

---

## 🚀 Key Features

- ⚡ **High-Speed Transfers**: Streamlined local network transfer bypassing external internet speeds.
- 📦 **Large File Handling**: Support for uploading files up to **10GB** in size.
- 🎨 **Adaptive Theme (Dark/Light)**: Responsive UI built with Tailwind CSS that automatically adapts to system color scheme preferences.
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile browsers.
- 🖱️ **Drag-and-Drop Interface**: Smooth interactive file dropzone for hassle-free batch selection.
- 📊 **Real-time Progress Tracker**: Dedicated upload progress tracking screen for monitoring transfers.
- 🔒 **Privacy-First**: Files remain strictly inside your private offline network and are never sent to third-party cloud servers.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Templating Engine**: EJS (Embedded JavaScript)
- **Styling**: Tailwind CSS (with native dark mode support)
- **Middleware**: Multer (or Formidable) for handling multipart file uploads

---

## 📂 Project Structure

```text
├── public/
│   ├── js/
│   │   └── upload.js          # Client-side upload logic & event handlers
│   └── uploads/               # Target directory for stored files
├── views/
│   ├── upload.ejs             # Main upload portal interface
│   ├── uploaded.ejs           # Uploaded files list & file management view
│   └── uploading.ejs          # Upload progress screen
├── server.js                  # Express server entry point & API routes
├── package.json               # Dependencies & scripts
└── README.md                  # Documentation