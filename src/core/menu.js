const figlet = require('figlet');

class MenuSystem {
    constructor(client, adminHandler = null) {
        this.client = client;
        this.adminHandler = adminHandler;
        this.menuData = {
            main: {
                title: '🤖 BOT GRUP CANGGIH',
                subtitle: '✨ Your Ultimate WhatsApp Assistant',
                categories: [
                    { id: 'games', name: '🎮 Games', icon: '🎯' },
                    { id: 'anime', name: '🌸 Anime', icon: '🎭' },
                    { id: 'creative', name: '🎨 Creative', icon: '✨' },
                    { id: 'utility', name: '🛠️ Utility', icon: '⚙️' },
                    { id: 'pengingat', name: '⏰ Pengingat', icon: '🔔' },
                    { id: 'ai', name: '🤖 AI', icon: '🧠' },
                    { id: 'analytics', name: '📊 Analytics', icon: '📈' },
                    { id: 'tasks', name: '📝 Tugas', icon: '📚' },
                    { id: 'group', name: '👥 Group', icon: '🏢' },
                    { id: 'admin', name: '🛡️ Admin', icon: '👑' }
                ]
            },
            
            games: {
                title: '🎮 GAMES & ENTERTAINMENT',
                commands: [
                    { cmd: '/kuis', desc: 'Mulai kuis interaktif' },
                    { cmd: '/tebakkata', desc: 'Game tebak kata' },
                    { cmd: '/suit', desc: 'Gunting batu kertas' },
                    { cmd: '/slot', desc: 'Mesin slot virtual' },
                    { cmd: '/truth', desc: 'Truth or dare' },
                    { cmd: '/math', desc: 'Permainan matematika' },
                    { cmd: '/siapakahaku', desc: 'Tebak tokoh terkenal' },
                    { cmd: '/susunkata', desc: 'Susun kata acak' },
                    { cmd: '/tekateki', desc: 'Teka-teki lucu' },
                    { cmd: '/asahotak', desc: 'Asah otak logika' },
                    { cmd: '/caklontong', desc: 'Kuis Cak Lontong' },
                    { cmd: '/joke', desc: 'Lelucon acak' },
                    { cmd: '/dadjoke', desc: 'Dad joke klasik' }
                ]
            },
            
            anime: {
                title: '🌸 ANIME FEATURES',
                commands: [
                    { cmd: '/randomloli', desc: 'Gambar anime loli random' },
                    { cmd: '/randomselfie', desc: 'Selfie anime character' },
                    { cmd: '/randomwaifu', desc: 'Waifu anime random' },
                    { cmd: '/animesticker', desc: 'Stiker anime emosi' },
                    { cmd: '/animestickerpack', desc: 'Paket stiker anime' },
                    { cmd: '/animetextsticker', desc: 'Stiker teks anime' },
                    { cmd: '/topanime', desc: 'Anime terpopuler' },
                    { cmd: '/otakudesu', desc: 'Info anime lengkap' }
                ]
            },
            
            creative: {
                title: '🎨 CREATIVE TOOLS',
                commands: [
                    { cmd: '/sticker', desc: 'Buat stiker dari gambar' },
                    { cmd: '/stickermeme', desc: 'Stiker dengan teks' },
                    { cmd: '/stickermerge', desc: 'Gabung 2 sticker' },
                    { cmd: '/meme', desc: 'Generate meme random' },
                    { cmd: '/logomaker', desc: 'Buat logo custom' },
                    { cmd: '/photoedit', desc: 'Edit foto dengan effect' },
                    { cmd: '/ascii', desc: 'Teks jadi ASCII art' },
                    { cmd: '/brat', desc: 'Teks gaya BRAT' },
                    { cmd: '/bratgif', desc: 'GIF BRAT random' },
                    { cmd: '/emojimix', desc: 'Gabung dua emoji' },
                    { cmd: '/iphonechat', desc: 'Fake chat iPhone' },
                    { cmd: '/fakengl', desc: 'Fake pesan NGL' },
                    { cmd: '/namaninja', desc: 'Nama ninja unik' },
                    { cmd: '/namapurba', desc: 'Nama purba kuno' }
                ]
            },
            
            utility: {
                title: '🛠️ UTILITY & TOOLS',
                commands: [
                    { cmd: '/qr', desc: 'Generate QR code / QR login' },
                    { cmd: '/login', desc: 'Panduan login bot' },
                    { cmd: '/short', desc: 'Pendekkan URL' },
                    { cmd: '/calc', desc: 'Kalkulator matematika' },
                    { cmd: '/cuaca', desc: 'Cek cuaca kota' },
                    { cmd: '/translate', desc: 'Translate bahasa' },
                    { cmd: '/wiki', desc: 'Cari di Wikipedia' }
                ]
            },
            
            pengingat: {
                title: '⏰ PENGINGAT & ALARM',
                subtitle: '🔔 Fitur Pengingat & Alarm',
                commands: [
                    { cmd: '/alarm', desc: 'Set alarm kegiatan' },
                    { cmd: '/remind', desc: 'Set reminder notifikasi' }
                ]
            },
            
            ai: {
                title: '🤖 AI ASSISTANT EKA',
                subtitle: '🧠 Asisten Pribadi Eka',
                commands: [
                    { cmd: '/ai', desc: 'Tanya AI Assistant' },
                    { cmd: '/chat', desc: 'Chat dengan AI' },
                    { cmd: '/gemini', desc: 'Akses Gemini AI' },
                    { cmd: '/sentiment', desc: 'Analisis mood teks' },
                    { cmd: '/quote', desc: 'Quote inspiratif' },
                    { cmd: '/aistats', desc: 'Statistik chat AI' },
                    { cmd: '/clearai', desc: 'Hapus memori chat' },
                    { cmd: '/loadhistory', desc: 'Muat history chat' },
                    { cmd: '/clearallai', desc: 'Hapus semua data AI' }
                ]
            },
            
            analytics: {
                title: '📊 ANALYTICS & STATS',
                commands: [
                    { cmd: '/stats', desc: 'Statistik aktivitas' },
                    { cmd: '/groupstats', desc: 'Statistik grup' },
                    { cmd: '/leaderboard', desc: 'Ranking member aktif' },
                    { cmd: '/wordcloud', desc: 'Kata populer grup' }
                ]
            },
            
            group: {
                title: '👥 GROUP MANAGEMENT',
                subtitle: '🏢 Kelola grup mudah',
                commands: [
                    { cmd: '/tagall', desc: 'Tag semua anggota' },
                    { cmd: '/tag', desc: 'Pengumuman dengan tag' },
                    { cmd: '/everyone', desc: 'Tag semua orang' },
                    { cmd: '/mention', desc: 'Mention anggota aktif' },
                    { cmd: '/groupinfo', desc: 'Info lengkap grup' },
                    { cmd: '/kick', desc: 'Kick anggota grup' },
                    { cmd: '/ban', desc: 'Ban anggota grup' },
                    { cmd: '/unban', desc: 'Unban anggota grup' },
                    { cmd: '/mute', desc: 'Mute bot sementara' },
                    { cmd: '/unmute', desc: 'Unmute bot' },
                    { cmd: '/broadcast', desc: 'Broadcast pesan' },
                    { cmd: '/poll', desc: 'Buat polling grup' }
                ]
            },
            
            tasks: {
                title: '📝 TUGAS KULIAH',
                subtitle: '📚 Manajemen Tugas',
                commands: [
                    { cmd: '/taskadd', desc: 'Tambah tugas pribadi' },
                    { cmd: '/taskaddgroup', desc: 'Tambah tugas grup' },
                    { cmd: '/tasklist', desc: 'Lihat semua tugas' },
                    { cmd: '/taskdetail', desc: 'Detail tugas' },
                    { cmd: '/taskupdate', desc: 'Update info tugas' },
                    { cmd: '/taskstatus', desc: 'Update status tugas' },
                    { cmd: '/taskdelete', desc: 'Hapus tugas' },
                    { cmd: '/taskpending', desc: 'Tugas belum dikerjakan' },
                    { cmd: '/taskcompleted', desc: 'Tugas sudah selesai' },
                    { cmd: '/taskinprogress', desc: 'Tugas sedang dikerjakan' },
                    { cmd: '/taskoverdue', desc: 'Tugas terlambat' },
                    { cmd: '/taskupcoming', desc: 'Tugas akan datang' },
                    { cmd: '/taskpersonal', desc: 'Tugas pribadi' },
                    { cmd: '/taskgroup', desc: 'Tugas grup' },
                    { cmd: '/taskstats', desc: 'Statistik tugas' },
                    { cmd: '/taskhelp', desc: 'Bantuan fitur tugas' }
                ]
            },
            
            admin: {
                title: '🛡️ ADMIN FEATURES',
                subtitle: '👑 Khusus admin',
                commands: [
                    { cmd: '/addadmin', desc: 'Tambah admin baru' },
                    { cmd: '/removeadmin', desc: 'Hapus admin' },
                    { cmd: '/listadmin', desc: 'Daftar admin' },
                    { cmd: '/setapikey', desc: 'Set Gemini API key' },
                    { cmd: '/addapikey', desc: 'Tambah API key baru' },
                    { cmd: '/listapikeys', desc: 'Daftar API keys' },
                    { cmd: '/removeapikey2', desc: 'Hapus API key' },
                    { cmd: '/resetapiusage', desc: 'Reset counter API' },
                    { cmd: '/removedailylimit', desc: 'Hapus limit API' },
                    { cmd: '/checkai', desc: 'Cek status AI' },
                    { cmd: '/botperformance', desc: 'Monitor performa' },
                    { cmd: '/systemhealth', desc: 'Cek kesehatan sistem' },
                    { cmd: '/adminstats', desc: 'Statistik admin' },
                    { cmd: '/addquiz', desc: 'Tambah soal kuis' },
                    { cmd: '/addtekateki', desc: 'Tambah teka-teki' },
                    { cmd: '/addsiapa', desc: 'Tambah siapakah aku' },
                    { cmd: '/addcaklontong', desc: 'Tambah cak lontong' },
                    { cmd: '/addkata', desc: 'Tambah kata' },
                    { cmd: '/addresponse', desc: 'Tambah respons' },
                    { cmd: '/listresponses', desc: 'Daftar respons' },
                    { cmd: '/removeresponse', desc: 'Hapus respons' },
                    { cmd: '/updateresponse', desc: 'Update respons' },
                    { cmd: '/disablegroup', desc: 'Nonaktifkan bot grup' },
                    { cmd: '/enablegroup', desc: 'Aktifkan bot grup' },
                    { cmd: '/disablechat', desc: 'Nonaktifkan bot chat' },
                    { cmd: '/enablechat', desc: 'Aktifkan bot chat' },
                    { cmd: '/botsettings', desc: 'Status pengaturan' },
                    { cmd: '/aiglobal', desc: 'Statistik global AI' },
                    { cmd: '/adminhelp', desc: 'Panduan admin' }
                ]
            }
        };
    }

    // Add showMenu method to display menus based on arguments
    async showMenu(msg, args = []) {
        try {
            // If no arguments, show main menu
            if (!args.length) {
                return this.sendMainMenu(msg);
            }

            // If category is specified, show that category's menu
            const category = args[0].toLowerCase();
            if (this.menuData[category]) {
                return this.sendCategoryMenu(msg, category);
            }

            // If category not found, show main menu with error message
            await msg.reply('⚠️ Menu category not found. Here is the main menu:');
            return this.sendMainMenu(msg);
        } catch (error) {
            console.error('Error showing menu:', error);
            await msg.reply('Sorry, there was an error displaying the menu.');
        }
    }

    // Send the main menu with all categories
    async sendMainMenu(msg) {
        try {
            const { title, subtitle, categories } = this.menuData.main;
            
            let menuText = `*${title}*
${subtitle}
\n`;
            menuText += '┏━━━━━━━━━━━━━━━━━━━━━┓\n';
            menuText += '┃   📋 *MENU CATEGORIES*   ┃\n';
            menuText += '┗━━━━━━━━━━━━━━━━━━━━━┛\n\n';
            
            categories.forEach(cat => {
                menuText += `${cat.icon} *${cat.name}*\n`;
                menuText += `   _Ketik /menu${cat.id}_\n\n`;
            });
            
            menuText += '\n_Kirim /menu [kategori] untuk melihat perintah_';
            
            await msg.reply(menuText);
        } catch (error) {
            console.error('Error sending main menu:', error);
            await msg.reply('Sorry, there was an error displaying the main menu.');
        }
    }

    // Send a specific category menu with its commands
    async sendCategoryMenu(msg, category) {
        try {
            const menuCategory = this.menuData[category];
            if (!menuCategory) {
                await msg.reply(`⚠️ Menu category '${category}' not found.`);
                return this.sendMainMenu(msg);
            }
            
            let menuText = `*${menuCategory.title}*\n`;
            if (menuCategory.subtitle) {
                menuText += `${menuCategory.subtitle}\n`;
            }
            
            menuText += '┏━━━━━━━━━━━━━━━━━━━━━┓\n';
            menuText += '┃   📋 *DAFTAR PERINTAH*   ┃\n';
            menuText += '┗━━━━━━━━━━━━━━━━━━━━━┛\n\n';
            
            menuCategory.commands.forEach(cmd => {
                menuText += `• *${cmd.cmd}* - _${cmd.desc}_\n`;
            });
            
            menuText += '\n_Kirim /menu untuk kembali ke menu utama_';
            
            await msg.reply(menuText);
        } catch (error) {
            console.error('Error sending category menu:', error);
            await msg.reply('Sorry, there was an error displaying the category menu.');
        }
    }
}

module.exports = MenuSystem;