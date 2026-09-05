/**
 * Modul Alarm dan Pengingat
 * Mengelola fitur alarm dan pengingat dengan kemampuan penjadwalan massal
 */

class AlarmManager {
    constructor(db, taskManager) {
        this.db = db;
        this.taskManager = taskManager;
    }

    /**
     * Membuat alarm baru
     * @param {string} userId - ID pengguna
     * @param {string} activity - Kegiatan/aktivitas alarm
     * @param {string} alarmTime - Waktu alarm (format: YYYY-MM-DD HH:MM)
     * @param {string} repeatOption - Opsi pengulangan (once, daily, weekly, monthly)
     * @returns {Promise<object>} - Hasil pembuatan alarm
     */
    async createAlarm(userId, activity, alarmTime, repeatOption = 'once') {
        try {
            // Validate and parse the alarm time
            // Replace commas with spaces for compatibility
            const formattedAlarmTime = alarmTime.replace(/,/g, ' ');
            const alarmDate = new Date(formattedAlarmTime);
            
            if (isNaN(alarmDate.getTime())) {
                throw new Error('Format waktu tidak valid. Gunakan format: YYYY-MM-DD HH:MM atau YYYY-MM-DD,HH:MM');
            }
            
            // Set timezone to Jakarta/WIB (UTC+7)
            // JavaScript Date uses local timezone of the server, so we need to adjust it
            const now = new Date();
            const jakartaOffset = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds
            const serverOffset = now.getTimezoneOffset() * 60 * 1000; // Server timezone offset in milliseconds
            const offsetDiff = jakartaOffset + serverOffset;
            
            // Adjust the alarm time to Jakarta timezone
            const jakartaAlarmTime = new Date(alarmDate.getTime() + offsetDiff);
            
            // Check if the alarm time is in the past
            const jakartaNow = new Date(now.getTime() + offsetDiff);
            if (jakartaAlarmTime < jakartaNow && repeatOption === 'once') {
                throw new Error('Waktu alarm tidak boleh di masa lalu');
            }
            
            // Validate repeat option
            const validRepeatOptions = ['once', 'daily', 'weekly', 'monthly'];
            if (!validRepeatOptions.includes(repeatOption.toLowerCase())) {
                throw new Error('Opsi pengulangan tidak valid. Gunakan: once, daily, weekly, atau monthly');
            }
            
            // Add additional data for repeat option in description
            const description = `Alarm untuk kegiatan: ${activity}\nPengulangan: ${repeatOption}`;
            
            // Add the alarm as a task with reminder
            const result = await this.taskManager.addTask(
                userId,
                `Alarm: ${activity}`,
                description,
                jakartaAlarmTime.toISOString(),
                'high',
                'alarm',
                jakartaAlarmTime.toISOString(),
                'personal',  // task_type
                null,        // group_id
                repeatOption // custom field for repeat option
            );
            
            return {
                success: true,
                alarmId: result.id,
                alarmTime: jakartaAlarmTime,
                activity,
                repeatOption
            };
        } catch (error) {
            // Removed console.error for faster execution
            throw error;
        }
    }

    /**
     * Mendapatkan daftar alarm pengguna
     * @param {string} userId - ID pengguna
     * @returns {Promise<Array>} - Daftar alarm
     */
    async getAlarms(userId) {
        try {
            // Dapatkan semua tugas dengan kategori 'alarm'
            return await this.taskManager.getTasks(userId, null, 'alarm', 'personal');
        } catch (error) {
            // Removed console.error for faster execution
            throw error;
        }
    }

    /**
     * Menghapus alarm
     * @param {number} alarmId - ID alarm
     * @param {string} userId - ID pengguna
     * @returns {Promise<boolean>} - Status penghapusan
     */
    async deleteAlarm(alarmId, userId) {
        try {
            // Dapatkan alarm untuk memastikan itu adalah alarm
            const alarm = await this.taskManager.getTask(alarmId, userId);
            
            if (!alarm) {
                throw new Error('Alarm tidak ditemukan');
            }
            
            if (alarm.category !== 'alarm') {
                throw new Error('Tugas dengan ID tersebut bukan alarm');
            }
            
            // Hapus alarm
            await this.taskManager.deleteTask(alarmId, userId);
            
            return true;
        } catch (error) {
            // Removed console.error for faster execution
            throw error;
        }
    }

    /**
     * Memperbarui alarm
     * @param {number} alarmId - ID alarm
     * @param {string} userId - ID pengguna
     * @param {string} alarmTime - Waktu alarm baru (opsional)
     * @param {string} repeatOption - Opsi pengulangan baru (opsional)
     * @returns {Promise<object>} - Hasil pembaruan alarm
     */
    async updateAlarm(alarmId, userId, alarmTime = null, repeatOption = null) {
        try {
            // Dapatkan alarm untuk memastikan itu adalah alarm
            const alarm = await this.taskManager.getTask(alarmId, userId);
            
            if (!alarm) {
                throw new Error('Alarm tidak ditemukan');
            }
            
            if (alarm.category !== 'alarm') {
                throw new Error('Tugas dengan ID tersebut bukan alarm');
            }
            
            const updates = {};
            
            // Update waktu alarm jika disediakan
            if (alarmTime) {
                // Validate and parse the alarm time
                // Replace commas with spaces for compatibility
                const formattedAlarmTime = alarmTime.replace(/,/g, ' ');
                const alarmDate = new Date(formattedAlarmTime);
                
                if (isNaN(alarmDate.getTime())) {
                    throw new Error('Format waktu tidak valid. Gunakan format: YYYY-MM-DD HH:MM atau YYYY-MM-DD,HH:MM');
                }
                
                // Set timezone to Jakarta/WIB (UTC+7)
                const now = new Date();
                const jakartaOffset = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds
                const serverOffset = now.getTimezoneOffset() * 60 * 1000; // Server timezone offset in milliseconds
                const offsetDiff = jakartaOffset + serverOffset;
                
                // Adjust the alarm time to Jakarta timezone
                const jakartaAlarmTime = new Date(alarmDate.getTime() + offsetDiff);
                
                // Check if the alarm time is in the past
                const jakartaNow = new Date(now.getTime() + offsetDiff);
                if (jakartaAlarmTime < jakartaNow && (repeatOption === 'once' || repeatOption === null && alarm.repeat_option === 'once')) {
                    throw new Error('Waktu alarm tidak boleh di masa lalu');
                }
                
                updates.due_date = jakartaAlarmTime.toISOString();
                updates.reminder_time = jakartaAlarmTime.toISOString();
            }
            
            // Update repeat option jika disediakan
            if (repeatOption) {
                const validRepeatOptions = ['once', 'daily', 'weekly', 'monthly'];
                if (!validRepeatOptions.includes(repeatOption.toLowerCase())) {
                    throw new Error('Opsi pengulangan tidak valid. Gunakan: once, daily, weekly, atau monthly');
                }
                
                // We need to update the repeat_option in the database
                // Since it's not a standard field in updateTask, we'll do it directly
                await new Promise((resolve, reject) => {
                    const db = this.db;
                    const sql = `UPDATE tasks SET repeat_option = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
                    
                    db.db.run(sql, [repeatOption.toLowerCase(), alarmId, userId], function(err) {
                        if (err) {
                            // Removed console.error for faster execution
                            reject(err);
                        } else if (this.changes === 0) {
                            reject(new Error('Alarm tidak ditemukan atau bukan milik Anda'));
                        } else {
                            resolve();
                        }
                    });
                });
                
                // Update description to reflect new repeat option
                updates.description = `Alarm untuk kegiatan: ${alarm.title.replace('Alarm: ', '')}\nPengulangan: ${repeatOption.toLowerCase()}`;
            }
            
            // Update the alarm
            await this.taskManager.updateTask(alarmId, userId, updates);
            
            // Get updated alarm
            const updatedAlarm = await this.taskManager.getTask(alarmId, userId);
            
            return {
                success: true,
                alarm: updatedAlarm
            };
        } catch (error) {
            // Removed console.error for faster execution
            throw error;
        }
    }

    /**
     * Membuat jadwal alarm massal dari file teks
     * @param {string} userId - ID pengguna
     * @param {string} fileContent - Konten file teks dengan format alarm batch
     * @returns {Promise<object>} - Hasil pembuatan alarm batch
     */
    async createBatchAlarms(userId, fileContent) {
        try {
            // Split berdasarkan baris baru
            const lines = fileContent.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length === 0) {
                throw new Error('File tidak berisi data alarm yang valid.');
            }
            
            // Proses setiap baris
            const results = [];
            const errors = [];
            let successCount = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const parts = line.split('|');
                
                if (parts.length < 2) {
                    errors.push(`Baris ${i+1}: Format tidak valid. Gunakan format: [kegiatan]|[waktu]|[pengulangan]`);
                    continue;
                }
                
                const activity = parts[0].trim();
                const alarmTime = parts[1].trim();
                const repeatOption = parts.length > 2 ? parts[2].trim() : 'once';
                
                try {
                    // Buat alarm
                    const result = await this.createAlarm(userId, activity, alarmTime, repeatOption);
                    
                    // Format the alarm time for display
                    const formattedTime = result.alarmTime.toLocaleString('id-ID', {
                        timeZone: 'Asia/Jakarta',
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                    
                    results.push({
                        line: i + 1,
                        activity,
                        alarmTime: formattedTime,
                        alarmId: result.alarmId,
                        message: `Alarm "${activity}" berhasil diatur untuk ${formattedTime}`
                    });
                    
                    successCount++;
                } catch (error) {
                    // Removed console.error for faster execution
                    errors.push(`Baris ${i+1}: ${error.message}`);
                }
            }
            
            return {
                success: true,
                total: lines.length,
                successCount,
                errorCount: errors.length,
                results,
                errors
            };
        } catch (error) {
            // Removed console.error for faster execution
            throw error;
        }
    }

    /**
     * Format pesan untuk menampilkan daftar alarm
     * @param {Array} alarms - Daftar alarm
     * @returns {string} - Pesan terformat
     */
    formatAlarmList(alarms) {
        if (alarms.length === 0) {
            return '📅 *DAFTAR ALARM*\n\n❌ Tidak ada alarm yang ditemukan.';
        }
        
        let result = '📅 *DAFTAR ALARM*\n\n';
        
        alarms.forEach((alarm, index) => {
            const dueDate = new Date(alarm.due_date);
            
            // Format tanggal untuk tampilan
            const formattedTime = dueDate.toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
            // Format pengulangan
            let repeatMsg = '';
            switch(alarm.repeat_option.toLowerCase()) {
                case 'daily':
                    repeatMsg = '🔄 Pengulangan: Setiap hari';
                    break;
                case 'weekly':
                    repeatMsg = '🔄 Pengulangan: Setiap minggu';
                    break;
                case 'monthly':
                    repeatMsg = '🔄 Pengulangan: Setiap bulan';
                    break;
                default:
                    repeatMsg = '🔄 Pengulangan: Satu kali';
            }
            
            result += `*${index + 1}. ${alarm.title.replace('Alarm: ', '')}* (ID: ${alarm.id})\n`;
            result += `⏰ Waktu: ${formattedTime} WIB\n`;
            result += `${repeatMsg}\n`;
            result += `📝 Status: ${this.taskManager.formatStatus(alarm.status)}\n\n`;
        });
        
        result += '💡 Gunakan perintah berikut untuk mengelola alarm:\n';
        result += '- /alarmdelete [id] - Hapus alarm\n';
        result += '- /alarmupdate [id] [waktu_baru] [pengulangan?] - Update alarm\n';
        result += '- /alarmbatch - Buat jadwal alarm massal\n';
        
        return result;
    }

    /**
     * Format pesan untuk menampilkan detail alarm
     * @param {object} alarm - Data alarm
     * @returns {string} - Pesan terformat
     */
    formatAlarmDetail(alarm) {
        const dueDate = new Date(alarm.due_date);
        
        // Format tanggal untuk tampilan
        const formattedTime = dueDate.toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        // Format pengulangan
        let repeatMsg = '';
        switch(alarm.repeat_option.toLowerCase()) {
            case 'daily':
                repeatMsg = '🔄 Pengulangan: Setiap hari';
                break;
            case 'weekly':
                repeatMsg = '🔄 Pengulangan: Setiap minggu';
                break;
            case 'monthly':
                repeatMsg = '🔄 Pengulangan: Setiap bulan';
                break;
            default:
                repeatMsg = '🔄 Pengulangan: Satu kali';
        }
        
        let result = `🔔 *DETAIL ALARM*\n\n`;
        result += `📝 Kegiatan: ${alarm.title.replace('Alarm: ', '')}\n`;
        result += `⏰ Waktu: ${formattedTime} WIB\n`;
        result += `${repeatMsg}\n`;
        result += `📝 Status: ${this.taskManager.formatStatus(alarm.status)}\n`;
        result += `🆔 ID: ${alarm.id}\n\n`;
        
        result += '💡 Gunakan perintah berikut untuk mengelola alarm ini:\n';
        result += `- /alarmdelete ${alarm.id} - Hapus alarm ini\n`;
        result += `- /alarmupdate ${alarm.id} [waktu_baru] [pengulangan?] - Update alarm ini\n`;
        
        return result;
    }

    /**
     * Format pesan untuk menampilkan hasil batch alarm
     * @param {object} batchResult - Hasil batch alarm
     * @returns {string} - Pesan terformat
     */
    formatBatchResult(batchResult) {
        let report = `📋 *HASIL IMPORT ALARM BATCH*\n\n`;
        report += `✅ Berhasil: ${batchResult.successCount} dari ${batchResult.total} alarm\n`;
        report += `❌ Gagal: ${batchResult.errorCount} dari ${batchResult.total} alarm\n\n`;
        
        if (batchResult.errors.length > 0) {
            report += `*Detail Error:*\n${batchResult.errors.join('\n')}\n\n`;
        }
        
        report += `💡 Gunakan perintah /alarmlist untuk melihat semua alarm yang telah dibuat.`;
        
        return report;
    }

    /**
     * Mendapatkan bantuan untuk perintah alarm
     * @returns {string} - Pesan bantuan
     */
    getAlarmHelp() {
        let help = `📚 *BANTUAN PERINTAH ALARM*\n\n`;
        
        help += `*Perintah Dasar:*\n`;
        help += `- /alarm [kegiatan] [waktu] [pengulangan?] - Membuat alarm baru\n`;
        help += `- /alarmlist - Melihat daftar alarm\n`;
        help += `- /alarmdelete [id] - Menghapus alarm\n`;
        help += `- /alarmupdate [id] [waktu_baru] [pengulangan?] - Memperbarui alarm\n`;
        help += `- /alarmbatch - Membuat jadwal alarm massal\n\n`;
        
        help += `*Format Waktu:*\n`;
        help += `- YYYY-MM-DD HH:MM (contoh: 2023-12-31 14:30)\n`;
        help += `- YYYY-MM-DD,HH:MM (contoh: 2023-12-31,14:30)\n\n`;
        
        help += `*Opsi Pengulangan:*\n`;
        help += `- once - Satu kali (default)\n`;
        help += `- daily - Setiap hari\n`;
        help += `- weekly - Setiap minggu\n`;
        help += `- monthly - Setiap bulan\n\n`;
        
        help += `*Contoh Penggunaan:*\n`;
        help += `- /alarm "Rapat Kelompok" "2023-12-31 14:30"\n`;
        help += `- /alarm "Minum Obat" "2023-12-31 08:00" daily\n`;
        help += `- /alarmupdate 1 "2023-12-31 15:00" weekly\n`;
        help += `- /alarmdelete 1\n\n`;
        
        help += `*Untuk Alarm Batch:*\n`;
        help += `1. Buat file teks dengan format: [kegiatan]|[waktu]|[pengulangan]\n`;
        help += `2. Setiap alarm di baris baru\n`;
        help += `3. Kirim file tersebut\n`;
        help += `4. Balas file dengan perintah /alarmbatch\n\n`;
        
        help += `*Contoh Format File Batch:*\n`;
        help += `Minum Obat|2023-12-31 08:00|daily\n`;
        help += `Rapat Kelompok|2023-12-31 14:30|once\n`;
        
        return help;
    }
}

module.exports = AlarmManager;