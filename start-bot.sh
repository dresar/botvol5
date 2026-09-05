#!/bin/bash

echo "==================================================="
echo "         WHATSAPP BOT STARTER SCRIPT"
echo "==================================================="
echo ""

# Periksa apakah Node.js terinstal
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js tidak ditemukan. Silakan instal Node.js terlebih dahulu."
    echo "Kunjungi https://nodejs.org/en/download/ untuk mengunduh Node.js"
    exit 1
fi

# Periksa apakah file .env ada
if [ ! -f ".env" ]; then
    echo "[INFO] File .env tidak ditemukan. Membuat dari .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "[SUCCESS] File .env berhasil dibuat dari .env.example"
    else
        echo "[ERROR] File .env.example tidak ditemukan. Silakan buat file .env secara manual."
        exit 1
    fi
fi

# Periksa apakah dependensi sudah diinstal
if [ ! -d "node_modules" ]; then
    echo "[INFO] Menginstal dependensi..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Gagal menginstal dependensi."
        exit 1
    fi
    echo "[SUCCESS] Dependensi berhasil diinstal."
else
    echo "[INFO] Dependensi sudah terinstal."
fi

echo ""
echo "==================================================="
echo "               INSTRUKSI LOGIN"
echo "==================================================="
echo ""
echo "CARA LOGIN DENGAN NOMOR TELEPON (DIREKOMENDASIKAN):"
echo "1. Buka WhatsApp di HP Anda"
echo "2. Ketuk Menu (3 titik) > Perangkat Tertaut"
echo "3. Ketuk \"Tautkan Perangkat\""
echo "4. Di bagian bawah, pilih \"Login dengan nomor telepon\""
echo "5. Masukkan kode 8 karakter yang muncul di layar komputer Anda"
echo ""
echo "ALTERNATIF: CARA LOGIN DENGAN QR CODE:"
echo "1. Buka WhatsApp di HP Anda"
echo "2. Ketuk Menu (3 titik) > Perangkat Tertaut"
echo "3. Ketuk \"Tautkan Perangkat\""
echo "4. PENTING: Scan QR code dari file gambar di folder qr_codes"
echo "   JANGAN scan dari terminal karena sering tidak terdeteksi"
echo ""
echo "==================================================="
echo ""

echo "[INFO] Menjalankan WhatsApp Bot..."
echo "[INFO] QR code akan disimpan di folder qr_codes sebagai file gambar PNG"
echo "[INFO] Gunakan file gambar tersebut untuk scan, bukan dari terminal"
echo ""

# Jalankan bot
npm start