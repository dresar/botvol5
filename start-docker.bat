@echo off
setlocal enabledelayedexpansion

echo ===== WhatsApp Bot Grup - Docker Setup =====
echo.

:: Cek apakah Docker terinstall
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker tidak terinstall. Silakan install Docker terlebih dahulu.
    pause
    exit /b 1
)

:: Cek apakah Docker Compose terinstall
docker-compose --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker Compose tidak terinstall. Silakan install Docker Compose terlebih dahulu.
    pause
    exit /b 1
)

:: Cek apakah file .env ada
if not exist .env (
    echo File .env tidak ditemukan. Membuat file .env dari .env.example...
    if exist .env.example (
        copy .env.example .env
        echo File .env berhasil dibuat. Silakan edit file tersebut untuk menyesuaikan konfigurasi.
    ) else (
        echo Error: File .env.example tidak ditemukan.
        pause
        exit /b 1
    )
)

:: Tanya apakah ingin menjalankan bot
set /p answer=Apakah Anda ingin menjalankan WhatsApp Bot sekarang? (y/n): 

if /i "%answer%"=="y" (
    echo Menjalankan WhatsApp Bot dengan Docker Compose...
    docker-compose up -d
    
    echo.
    echo WhatsApp Bot berhasil dijalankan!
    echo Untuk melihat log, jalankan: docker logs -f whatsapp-bot-grup
    echo Untuk menghentikan bot, jalankan: docker-compose down
    echo.
    echo CARA LOGIN WHATSAPP:
    echo 1. Metode Login dengan Nomor Telepon (Direkomendasikan):
    echo    - Buka WhatsApp di HP Anda
    echo    - Ketuk Menu (3 titik) ^> Perangkat Tertaut
    echo    - Ketuk "Tautkan Perangkat"
    echo    - Di bagian bawah, pilih "Login dengan nomor telepon"
    echo    - Masukkan kode 8 karakter yang muncul di layar komputer
    echo.
    echo 2. Metode Login dengan QR Code:
    echo    - Buka WhatsApp di HP Anda
    echo    - Ketuk Menu (3 titik) ^> Perangkat Tertaut
    echo    - Ketuk "Tautkan Perangkat"
    echo    - Scan QR code yang muncul di layar komputer
    
    :: Tanya apakah ingin melihat log
    echo.
    set /p log_answer=Apakah Anda ingin melihat log bot sekarang? (y/n): 
    
    if /i "!log_answer!"=="y" (
        docker logs -f whatsapp-bot-grup
    ) else (
        echo Anda dapat melihat log nanti dengan menjalankan: docker logs -f whatsapp-bot-grup
    )
) else (
    echo Anda dapat menjalankan bot nanti dengan perintah: docker-compose up -d
)

echo.
echo ===== Setup Selesai =====
pause