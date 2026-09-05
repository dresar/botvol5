/**
 * alarm_commands.js - Perintah-perintah untuk mengelola alarm
 */

module.exports = function(alarmManager) {
    return {
        // Alarm command
        async alarm(args, msg) {
            if (args.length < 2) {
                return `❌ Format: /alarm [tugas/kegiatan] [waktu_alarm] [pengulangan?]
💡 Contoh: /alarm "Rapat Kelompok" "2023-12-31 14:30"
💡 Contoh dengan koma: /alarm "Rapat Kelompok" "2023-12-31,14:30"
💡 Contoh dengan pengulangan: /alarm "Minum Obat" "2023-12-31 08:00" daily`;
            }
            
            // Parse arguments with quotes support
            let currentArg = '';
            let inQuotes = false;
            let parsedArgs = [];
            
            for (const arg of args) {
                if (arg.startsWith('"') && !inQuotes) {
                    inQuotes = true;
                    currentArg = arg.substring(1);
                } else if (arg.endsWith('"') && inQuotes) {
                    inQuotes = false;
                    currentArg += ' ' + arg.substring(0, arg.length - 1);
                    parsedArgs.push(currentArg);
                    currentArg = '';
                } else if (inQuotes) {
                    currentArg += ' ' + arg;
                } else {
                    parsedArgs.push(arg);
                }
            }
            
            // If still in quotes at the end, add the current argument
            if (inQuotes && currentArg) {
                parsedArgs.push(currentArg);
            }
            
            // If no parsed args (no quotes used), use original args
            if (parsedArgs.length === 0) {
                parsedArgs = args;
            }
            
            const activity = parsedArgs[0];
            const alarmTime = parsedArgs[1];
            const repeatOption = parsedArgs[2] || 'once'; // Default to 'once' if not specified
            
            try {
                // Use the AlarmManager to create the alarm
                const result = await alarmManager.createAlarm(
                    msg.author,
                    activity,
                    alarmTime,
                    repeatOption
                );
                
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
                
                // Format repeat message
                let repeatMsg = '';
                switch(repeatOption.toLowerCase()) {
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
                
                return `✅ Alarm berhasil diatur!

🔔 *ALARM*
📝 Kegiatan: ${activity}
⏰ Waktu: ${formattedTime} WIB
${repeatMsg}

💡 Anda akan menerima notifikasi pada waktu yang ditentukan.`;
            } catch (error) {
                console.error('Error setting alarm:', error);
                return `❌ Gagal mengatur alarm: ${error.message}`;
            }
        },
        
        // Alarm list command
        async alarmlist(args, msg) {
            try {
                const alarms = await alarmManager.getAlarms(msg.author);
                return alarmManager.formatAlarmList(alarms);
            } catch (error) {
                console.error('Error getting alarms:', error);
                return `❌ Gagal mendapatkan daftar alarm: ${error.message}`;
            }
        },
        
        // Alarm delete command
        async alarmdelete(args, msg) {
            if (args.length < 1) {
                return `❌ Format: /alarmdelete [id_alarm]
💡 Contoh: /alarmdelete 1
💡 Gunakan /alarmlist untuk melihat ID alarm`;
            }
            
            const alarmId = parseInt(args[0]);
            if (isNaN(alarmId)) {
                return `❌ ID alarm harus berupa angka`;
            }
            
            try {
                await alarmManager.deleteAlarm(alarmId, msg.author);
                return `✅ Alarm dengan ID ${alarmId} berhasil dihapus!`;
            } catch (error) {
                console.error('Error deleting alarm:', error);
                return `❌ Gagal menghapus alarm: ${error.message}`;
            }
        },
        
        // Alarm update command
        async alarmupdate(args, msg) {
            if (args.length < 2) {
                return `❌ Format: /alarmupdate [id_alarm] [waktu_baru] [pengulangan?]
💡 Contoh: /alarmupdate 1 "2023-12-31 15:00"
💡 Contoh dengan pengulangan: /alarmupdate 1 "2023-12-31 15:00" weekly
💡 Gunakan /alarmlist untuk melihat ID alarm`;
            }
            
            const alarmId = parseInt(args[0]);
            if (isNaN(alarmId)) {
                return `❌ ID alarm harus berupa angka`;
            }
            
            // Parse arguments with quotes support
            let currentArg = '';
            let inQuotes = false;
            let parsedArgs = [args[0]]; // Keep the alarm ID as the first argument
            
            for (const arg of args.slice(1)) { // Skip the first argument (alarm ID)
                if (arg.startsWith('"') && !inQuotes) {
                    inQuotes = true;
                    currentArg = arg.substring(1);
                } else if (arg.endsWith('"') && inQuotes) {
                    inQuotes = false;
                    currentArg += ' ' + arg.substring(0, arg.length - 1);
                    parsedArgs.push(currentArg);
                    currentArg = '';
                } else if (inQuotes) {
                    currentArg += ' ' + arg;
                } else {
                    parsedArgs.push(arg);
                }
            }
            
            // If still in quotes at the end, add the current argument
            if (inQuotes && currentArg) {
                parsedArgs.push(currentArg);
            }
            
            // If no parsed args (no quotes used), use original args
            if (parsedArgs.length === 1) { // Only the alarm ID
                parsedArgs = args;
            }
            
            const alarmTime = parsedArgs[1];
            const repeatOption = parsedArgs.length > 2 ? parsedArgs[2] : null;
            
            try {
                const result = await alarmManager.updateAlarm(alarmId, msg.author, alarmTime, repeatOption);
                
                // Format the alarm time for display
                const updatedAlarm = result.alarm;
                const dueDate = new Date(updatedAlarm.due_date);
                
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
                
                // Format repeat message
                let repeatMsg = '';
                switch(updatedAlarm.repeat_option.toLowerCase()) {
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
                
                return `✅ Alarm berhasil diperbarui!

🔔 *ALARM*
📝 Kegiatan: ${updatedAlarm.title.replace('Alarm: ', '')}
⏰ Waktu: ${formattedTime} WIB
${repeatMsg}

💡 Anda akan menerima notifikasi pada waktu yang ditentukan.`;
            } catch (error) {
                console.error('Error updating alarm:', error);
                return `❌ Gagal memperbarui alarm: ${error.message}`;
            }
        },
        
        // Alarm batch command
        async alarmbatch(args, msg) {
            // Check if the message is a reply to a file
            if (!msg.hasQuotedMsg) {
                return `❌ Perintah ini harus digunakan sebagai balasan terhadap file teks yang berisi daftar alarm.

💡 Format file:
[kegiatan]|[waktu]|[pengulangan]

💡 Contoh isi file:
Minum Obat|2023-12-31 08:00|daily
Rapat Kelompok|2023-12-31 14:30|once`;
            }
            
            try {
                // Get the quoted message
                const quotedMsg = await msg.getQuotedMessage();
                
                // Check if the quoted message contains a file or text
                if (quotedMsg.hasMedia) {
                    // Download the media
                    const media = await quotedMsg.downloadMedia();
                    
                    // Check if it's a text file
                    if (media.mimetype === 'text/plain') {
                        // Process the file content
                        const fileContent = media.data.toString('utf8');
                        const result = await alarmManager.createBatchAlarms(msg.author, fileContent);
                        
                        return alarmManager.formatBatchResult(result);
                    } else {
                        return `❌ File harus berupa file teks (.txt)`;
                    }
                } else {
                    // If it's just a text message, use the message body
                    const fileContent = quotedMsg.body;
                    const result = await alarmManager.createBatchAlarms(msg.author, fileContent);
                    
                    return alarmManager.formatBatchResult(result);
                }
            } catch (error) {
                console.error('Error processing batch alarms:', error);
                return `❌ Gagal memproses alarm batch: ${error.message}`;
            }
        },
        
        // Alarm help command
        async alarmhelp(args, msg) {
            return alarmManager.getAlarmHelp();
        }
    };
};