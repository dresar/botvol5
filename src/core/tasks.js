

class TaskManager {
    constructor(db) {
        this.db = db;
        this.client = null; // Client akan diset dari app.js
    }

    // Set WhatsApp client
    setClient(client) {
        this.client = client;
    }

    // Tambah tugas baru (personal)
    async addTask(userId, title, description = '', dueDate = null, priority = 'medium', category = 'general', reminderTime = null, taskType = 'personal', groupId = null, repeatOption = 'once') {
        return this.db.addTask(userId, title, description, dueDate, priority, category, reminderTime, taskType, groupId, repeatOption);
    }

    // Tambah tugas grup
    async addGroupTask(userId, groupId, title, description = '', dueDate = null, priority = 'medium', category = 'general', reminderTime = null, repeatOption = 'once') {
        return this.db.addGroupTask(userId, groupId, title, description, dueDate, priority, category, reminderTime, repeatOption);
    }

    // Dapatkan daftar tugas pengguna (personal atau grup)
    async getTasks(userId, status = null, category = null, taskType = null) {
        return this.db.getTasks(userId, status, category, taskType);
    }

    // Dapatkan tugas grup
    async getGroupTasks(groupId, status = null) {
        return this.db.getGroupTasks(groupId, status);
    }

    // Update status tugas yang sudah lewat deadline
    async updateOverdueTasks(userId) {
        return this.db.updateOverdueTasks(userId);
    }

    // Update status tugas grup yang sudah lewat deadline
    async updateGroupOverdueTasks(groupId) {
        return this.db.updateGroupOverdueTasks(groupId);
    }

    // Dapatkan detail tugas
    async getTask(taskId, userId) {
        return this.db.getTask(taskId, userId);
    }

    // Update status tugas
    async updateTaskStatus(taskId, userId, status) {
        return this.db.updateTaskStatus(taskId, userId, status);
    }

    // Update detail tugas
    async updateTask(taskId, userId, updates) {
        return this.db.updateTask(taskId, userId, updates);
    }

    // Hapus tugas
    async deleteTask(taskId, userId) {
        return this.db.deleteTask(taskId, userId);
    }

    // Dapatkan tugas yang akan datang
    async getUpcomingTasks(userId, days = 7, taskType = null) {
        return this.db.getUpcomingTasks(userId, days, taskType);
    }

    // Dapatkan tugas yang sudah lewat deadline
    async getOverdueTasks(userId, taskType = null) {
        return this.db.getOverdueTasks(userId, taskType);
    }

    // Dapatkan tugas yang perlu diingatkan
    async getTasksNeedingReminders() {
        return this.db.getTasksNeedingReminders();
    }

    // Tandai tugas sudah diingatkan
    async markReminderSent(taskId) {
        return this.db.markReminderSent(taskId);
    }

    // Kirim pengingat tugas
    async sendTaskReminders() {
        if (!this.client) {
            // Removed console.error for faster execution
            return;
        }

        try {
            // Dapatkan tugas yang perlu diingatkan
            const tasks = await this.db.getTasksNeedingReminders();
            
            // Pastikan tasks adalah array
            const tasksArray = Array.isArray(tasks) ? tasks : [];
            
            if (tasksArray.length === 0) return;
            
            // Removed console.log for faster execution
            
            for (const task of tasksArray) {
                try {
                    // Format pesan pengingat
                    const reminderMessage = this.formatTaskReminder(task);
                    
                    // Kirim pesan berdasarkan tipe tugas
                    if (task.task_type === 'personal') {
                        // Kirim ke pengguna pribadi
                        const chat = await this.client.getChatById(`${task.user_id}@c.us`);
                        await chat.sendMessage(reminderMessage);
                    } else if (task.task_type === 'group' && task.group_id) {
                        // Kirim ke grup
                        const chat = await this.client.getChatById(task.group_id);
                        await chat.sendMessage(reminderMessage);
                    }
                    
                    // Tandai tugas sudah diingatkan
                    await this.db.markReminderSent(task.id);
                    
                    // Jika tugas adalah alarm dengan pengulangan, jadwalkan ulang
                    if (task.category === 'alarm' && task.repeat_option && task.repeat_option !== 'once') {
                        await this.rescheduleRepeatingAlarm(task);
                    }
                } catch (error) {
                    // Removed console.error for faster execution
                }
            }
        } catch (error) {
            // Removed console.error for faster execution
        }
    }
    
    // Jadwalkan ulang alarm berulang
    async rescheduleRepeatingAlarm(task) {
        try {
            // Hitung tanggal berikutnya berdasarkan opsi pengulangan
            const currentDate = new Date(task.due_date);
            let nextDate = new Date(currentDate);
            
            switch(task.repeat_option.toLowerCase()) {
                case 'daily':
                    nextDate.setDate(nextDate.getDate() + 1);
                    break;
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                default:
                    return; // Tidak perlu dijadwalkan ulang
            }
            
            // Buat tugas baru dengan tanggal yang diperbarui
            const result = await this.db.addTask(
                task.user_id,
                task.title,
                task.description,
                nextDate.toISOString(),
                task.priority,
                task.category,
                nextDate.toISOString(), // Reminder time sama dengan due date untuk alarm
                task.task_type,
                task.group_id,
                task.repeat_option
            );
            
            // Removed console.log for faster execution
            
            // Tandai tugas lama sebagai selesai
            await this.db.updateTaskStatus(task.id, task.user_id, 'completed');
            
        } catch (error) {
            // Removed console.error for faster execution
        }
    }

    // Format pesan pengingat tugas
    formatTaskReminder(task) {
        const dueDate = this.formatDate(task.due_date);
        const priorityEmoji = this.getPriorityEmoji(task.priority);
        const categoryEmoji = this.getCategoryEmoji(task.category);
        
        let message = ``;
        
        // Jika ini adalah alarm, gunakan format khusus
        if (task.category === 'alarm') {
            message = `🔔 *ALARM*\n\n`;
            message += `*${task.title.replace('Alarm: ', '')}*\n\n`;
            message += `⏰ Waktu: ${dueDate} WIB\n`;
            
            // Tampilkan informasi pengulangan jika ada
            if (task.repeat_option && task.repeat_option !== 'once') {
                let repeatMsg = '';
                switch(task.repeat_option.toLowerCase()) {
                    case 'daily':
                        repeatMsg = '🔄 Pengulangan: Setiap hari';
                        break;
                    case 'weekly':
                        repeatMsg = '🔄 Pengulangan: Setiap minggu';
                        break;
                    case 'monthly':
                        repeatMsg = '🔄 Pengulangan: Setiap bulan';
                        break;
                }
                message += `${repeatMsg}\n`;
            }
            
            if (task.description) {
                message += `\n📄 *Deskripsi:*\n${task.description}\n`;
            }
        } else {
            // Format standar untuk tugas biasa
            message = `⏰ *PENGINGAT TUGAS*\n\n`;
            message += `*${task.title}* (ID: ${task.id})\n\n`;
            message += `${priorityEmoji} Prioritas: ${this.formatPriority(task.priority)}\n`;
            message += `${categoryEmoji} Kategori: ${this.formatCategory(task.category)}\n`;
            message += `⏰ Deadline: ${dueDate}\n\n`;
            
            if (task.description) {
                message += `📄 *Deskripsi:*\n${task.description}\n\n`;
            }
            
            message += `💡 Gunakan perintah berikut untuk mengelola tugas ini:\n`;
            message += `- /taskstatus ${task.id} [pending/in_progress/completed]\n`;
            message += `- /taskdetail ${task.id}`;
        }
        
        return message;
    }

    // Format tanggal untuk tampilan
    formatDate(dateString) {
        if (!dateString) return 'Tidak ada deadline';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Format daftar tugas untuk tampilan
    formatTaskList(tasks) {
        if (tasks.length === 0) {
            return '📝 *DAFTAR TUGAS*\n\n❌ Tidak ada tugas yang ditemukan.';
        }
        
        let result = '📝 *DAFTAR TUGAS*\n\n';
        
        tasks.forEach((task, index) => {
            const dueDate = this.formatDate(task.due_date);
            const priorityEmoji = this.getPriorityEmoji(task.priority);
            const statusEmoji = this.getStatusEmoji(task.status);
            const categoryEmoji = this.getCategoryEmoji(task.category);
            const taskTypeEmoji = task.task_type === 'personal' ? '👤' : '👥';
            
            result += `*${index + 1}. ${task.title}* (ID: ${task.id})\n`;
            result += `${taskTypeEmoji} Tipe: ${task.task_type === 'personal' ? 'Pribadi' : 'Grup'}\n`;
            result += `${statusEmoji} Status: ${this.formatStatus(task.status)}\n`;
            result += `${priorityEmoji} Prioritas: ${this.formatPriority(task.priority)}\n`;
            result += `${categoryEmoji} Kategori: ${this.formatCategory(task.category)}\n`;
            result += `⏰ Deadline: ${dueDate}\n`;
            
            if (task.description) {
                result += `📄 Deskripsi: ${task.description}\n`;
            }
            
            result += '\n';
        });
        
        return result;
    }

    // Format detail tugas untuk tampilan
    formatTaskDetail(task) {
        if (!task) {
            return '❌ Tugas tidak ditemukan.';
        }
        
        const dueDate = this.formatDate(task.due_date);
        const priorityEmoji = this.getPriorityEmoji(task.priority);
        const statusEmoji = this.getStatusEmoji(task.status);
        const categoryEmoji = this.getCategoryEmoji(task.category);
        const createdAt = this.formatDate(task.created_at);
        const taskTypeEmoji = task.task_type === 'personal' ? '👤' : '👥';
        
        let result = `📝 *DETAIL TUGAS (ID: ${task.id})*\n\n`;
        result += `*${task.title}*\n\n`;
        result += `${taskTypeEmoji} Tipe: ${task.task_type === 'personal' ? 'Pribadi' : 'Grup'}\n`;
        result += `${statusEmoji} Status: ${this.formatStatus(task.status)}\n`;
        result += `${priorityEmoji} Prioritas: ${this.formatPriority(task.priority)}\n`;
        result += `${categoryEmoji} Kategori: ${this.formatCategory(task.category)}\n`;
        result += `⏰ Deadline: ${dueDate}\n`;
        result += `🕒 Dibuat pada: ${createdAt}\n\n`;
        
        if (task.description) {
            result += `📄 *Deskripsi:*\n${task.description}\n\n`;
        }
        
        result += `💡 Gunakan perintah berikut untuk mengelola tugas ini:\n`;
        result += `- /taskupdate ${task.id} [judul/deskripsi/deadline/prioritas/kategori] [nilai baru]\n`;
        result += `- /taskstatus ${task.id} [pending/in_progress/completed]\n`;
        result += `- /taskdelete ${task.id}`;
        
        return result;
    }

    // Helper untuk emoji prioritas
    getPriorityEmoji(priority) {
        switch (priority) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    }

    // Helper untuk emoji status
    getStatusEmoji(status) {
        switch (status) {
            case 'completed': return '✅';
            case 'in_progress': return '🔄';
            case 'pending': return '⏳';
            case 'overdue': return '⚠️';
            default: return '❓';
        }
    }

    // Helper untuk emoji kategori
    getCategoryEmoji(category) {
        switch (category) {
            case 'assignment': return '📚';
            case 'exam': return '📝';
            case 'project': return '🏗️';
            case 'presentation': return '🎯';
            case 'reading': return '📖';
            case 'general': return '📋';
            default: return '📌';
        }
    }

    // Format status untuk tampilan
    formatStatus(status) {
        switch (status) {
            case 'completed': return 'Selesai';
            case 'in_progress': return 'Sedang Dikerjakan';
            case 'pending': return 'Belum Dikerjakan';
            case 'overdue': return 'Terlambat';
            default: return status;
        }
    }

    // Format prioritas untuk tampilan
    formatPriority(priority) {
        switch (priority) {
            case 'high': return 'Tinggi';
            case 'medium': return 'Sedang';
            case 'low': return 'Rendah';
            default: return priority;
        }
    }

    // Format kategori untuk tampilan
    formatCategory(category) {
        switch (category) {
            case 'assignment': return 'Tugas';
            case 'exam': return 'Ujian';
            case 'project': return 'Proyek';
            case 'presentation': return 'Presentasi';
            case 'reading': return 'Bacaan';
            case 'general': return 'Umum';
            default: return category;
        }
    }

    // Dapatkan statistik tugas
    async getTaskStats(userId, taskType = null) {
        return this.db.getTaskStats(userId, taskType);
    }

    // Format statistik tugas untuk tampilan
    async formatTaskStats(userId, taskType = null) {
        try {
            const stats = await this.getTaskStats(userId, taskType);
            
            let result = '📊 *STATISTIK TUGAS*\n\n';
            
            if (taskType) {
                result += `👤 Tipe: ${taskType === 'personal' ? 'Pribadi' : 'Grup'}\n`;
            }
            
            result += `📝 Total Tugas: ${stats.total || 0}\n`;
            result += `✅ Selesai: ${stats.completed || 0}\n`;
            result += `⏳ Belum Dikerjakan: ${stats.pending || 0}\n`;
            result += `🔄 Sedang Dikerjakan: ${stats.in_progress || 0}\n`;
            result += `⚠️ Terlambat: ${stats.overdue || 0}\n`;
            result += `🔴 Prioritas Tinggi: ${stats.high_priority || 0}\n`;
            
            // Hitung persentase penyelesaian
            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            result += `📈 Tingkat Penyelesaian: ${completionRate}%\n`;
            
            return result;
        } catch (error) {
            // Removed console.error for faster execution
            return '❌ Gagal mendapatkan statistik tugas.';
        }
    }

    // Dapatkan bantuan untuk perintah tugas
    getTaskHelp() {
        let help = '📝 *BANTUAN MANAJEMEN TUGAS*\n\n';
        help += '*Perintah Dasar:*\n';
        help += '1. `/taskadd [judul] [deskripsi] [deadline] [prioritas] [kategori] [waktu_pengingat]` - Tambah tugas pribadi\n';
        help += '2. `/taskaddgroup [judul] [deskripsi] [deadline] [prioritas] [kategori] [waktu_pengingat]` - Tambah tugas grup\n';
        help += '3. `/alarm [tugas/kegiatan] [waktu_alarm] [pengulangan?]` - Set alarm dengan opsi pengulangan\n';
        help += '4. `/tasklist [status] [kategori] [tipe]` - Lihat semua tugas\n';
        help += '5. `/taskdetail [id]` - Lihat detail tugas\n';
        help += '6. `/taskupdate [id] [field] [nilai]` - Update tugas\n';
        help += '7. `/taskstatus [id] [status]` - Update status tugas\n';
        help += '8. `/taskdelete [id]` - Hapus tugas\n\n';
        
        help += '*Perintah Tambahan:*\n';
        help += '1. `/taskpending [tipe]` - Lihat tugas yang belum dikerjakan\n';
        help += '2. `/taskcompleted [tipe]` - Lihat tugas yang sudah selesai\n';
        help += '3. `/taskinprogress [tipe]` - Lihat tugas yang sedang dikerjakan\n';
        help += '4. `/taskoverdue [tipe]` - Lihat tugas yang terlambat\n';
        help += '5. `/taskupcoming [hari] [tipe]` - Lihat tugas yang akan datang dalam X hari\n';
        help += '6. `/taskstats [tipe]` - Lihat statistik tugas\n';
        help += '7. `/taskpersonal` - Lihat tugas pribadi\n';
        help += '8. `/taskgroup` - Lihat tugas grup\n\n';
        
        help += '*Tipe Tugas:*\n';
        help += '- personal (Pribadi)\n';
        help += '- group (Grup)\n\n';
        
        help += '*Kategori Tugas:*\n';
        help += '- assignment (Tugas)\n';
        help += '- exam (Ujian)\n';
        help += '- project (Proyek)\n';
        help += '- presentation (Presentasi)\n';
        help += '- reading (Bacaan)\n';
        help += '- general (Umum)\n';
        help += '- alarm (Alarm)\n\n';
        
        help += '*Prioritas Tugas:*\n';
        help += '- high (Tinggi)\n';
        help += '- medium (Sedang)\n';
        help += '- low (Rendah)\n\n';
        
        help += '*Status Tugas:*\n';
        help += '- pending (Belum Dikerjakan)\n';
        help += '- in_progress (Sedang Dikerjakan)\n';
        help += '- completed (Selesai)\n';
        help += '- overdue (Terlambat) - otomatis diupdate oleh sistem\n\n';
        
        help += '*Opsi Pengulangan Alarm:*\n';
        help += '- once (Satu kali)\n';
        help += '- daily (Setiap hari)\n';
        help += '- weekly (Setiap minggu)\n';
        help += '- monthly (Setiap bulan)\n\n';
        
        help += '*Format Waktu Pengingat:*\n';
        help += 'Gunakan format ISO: YYYY-MM-DD HH:MM\n';
        help += 'Contoh: 2023-12-30 14:30\n\n';
        
        help += '*Contoh Penggunaan:*\n';
        help += '1. `/taskadd Tugas Matematika Kerjakan halaman 10-15 2023-12-31 high assignment 2023-12-30 20:00`\n';
        help += '2. `/taskaddgroup Presentasi Kelompok Siapkan slide dan materi 2023-12-25 high presentation 2023-12-24 19:00`\n';
        help += '3. `/alarm "Minum Obat" "2023-12-31 08:00" daily`\n';
        help += '4. `/taskupdate 1 title Tugas Fisika`\n';
        help += '5. `/taskstatus 1 completed`\n';
        help += '6. `/tasklist pending assignment personal`\n';
        
        return help;
    }
}

module.exports = TaskManager;