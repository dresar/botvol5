#!/bin/bash

# Script untuk menjalankan WhatsApp Bot dengan Docker

echo "===== WhatsApp Bot Grup - Docker Setup ====="
echo ""

# Cek apakah Docker terinstall
if ! command -v docker &> /dev/null; then
    echo "Error: Docker tidak terinstall. Silakan install Docker terlebih dahulu."
    exit 1
fi

# Cek apakah Docker Compose terinstall
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose tidak terinstall. Silakan install Docker Compose terlebih dahulu."
    exit 1
fi

# Cek apakah file .env ada
if [ ! -f .env ]; then
    echo "File .env tidak ditemukan. Membuat file .env dari .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "File .env berhasil dibuat. Silakan edit file tersebut untuk menyesuaikan konfigurasi."
    else
        echo "Error: File .env.example tidak ditemukan."
        exit 1
    fi
fi

# Tanya apakah ingin menjalankan bot
echo "Apakah Anda ingin menjalankan WhatsApp Bot sekarang? (y/n)"
read -r answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "Menjalankan WhatsApp Bot dengan Docker Compose..."
    docker-compose up -d
    
    echo ""
    echo "WhatsApp Bot berhasil dijalankan!"
    echo "Untuk melihat log, jalankan: docker logs -f whatsapp-bot-grup"
    echo "Untuk menghentikan bot, jalankan: docker-compose down"
    echo ""
    echo "CARA LOGIN WHATSAPP:"
    echo "1. Metode Login dengan Nomor Telepon (Direkomendasikan):"
    echo "   - Buka WhatsApp di HP Anda"
    echo "   - Ketuk Menu (3 titik) > Perangkat Tertaut"
    echo "   - Ketuk \"Tautkan Perangkat\""
    echo "   - Di bagian bawah, pilih \"Login dengan nomor telepon\""
    echo "   - Masukkan kode 8 karakter yang muncul di layar komputer"
    echo ""
    echo "2. Metode Login dengan QR Code:"
    echo "   - Buka WhatsApp di HP Anda"
    echo "   - Ketuk Menu (3 titik) > Perangkat Tertaut"
    echo "   - Ketuk \"Tautkan Perangkat\""
    echo "   - Scan QR code yang muncul di layar komputer"
    
    # Tanya apakah ingin melihat log
    echo ""
    echo "Apakah Anda ingin melihat log bot sekarang? (y/n)"
    read -r log_answer
    
    if [ "$log_answer" = "y" ] || [ "$log_answer" = "Y" ]; then
        docker logs -f whatsapp-bot-grup
    else
        echo "Anda dapat melihat log nanti dengan menjalankan: docker logs -f whatsapp-bot-grup"
    fi
else
    echo "Anda dapat menjalankan bot nanti dengan perintah: docker-compose up -d"
fi

echo ""
echo "===== Setup Selesai ====="