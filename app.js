// WhatsApp Bot - Optimized for VPS 1GB RAM
require('dotenv').config();
const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode'); // Tambahkan import QRCode
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');
const Database = require('./src/core/database');
const UtilityManager = require('./src/utils/utils');
const config = require('./src/core/config');
const SessionCleaner = require('./src/utils/session_cleaner');

// Tambahkan puppeteer-extra dengan plugin stealth
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Import core modules
const AdminHandler = require('./src/core/admin');
const AIHandler = require('./src/core/ai');
const AlarmHandler = require('./src/core/alarm');
const AnimeHandler = require('./src/core/anime');
const BotSettings = require('./src/core/bot_settings');
const GamesHandler = require('./src/core/games');
const MenuSystem = require('./src/core/menu');
const MonitoringService = require('./src/core/monitoring'); // Mengubah import monitoring
const TasksHandler = require('./src/core/tasks');

// Initialize services
const db = new Database();
const utils = new UtilityManager();
const cache = new NodeCache(config.cache);

// Create QR code directory if it doesn't exist
const qrDir = path.join(__dirname, 'qr_codes');
if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize WhatsApp client with puppeteer-extra
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        browserWSEndpoint: null, // Penting untuk puppeteer-extra
        // Hapus executablePath untuk menggunakan browser default
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    },
    // Gunakan puppeteer-extra
    puppeteerOptions: {
        // Gunakan puppeteer-extra sebagai pengganti puppeteer
        browserFetcher: null,
        browser: puppeteer
    },
    // Nonaktifkan webVersionCache untuk mengatasi error "Cannot read properties of null (reading '1')"
    webVersionCache: {
        type: 'none'
    }
});

// Initialize handlers
const adminHandler = new AdminHandler(client, db);
const aiHandler = new AIHandler(client, db);
const alarmHandler = new AlarmHandler(client, db);
const animeHandler = new AnimeHandler(client, db);
const botSettings = new BotSettings(db);
const gamesHandler = new GamesHandler(client, db);
const menuHandler = new MenuSystem(client, adminHandler); // Menambahkan client sebagai parameter
const tasksHandler = new TasksHandler(client, db);
const monitoringService = new MonitoringService(client, db); // Inisialisasi MonitoringService

// Event: QR Code Generated
// Event: QR Code Generated
let qrCodeTimer = null;
let lastQrCode = null;
let qrAttempts = 0;
let isScanning = false;

client.on('qr', (qr) => {
    console.log('QR Code received. Scan to authenticate:');
    qrcode.generate(qr, { small: true });
    
    // Simpan QR code terakhir
    lastQrCode = qr;
    qrAttempts++;
    isScanning = true;
    
    // Save QR code to file as text
    const qrTextFilePath = path.join(qrDir, `qr_${Date.now()}.txt`);
    fs.writeFileSync(qrTextFilePath, qr);
    console.log(`QR Code text saved to ${qrTextFilePath}`);
    
    // Generate and save QR code as PNG image
    const qrImageFilePath = path.join(qrDir, `qr_${Date.now()}.png`);
    QRCode.toFile(qrImageFilePath, qr, {
        color: {
            dark: '#000000',
            light: '#ffffff'
        },
        width: 300,
        margin: 1
    }, (err) => {
        if (err) {
            console.error('Error generating QR code image:', err);
        } else {
            console.log(`QR Code image saved to ${qrImageFilePath}`);
            console.log(`PENTING: Gunakan file gambar QR code (${qrImageFilePath}) untuk scan, bukan dari terminal`);
        }
    });
    
    // Tambahkan notifikasi ke admin jika ada
    try {
        const adminNumber = process.env.ADMIN_NUMBER;
        if (adminNumber && client.info) {
            client.sendMessage(adminNumber, 
                `QR Code baru telah dibuat (percobaan ke-${qrAttempts})\n\n` +
                `CARA LOGIN DENGAN NOMOR TELEPON (DIREKOMENDASIKAN):\n` +
                `1. Buka WhatsApp di HP Anda\n` +
                `2. Ketuk Menu (3 titik) > Perangkat Tertaut\n` +
                `3. Ketuk "Tautkan Perangkat"\n` +
                `4. Di bagian bawah, pilih "Login dengan nomor telepon"\n` +
                `5. Masukkan kode 8 karakter yang muncul di layar komputer Anda\n\n` +
                `ALTERNATIF: Scan QR Code dari file gambar di folder qr_codes, JANGAN scan dari terminal.`);
        }
    } catch (error) {
        console.log('Tidak dapat mengirim notifikasi QR code:', error.message);
    }
    
    // Hapus timer sebelumnya jika ada
    if (qrCodeTimer) {
        clearTimeout(qrCodeTimer);
    }
    
    // Set timer untuk menghasilkan QR code baru jika tidak di-scan dalam 30 detik
    qrCodeTimer = setTimeout(() => {
        console.log('QR Code tidak di-scan dalam 30 detik, mencoba menghasilkan QR code baru...');
        try {
            // Bersihkan session dan coba inisialisasi ulang
            const sessionCleaner = new SessionCleaner();
            sessionCleaner.cleanLockedFiles();
            client.initialize();
        } catch (error) {
            console.error('Error saat mencoba menghasilkan QR code baru:', error.message);
        }
    }, 30000); // 30 detik
});

// Event: Loading Screen
client.on('loading_screen', (percent, message) => {
    console.log(`Loading screen: ${percent}% - ${message}`);
    
    // Jika QR code sudah di-scan dan proses loading dimulai, hapus timer QR code
    if (qrCodeTimer) {
        clearTimeout(qrCodeTimer);
        qrCodeTimer = null;
    }
    
    // Jika sedang dalam proses scanning, tandai bahwa QR code telah di-scan
    if (isScanning && percent > 0) {
        console.log('QR Code telah berhasil di-scan, proses loading dimulai...');
        isScanning = false;
    }
    
    // Kirim notifikasi ke admin jika loading sudah mencapai 80%
    if (percent >= 80) {
        try {
            const adminNumber = process.env.ADMIN_NUMBER;
            if (adminNumber && client.info) {
                client.sendMessage(adminNumber, `Proses koneksi sedang berlangsung: ${percent}% - ${message}`);
            }
        } catch (error) {
            console.log('Tidak dapat mengirim notifikasi loading screen:', error.message);
        }
    }
});

// Event: Client Ready
client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
    
    // Reset QR code variables
    if (qrCodeTimer) {
        clearTimeout(qrCodeTimer);
        qrCodeTimer = null;
    }
    lastQrCode = null;
    qrAttempts = 0;
    
    // Start monitoring service
    monitoringService.startMonitoring();
    
    // Start alarm service
    alarmHandler.startAlarmService();
    
    // Log memory usage
    const memUsage = utils.getMemoryUsage();
    console.log(`Memory Usage: ${JSON.stringify(memUsage)}`);
    
    // Tambahkan notifikasi ke admin jika ada
    try {
        const adminNumber = process.env.ADMIN_NUMBER;
        if (adminNumber) {
            client.sendMessage(adminNumber, 'Bot WhatsApp telah berhasil terhubung dan siap digunakan!');
        }
    } catch (error) {
        console.log('Tidak dapat mengirim notifikasi ready:', error.message);
    }
});

// Event: Authentication Success
client.on('authenticated', (session) => {
    console.log('Authentication successful!');
    
    // Reset QR code variables
    if (qrCodeTimer) {
        clearTimeout(qrCodeTimer);
        qrCodeTimer = null;
    }
    lastQrCode = null;
    qrAttempts = 0;
    isScanning = false;
    
    // Simpan informasi sesi untuk debugging
    console.log('Session info received, authentication successful');
    
    // Tambahkan notifikasi ke admin jika ada
    try {
        const adminNumber = process.env.ADMIN_NUMBER;
        if (adminNumber && client.info) {
            client.sendMessage(adminNumber, 'Autentikasi berhasil! Bot sedang memuat...');
        }
    } catch (error) {
        console.log('Tidak dapat mengirim notifikasi authenticated:', error.message);
    }
});

// Event: Authentication Failed
client.on('auth_failure', async (msg) => {
    console.error('Authentication failed:', msg);
    
    // Reset QR code variables
    if (qrCodeTimer) {
        clearTimeout(qrCodeTimer);
        qrCodeTimer = null;
    }
    isScanning = false;
    
    // Tambahkan notifikasi ke admin jika ada
    try {
        const adminNumber = process.env.ADMIN_NUMBER;
        if (adminNumber && client.info) {
            await client.sendMessage(adminNumber, `Autentikasi gagal: ${msg}. Bot akan mencoba membuat QR code baru.`);
        }
    } catch (error) {
        console.log('Tidak dapat mengirim notifikasi auth failure:', error.message);
    }
    
    // Coba bersihkan session untuk mengatasi masalah autentikasi
    try {
        console.log('Mencoba membersihkan session setelah kegagalan autentikasi...');
        const sessionCleaner = new SessionCleaner();
        const result = sessionCleaner.cleanLockedFiles();
        console.log('Hasil pembersihan session:', result);
        
        // Tunggu 5 detik sebelum mencoba inisialisasi ulang
        setTimeout(() => {
            console.log('Mencoba inisialisasi ulang setelah kegagalan autentikasi...');
            client.initialize();
        }, 5000);
    } catch (error) {
        console.error('Error saat membersihkan session:', error.message);
    }
});

// Event: Disconnected
client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
    
    // Tambahkan notifikasi ke admin jika ada
    try {
        const adminNumber = process.env.ADMIN_NUMBER;
        if (adminNumber && client.info) {
            client.sendMessage(adminNumber, `Bot terputus: ${reason}. Mencoba menghubungkan kembali dalam 10 detik...`);
        }
    } catch (error) {
        console.log('Tidak dapat mengirim notifikasi disconnected:', error.message);
    }
    
    // Tunggu 10 detik sebelum mencoba menghubungkan kembali
    setTimeout(() => {
        try {
            console.log('Mencoba menghubungkan kembali...');
            // Bersihkan session jika diperlukan
            if (reason === 'NAVIGATION' || reason === 'CONFLICT') {
                console.log('Membersihkan session karena alasan:', reason);
                const sessionCleaner = new SessionCleaner();
                sessionCleaner.cleanLockedFiles();
            }
            // Inisialisasi ulang client
            client.initialize();
        } catch (error) {
            console.error('Error saat mencoba menghubungkan kembali:', error.message);
        }
    }, 10000); // 10 detik
});

// Event: Message Received
client.on('message', async (msg) => {
    try {
        // Check if message is from a group and if bot is enabled for that group
        if (msg.from.endsWith('@g.us') && await botSettings.isGroupDisabled(msg.from)) {
            return; // Bot is disabled for this group
        }
        
        // Check if message is from a chat and if bot is enabled for that chat
        if (!msg.from.endsWith('@g.us') && await botSettings.isChatDisabled(msg.from)) {
            return; // Bot is disabled for this chat
        }
        
        // Get message body and check if it starts with the prefix
        const body = msg.body.trim();
        if (!body.startsWith(config.prefix)) return;
        
        // Extract command and arguments
        const args = body.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        
        // Log the command
        console.log(`Command received: ${command} from ${msg.from}`);
        
        // Cek apakah perintah menggunakan format /menucategory
        if (command.startsWith('menu') && command.length > 4) {
            const category = command.slice(4).toLowerCase();
            await menuHandler.showMenu(msg, [category]);
            return;
        }
        
        // Process commands
        switch (command) {
            case 'admin':
                await adminHandler.handleCommand(msg, args);
                break;
            case 'ai':
                await aiHandler.handleCommand(msg, args);
                break;
            case 'alarm':
                await alarmHandler.handleCommand(msg, args);
                break;
            case 'anime':
                await animeHandler.handleCommand(msg, args);
                break;
            case 'game':
                await gamesHandler.handleCommand(msg, args);
                break;
            case 'task':
                await tasksHandler.handleCommand(msg, args);
                break;
            case 'menu':
                await menuHandler.showMenu(msg, args);
                break;
            case 'settings':
                await botSettings.handleCommand(msg, args);
                break;
            case 'qr':
                // Jika tidak ada argumen, generate QR code baru untuk login
                if (args.length === 0) {
                    // Verifikasi bahwa pengirim adalah admin
                    const adminNumber = process.env.ADMIN_NUMBER;
                    if (msg.from === adminNumber) {
                        await msg.reply('Menghasilkan QR code baru untuk login. Harap tunggu...');
                        try {
                            // Bersihkan session dan coba inisialisasi ulang
                            const sessionCleaner = new SessionCleaner();
                            sessionCleaner.cleanLockedFiles();
                            client.initialize();
                        } catch (error) {
                            await msg.reply(`Error saat menghasilkan QR code baru: ${error.message}`);
                        }
                    } else {
                        await msg.reply('Maaf, hanya admin yang dapat menggunakan perintah ini.');
                    }
                }
                // Generate a QR code from text jika ada argumen
                else if (args.length > 0) {
                    const text = args.join(' ');
                    await msg.reply(`Generating QR code for: ${text}`);
                    // Implementation for QR code generation would go here
                }
                break;
            case 'login':
                // Tampilkan panduan login
                await msg.reply(
                    `*PANDUAN LOGIN WHATSAPP BOT*\n\n` +
                    `*Metode 1: Scan QR Code (Default)*\n` +
                    `1. QR code ditampilkan di terminal dan disimpan di folder qr_codes\n` +
                    `2. Buka WhatsApp di HP Anda\n` +
                    `3. Ketuk Menu (3 titik) > Perangkat Tertaut\n` +
                    `4. Ketuk "Tautkan Perangkat"\n` +
                    `5. Scan QR code yang muncul\n\n` +
                    `*Catatan:*\n` +
                    `- QR code diperbarui setiap 30 detik jika tidak di-scan\n` +
                    `- Admin dapat meminta QR code baru dengan mengirim /qr\n\n` +
                    `*Metode 2: Login dengan Nomor Telepon (Alternatif)*\n` +
                    `1. Buka WhatsApp Web resmi di browser (https://web.whatsapp.com)\n` +
                    `2. Cari opsi "Login dengan nomor telepon" di bagian bawah\n` +
                    `3. Ikuti petunjuk untuk login\n\n` +
                    `*Catatan:* Fitur ini hanya tersedia di WhatsApp Web resmi, bukan di bot ini.\n\n` +
                    `Untuk panduan lengkap, lihat file docs/LOGIN_GUIDE.md`
                );
                break;
            default:
                // Unknown command
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
        try {
            await msg.reply('Sorry, an error occurred while processing your command.');
        } catch (replyError) {
            console.error('Error sending error reply:', replyError);
        }
    }
});

// Initialize the client
client.initialize();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Log to file
    fs.appendFileSync(
        path.join(logsDir, 'error.log'),
        `${new Date().toISOString()} - Uncaught Exception: ${err.stack}\n`
    );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    // Log to file
    fs.appendFileSync(
        path.join(logsDir, 'error.log'),
        `${new Date().toISOString()} - Unhandled Rejection: ${reason}\n`
    );
    
    // Tangani error file terkunci dengan SessionCleaner
    if (reason && reason.message && reason.message.includes('EBUSY: resource busy or locked')) {
        console.log('Terdeteksi error file terkunci. Ini biasanya terjadi saat logout atau restart.');
        console.log('Mencoba membersihkan file yang terkunci...');
        
        // Gunakan SessionCleaner untuk menangani file terkunci
        try {
            const sessionCleaner = new SessionCleaner();
            const result = sessionCleaner.cleanLockedFiles();
            console.log('Hasil pembersihan file terkunci:', result);
        } catch (cleanerError) {
            console.error('Gagal membersihkan file terkunci:', cleanerError.message);
        }
        
        console.log('Jika bot tidak berfungsi, coba restart aplikasi atau hapus folder .wwebjs_auth/session secara manual.');
        
        // Coba kirim notifikasi ke admin jika ada
        try {
            const adminNumber = process.env.ADMIN_NUMBER;
            if (adminNumber && client && client.info) {
                client.sendMessage(adminNumber, 'Terjadi error file terkunci pada bot. Sistem mencoba membersihkan otomatis, namun mungkin perlu restart manual.');
            }
        } catch (error) {
            console.log('Tidak dapat mengirim notifikasi error:', error.message);
        }
    }
});

// Periodic garbage collection to free up memory
setInterval(() => {
    if (global.gc) {
        global.gc();
        console.log('Garbage collection executed');
    }
}, config.performance.gcInterval);

// Tambahkan event handler untuk menangani kegagalan koneksi
client.on('loading_screen', (percent, message) => {
    console.log(`Loading screen: ${percent}% - ${message}`);
    
    // Jika QR code sudah di-scan dan proses loading dimulai, hapus timer QR code
    if (qrCodeTimer) {
        clearTimeout(qrCodeTimer);
        qrCodeTimer = null;
    }
    
    // Kirim notifikasi ke admin jika loading sudah mencapai 80%
    if (percent >= 80) {
        try {
            const adminNumber = process.env.ADMIN_NUMBER;
            if (adminNumber && client.info) {
                client.sendMessage(adminNumber, `Proses koneksi sedang berlangsung: ${percent}% - ${message}`);
            }
        } catch (error) {
            console.log('Tidak dapat mengirim notifikasi loading screen:', error.message);
        }
    }
});

// Event: Change State
client.on('change_state', state => {
    console.log('Client state changed to:', state);
    
    // Jika state berubah menjadi CONNECTED, hapus timer QR code
    if (state === 'CONNECTED') {
        if (qrCodeTimer) {
            clearTimeout(qrCodeTimer);
            qrCodeTimer = null;
        }
    }
});

// Event: Connection Closed
client.on('connection_closed', () => {
    console.log('Connection closed, attempting to reconnect...');
    
    // Kirim notifikasi ke admin
    try {
        const adminNumber = process.env.ADMIN_NUMBER;
        if (adminNumber && client.info) {
            client.sendMessage(adminNumber, 'Koneksi terputus. Mencoba menghubungkan kembali dalam 10 detik...');
        }
    } catch (error) {
        console.log('Tidak dapat mengirim notifikasi connection closed:', error.message);
    }
    
    // Tunggu 10 detik sebelum mencoba menghubungkan kembali
    setTimeout(() => {
        try {
            // Bersihkan session dan coba inisialisasi ulang
            console.log('Mencoba membersihkan session dan menginisialisasi ulang...');
            const sessionCleaner = new SessionCleaner();
            sessionCleaner.cleanLockedFiles();
            client.initialize();
        } catch (error) {
            console.error('Error saat mencoba menghubungkan kembali:', error.message);
        }
    }, 10000); // 10 detik
});