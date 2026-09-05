/**
 * session_cleaner.js - Utility untuk membersihkan session WhatsApp Web
 * Membantu menangani error file terkunci saat logout
 */

const fs = require('fs');
const path = require('path');

class SessionCleaner {
    constructor() {
        this.sessionPath = path.join(process.cwd(), '.wwebjs_auth', 'session');
    }

    /**
     * Memeriksa apakah folder session ada
     * @returns {boolean} True jika folder session ada
     */
    sessionExists() {
        return fs.existsSync(this.sessionPath);
    }

    /**
     * Mencoba membersihkan file-file yang sering terkunci
     * @returns {Object} Status operasi pembersihan
     */
    cleanLockedFiles() {
        const result = {
            success: false,
            cleaned: [],
            errors: []
        };

        if (!this.sessionExists()) {
            result.errors.push('Session folder tidak ditemukan');
            return result;
        }

        // File-file yang sering terkunci
        const filesToClean = [
            'first_party_sets.db',
            'first_party_sets.db-journal',
            'lockfile'
        ];

        filesToClean.forEach(file => {
            const filePath = path.join(this.sessionPath, file);
            if (fs.existsSync(filePath)) {
                try {
                    // Gunakan pendekatan non-blocking untuk menghindari error EBUSY
                    setTimeout(() => {
                        try {
                            fs.unlinkSync(filePath);
                            result.cleaned.push(file);
                        } catch (innerError) {
                            result.errors.push(`Gagal menghapus ${file}: ${innerError.message}`);
                        }
                    }, 1000); // Tunggu 1 detik sebelum mencoba menghapus
                } catch (error) {
                    result.errors.push(`Gagal menghapus ${file}: ${error.message}`);
                }
            }
        });

        result.success = result.errors.length === 0;
        return result;
    }

    /**
     * Membersihkan seluruh folder session (gunakan dengan hati-hati)
     * @returns {Object} Status operasi pembersihan
     */
    cleanAllSession() {
        const result = {
            success: false,
            message: ''
        };

        if (!this.sessionExists()) {
            result.message = 'Session folder tidak ditemukan';
            return result;
        }

        try {
            // Hapus folder session secara rekursif
            this.deleteFolderRecursive(this.sessionPath);
            result.success = true;
            result.message = 'Session berhasil dibersihkan';
        } catch (error) {
            result.message = `Gagal membersihkan session: ${error.message}`;
        }

        return result;
    }

    /**
     * Menghapus folder secara rekursif
     * @param {string} folderPath - Path folder yang akan dihapus
     */
    deleteFolderRecursive(folderPath) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach(file => {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    // Rekursif untuk subfolder
                    this.deleteFolderRecursive(curPath);
                } else {
                    // Hapus file
                    try {
                        fs.unlinkSync(curPath);
                    } catch (error) {
                        console.error(`Gagal menghapus file ${curPath}: ${error.message}`);
                    }
                }
            });

            // Hapus folder kosong
            try {
                fs.rmdirSync(folderPath);
            } catch (error) {
                console.error(`Gagal menghapus folder ${folderPath}: ${error.message}`);
            }
        }
    }
}

module.exports = SessionCleaner;