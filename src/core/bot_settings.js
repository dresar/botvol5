// Bot Settings Manager
const fs = require('fs');
const path = require('path');

class BotSettingsManager {
    constructor(db) {
        this.db = db;
        
        // Ensure database is initialized before calling initTables
        // Delay initialization until database is ready
        setTimeout(() => {
            if (this.db && this.db.db) {
                this.initTables();
            } else {
                console.error('Database not properly initialized in BotSettingsManager');
            }
        }, 1000); // Wait 1 second to ensure database is ready
    }
    
    initTables() {
        try {
            // Check if db and db.db are defined before proceeding
            if (!this.db || !this.db.db) {
                console.error('Database not properly initialized when calling initTables');
                return;
            }
            
            // Create disabled_groups table if not exists
            let sql = `
                CREATE TABLE IF NOT EXISTS disabled_groups (
                    group_id TEXT PRIMARY KEY,
                    disabled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            this.db.db.prepare(sql).run();
            
            // Create disabled_chats table if not exists
            sql = `
                CREATE TABLE IF NOT EXISTS disabled_chats (
                    chat_id TEXT PRIMARY KEY,
                    disabled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            this.db.db.prepare(sql).run();
            
            // Create bot_notifications table if not exists
            sql = `
                CREATE TABLE IF NOT EXISTS bot_notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chat_id TEXT,
                    group_id TEXT,
                    notification_type TEXT,
                    message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            this.db.db.prepare(sql).run();
            
            console.log('Bot settings tables initialized');
        } catch (err) {
            console.error('Error initializing bot settings tables:', err);
        }
    }
    
    // Check if bot is disabled in a group
    async isGroupDisabled(groupId) {
        try {
            if (!this.db || !this.db.db) return false;
            
            const result = this.db.db.prepare('SELECT * FROM disabled_groups WHERE group_id = ?').get(groupId);
            return result !== undefined;
        } catch (err) {
            console.error('Error checking if group is disabled:', err);
            return false;
        }
    }
    
    // Check if bot is disabled in a private chat
    async isChatDisabled(chatId) {
        try {
            if (!this.db || !this.db.db) return false;
            
            const result = this.db.db.prepare('SELECT * FROM disabled_chats WHERE chat_id = ?').get(chatId);
            return result !== undefined;
        } catch (err) {
            console.error('Error checking if chat is disabled:', err);
            return false;
        }
    }
    
    // Disable bot in a group
    disableGroup(groupId) {
        try {
            if (!this.db || !this.db.db) return false;
            
            this.db.db.prepare('INSERT OR REPLACE INTO disabled_groups (group_id) VALUES (?)').run(groupId);
            return true;
        } catch (err) {
            console.error('Error disabling group:', err);
            return false;
        }
    }
    
    // Enable bot in a group
    enableGroup(groupId) {
        try {
            if (!this.db || !this.db.db) return false;
            
            this.db.db.prepare('DELETE FROM disabled_groups WHERE group_id = ?').run(groupId);
            return true;
        } catch (err) {
            console.error('Error enabling group:', err);
            return false;
        }
    }
    
    // Disable bot in a private chat
    disableChat(chatId) {
        try {
            if (!this.db || !this.db.db) return false;
            
            this.db.db.prepare('INSERT OR REPLACE INTO disabled_chats (chat_id) VALUES (?)').run(chatId);
            return true;
        } catch (err) {
            console.error('Error disabling chat:', err);
            return false;
        }
    }
    
    // Enable bot in a private chat
    enableChat(chatId) {
        try {
            if (!this.db || !this.db.db) return false;
            
            this.db.db.prepare('DELETE FROM disabled_chats WHERE chat_id = ?').run(chatId);
            return true;
        } catch (err) {
            console.error('Error enabling chat:', err);
            return false;
        }
    }
    
    // Create a notification
    createNotification(chatId, groupId, type, message) {
        try {
            if (!this.db || !this.db.db) return false;
            
            this.db.db.prepare(
                'INSERT INTO bot_notifications (chat_id, group_id, notification_type, message) VALUES (?, ?, ?, ?)'
            ).run(chatId, groupId, type, message);
            return true;
        } catch (err) {
            console.error('Error creating notification:', err);
            return false;
        }
    }
    
    // Record group join event
    recordGroupJoin(groupId, message) {
        return this.createNotification(null, groupId, 'join', message);
    }
    
    // Get settings status for admin
    getSettingsStatus() {
        try {
            if (!this.db || !this.db.db) {
                return 'Database not initialized';
            }
            
            const disabledGroups = this.db.db.prepare('SELECT COUNT(*) as count FROM disabled_groups').get().count;
            const disabledChats = this.db.db.prepare('SELECT COUNT(*) as count FROM disabled_chats').get().count;
            const notifications = this.db.db.prepare('SELECT COUNT(*) as count FROM bot_notifications').get().count;
            
            return `📊 *BOT SETTINGS STATUS*\n\n` +
                   `Disabled Groups: ${disabledGroups}\n` +
                   `Disabled Chats: ${disabledChats}\n` +
                   `Notifications: ${notifications}`;
        } catch (err) {
            console.error('Error getting settings status:', err);
            return 'Error retrieving settings status';
        }
    }
    
    // Handle settings command
    async handleCommand(message, args) {
        try {
            // Get chat info
            const chat = await message.getChat();
            const isGroup = chat.isGroup;
            const chatId = chat.id._serialized;
            
            // Process command
            if (args.length === 0) {
                return message.reply(this.getSettingsStatus());
            }
            
            const subCommand = args[0].toLowerCase();
            
            switch (subCommand) {
                case 'disable':
                    if (isGroup) {
                        this.disableGroup(chatId);
                        return message.reply('Bot has been disabled in this group.');
                    } else {
                        this.disableChat(chatId);
                        return message.reply('Bot has been disabled in this chat.');
                    }
                
                case 'enable':
                    if (isGroup) {
                        this.enableGroup(chatId);
                        return message.reply('Bot has been enabled in this group.');
                    } else {
                        this.enableChat(chatId);
                        return message.reply('Bot has been enabled in this chat.');
                    }
                
                case 'status':
                    return message.reply(this.getSettingsStatus());
                
                default:
                    return message.reply('Unknown settings command. Available commands: disable, enable, status');
            }
        } catch (err) {
            console.error('Error handling settings command:', err);
            return message.reply('Error processing settings command.');
        }
    }
}

module.exports = BotSettingsManager;