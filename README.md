# WhatsApp Bot Grup Optimized

Bot WhatsApp ringan untuk VPS spesifikasi rendah (1GB RAM).

## Fitur

- Optimasi penggunaan memori
- Dukungan untuk grup WhatsApp
- Berbagai perintah dan fungsi bot
- Dukungan Docker untuk deployment yang mudah
- Login dengan nomor telepon (metode yang direkomendasikan)

## Persyaratan

- Node.js 18 atau lebih tinggi
- NPM
- SQLite3
- Puppeteer dan dependensinya

## Instalasi

### Metode Standar

1. Clone repositori ini
2. Install dependensi:
   ```bash
   npm install
   ```
3. Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi
4. Jalankan bot:
   ```bash
   npm start
   ```

### Menggunakan Docker (Direkomendasikan)

#### Metode 1: Docker Compose (Paling Direkomendasikan)

1. Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi

2. Jalankan dengan Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Untuk melihat log:
   ```bash
   docker logs -f whatsapp-bot-grup
   ```

4. Untuk menghentikan container:
   ```bash
   docker-compose down
   ```

#### Metode 2: Docker Run

1. Build image Docker:
   ```bash
   docker build -t whatsapp-bot-grup .
   ```

2. Jalankan container Docker:
   ```bash
   docker run -d --name whatsapp-bot-grup \
     -e ADMIN_NUMBER=628xxxxxxxxxx \
     -v whatsapp_auth:/app/.wwebjs_auth \
     -v whatsapp_data:/app/bot_data.db \
     -v whatsapp_qr:/app/qr_codes \
     -v whatsapp_logs:/app/logs \
     whatsapp-bot-grup
   ```

## Cara Login WhatsApp

### Metode 1: Login dengan Nomor Telepon (Direkomendasikan)

1. Jalankan bot dan tunggu hingga QR code muncul
2. Buka WhatsApp di HP Anda
3. Ketuk Menu (3 titik) > Perangkat Tertaut
4. Ketuk "Tautkan Perangkat"
5. Di bagian bawah, pilih "Login dengan nomor telepon"
6. Masukkan kode 8 karakter yang muncul di layar komputer Anda

### Metode 2: Login dengan QR Code

1. Jalankan bot dan tunggu hingga QR code muncul
2. Buka WhatsApp di HP Anda
3. Ketuk Menu (3 titik) > Perangkat Tertaut
4. Ketuk "Tautkan Perangkat"
5. Scan QR code yang muncul di layar komputer Anda

## Perintah NPM

- `npm start` - Menjalankan bot dengan pengaturan memori yang dioptimalkan
- `npm run start:fast` - Menjalankan bot dengan mode cepat
- `npm run start:optimized` - Menjalankan bot dengan optimasi tambahan
- `npm run start:clean` - Menjalankan bot dengan sesi bersih
- `npm run dev` - Menjalankan bot dalam mode pengembangan dengan nodemon
- `npm run pm2` - Menjalankan bot dengan PM2 dalam mode produksi
- `npm run pm2:dev` - Menjalankan bot dengan PM2 dalam mode pengembangan
- `npm run pm2:stop` - Menghentikan bot yang berjalan dengan PM2
- `npm run pm2:restart` - Me-restart bot yang berjalan dengan PM2
- `npm run pm2:logs` - Melihat log bot yang berjalan dengan PM2
- `npm run pm2:monit` - Memantau bot yang berjalan dengan PM2
- `npm run cleanup` - Membersihkan file QR dan mengoptimalkan database
- `npm run memory-check` - Memeriksa penggunaan memori
- `npm run monitoring-report` - Menghasilkan laporan pemantauan
- `npm run clean-cache` - Membersihkan cache browser
- `npm run clean-cache-selective` - Membersihkan cache browser secara selektif
- `npm run clean-session` - Membersihkan sesi
- `npm run docker:build` - Membangun image Docker
- `npm run docker:run` - Menjalankan container Docker
- `npm run docker:setup` - Menyiapkan direktori data untuk Docker
- `npm run docker:compose` - Menjalankan bot dengan Docker Compose
- `npm run docker:compose:down` - Menghentikan bot yang berjalan dengan Docker Compose

## Struktur Proyek

- `src/` - Kode sumber utama
  - `core/` - Komponen inti bot
  - `handlers/` - Penangan pesan dan perintah
  - `models/` - Model data
  - `services/` - Layanan eksternal
  - `utils/` - Utilitas dan fungsi pembantu
- `config/` - File konfigurasi
- `scripts/` - Script utilitas
- `logs/` - File log
- `qr_codes/` - Kode QR untuk autentikasi WhatsApp

## Lisensi

MIT