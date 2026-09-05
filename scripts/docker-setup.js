/**
 * Script untuk menyiapkan direktori yang diperlukan untuk Docker
 * Jalankan sebelum menggunakan docker-compose
 */

const fs = require('fs');
const path = require('path');

// Direktori yang perlu dibuat
const directories = [
  'data',
  'data/.wwebjs_auth',
  'data/qr_codes',
  'data/logs'
];

// Buat direktori jika belum ada
directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Membuat direktori: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    console.log(`Direktori sudah ada: ${dirPath}`);
  }
});

// Pastikan file database ada
const dbPath = path.join(__dirname, '..', 'data', 'bot_data.db');
if (!fs.existsSync(dbPath)) {
  console.log(`Membuat file database kosong: ${dbPath}`);
  fs.writeFileSync(dbPath, '');
}

console.log('Setup selesai! Anda sekarang dapat menjalankan docker-compose up');