/**
 * monitoring-report.js - Script untuk menampilkan laporan monitoring sistem
 * Menampilkan penggunaan memori, CPU, dan statistik cache
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Fungsi untuk mendapatkan ukuran folder dalam bytes
async function getFolderSize(folderPath) {
    if (!fs.existsSync(folderPath)) {
        return 0;
    }

    let totalSize = 0;
    const items = await readdir(folderPath, { withFileTypes: true });

    for (const item of items) {
        const itemPath = path.join(folderPath, item.name);

        if (item.isDirectory()) {
            totalSize += await getFolderSize(itemPath);
        } else {
            const stats = await stat(itemPath);
            totalSize += stats.size;
        }
    }

    return totalSize;
}

// Fungsi untuk mendapatkan jumlah file dalam folder
async function getFileCount(folderPath) {
    if (!fs.existsSync(folderPath)) {
        return 0;
    }

    let totalFiles = 0;
    const items = await readdir(folderPath, { withFileTypes: true });

    for (const item of items) {
        const itemPath = path.join(folderPath, item.name);

        if (item.isDirectory()) {
            totalFiles += await getFileCount(itemPath);
        } else {
            totalFiles++;
        }
    }

    return totalFiles;
}

// Fungsi untuk mendapatkan penggunaan memori
function getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsagePercent = (usedMem / totalMem) * 100;

    return {
        total: formatBytes(totalMem),
        free: formatBytes(freeMem),
        used: formatBytes(usedMem),
        percent: memoryUsagePercent.toFixed(2)
    };
}

// Fungsi untuk mendapatkan penggunaan CPU
function getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
        for (const type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    }

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (idle / total) * 100;

    return {
        usage: usage.toFixed(2),
        cores: cpus.length
    };
}

// Fungsi untuk memformat bytes menjadi ukuran yang lebih mudah dibaca
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Fungsi utama untuk menampilkan laporan
async function showMonitoringReport() {
    console.log('\n=== LAPORAN MONITORING SISTEM ===\n');

    // Informasi sistem
    console.log('INFORMASI SISTEM:');
    console.log(`Platform: ${os.platform()} ${os.release()}`);
    console.log(`Hostname: ${os.hostname()}`);
    console.log(`Uptime: ${(os.uptime() / 3600).toFixed(2)} jam`);
    console.log(`Node.js: ${process.version}`);
    console.log(`PID: ${process.pid}`);

    // Penggunaan memori
    const memoryUsage = getMemoryUsage();
    console.log('\nPENGGUNAAN MEMORI:');
    console.log(`Total: ${memoryUsage.total}`);
    console.log(`Digunakan: ${memoryUsage.used} (${memoryUsage.percent}%)`);
    console.log(`Bebas: ${memoryUsage.free}`);

    // Penggunaan memori Node.js
    const nodeMemory = process.memoryUsage();
    console.log('\nPENGGUNAAN MEMORI NODE.JS:');
    console.log(`RSS: ${formatBytes(nodeMemory.rss)}`);
    console.log(`Heap Total: ${formatBytes(nodeMemory.heapTotal)}`);
    console.log(`Heap Used: ${formatBytes(nodeMemory.heapUsed)}`);
    console.log(`External: ${formatBytes(nodeMemory.external)}`);
    console.log(`Array Buffers: ${formatBytes(nodeMemory.arrayBuffers || 0)}`);

    // Penggunaan CPU
    const cpuUsage = getCpuUsage();
    console.log('\nPENGGUNAAN CPU:');
    console.log(`Cores: ${cpuUsage.cores}`);
    console.log(`Penggunaan: ${cpuUsage.usage}%`);

    // Statistik cache
    console.log('\nSTATISTIK CACHE:');

    // Cache WhatsApp
    const whatsappCachePath = path.join(process.cwd(), '.wwebjs_cache');
    if (fs.existsSync(whatsappCachePath)) {
        const cacheSize = await getFolderSize(whatsappCachePath);
        const fileCount = await getFileCount(whatsappCachePath);
        console.log(`Cache WhatsApp:`);
        console.log(`  - Ukuran: ${formatBytes(cacheSize)}`);
        console.log(`  - Jumlah File: ${fileCount}`);
    } else {
        console.log('Cache WhatsApp: Tidak ditemukan');
    }

    // Sesi WhatsApp
    const whatsappSessionPath = path.join(process.cwd(), '.wwebjs_auth');
    if (fs.existsSync(whatsappSessionPath)) {
        const sessionSize = await getFolderSize(whatsappSessionPath);
        const fileCount = await getFileCount(whatsappSessionPath);
        console.log(`Sesi WhatsApp:`);
        console.log(`  - Ukuran: ${formatBytes(sessionSize)}`);
        console.log(`  - Jumlah File: ${fileCount}`);
    } else {
        console.log('Sesi WhatsApp: Tidak ditemukan');
    }

    // QR Codes
    const qrCodesPath = path.join(process.cwd(), 'qr_codes');
    if (fs.existsSync(qrCodesPath)) {
        const qrSize = await getFolderSize(qrCodesPath);
        const fileCount = await getFileCount(qrCodesPath);
        console.log(`QR Codes:`);
        console.log(`  - Ukuran: ${formatBytes(qrSize)}`);
        console.log(`  - Jumlah File: ${fileCount}`);
    } else {
        console.log('QR Codes: Tidak ditemukan');
    }

    // Database
    const dbPath = path.join(process.cwd(), 'bot_data.db');
    if (fs.existsSync(dbPath)) {
        const dbStats = await stat(dbPath);
        console.log(`Database:`);
        console.log(`  - Ukuran: ${formatBytes(dbStats.size)}`);
        console.log(`  - Terakhir Diubah: ${dbStats.mtime}`);
    } else {
        console.log('Database: Tidak ditemukan');
    }

    // Logs
    const logsPath = path.join(process.cwd(), 'logs');
    if (fs.existsSync(logsPath)) {
        const logsSize = await getFolderSize(logsPath);
        const fileCount = await getFileCount(logsPath);
        console.log(`Logs:`);
        console.log(`  - Ukuran: ${formatBytes(logsSize)}`);
        console.log(`  - Jumlah File: ${fileCount}`);
    } else {
        console.log('Logs: Tidak ditemukan');
    }

    console.log('\n=== LAPORAN SELESAI ===\n');
}

// Jalankan fungsi laporan
showMonitoringReport().catch(err => {
    console.error('Error saat membuat laporan:', err);
});