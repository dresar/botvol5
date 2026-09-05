const BetterSqlite3 = require('better-sqlite3');
const path = require('path');

class Database {
    constructor() {
        // Perbarui path untuk database file
        this.db = new BetterSqlite3(path.join(__dirname, '../../bot_data.db'));
        this.initTables();
    }

    initTables() {
        try {
            const tables = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                phone TEXT,
                level INTEGER DEFAULT 1,
                exp INTEGER DEFAULT 0,
                points INTEGER DEFAULT 0,
                coins INTEGER DEFAULT 100,
                last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
                join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_banned BOOLEAN DEFAULT 0,
                warning_count INTEGER DEFAULT 0
            )`,
            
            // Response templates table for private chat
            `CREATE TABLE IF NOT EXISTS response_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT NOT NULL,
                response TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                is_private_only BOOLEAN DEFAULT 0,
                is_group_only BOOLEAN DEFAULT 0,
                added_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (added_by) REFERENCES users(id)
            )`,
            
            // Groups table
            `CREATE TABLE IF NOT EXISTS groups (
                id TEXT PRIMARY KEY,
                name TEXT,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                settings TEXT DEFAULT '{}',
                is_active BOOLEAN DEFAULT 1
            )`,
            
            // Messages table
            `CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT UNIQUE,
                user_id TEXT,
                group_id TEXT,
                content TEXT,
                type TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                sentiment_score REAL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )`,
            
            // Games table
            `CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                group_id TEXT,
                game_type TEXT,
                score INTEGER DEFAULT 0,
                result TEXT,
                played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )`,
            
            // Quiz table
            `CREATE TABLE IF NOT EXISTS quiz_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT,
                question TEXT,
                correct_answer TEXT,
                options TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                is_active BOOLEAN DEFAULT 1,
                winner_id TEXT,
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )`,
            
            // Reminders table
            `CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                group_id TEXT,
                message TEXT,
                remind_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_sent BOOLEAN DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
            
            // Achievements table
            `CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                achievement_type TEXT,
                achievement_name TEXT,
                earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
            
            // URL Shortener table
            `CREATE TABLE IF NOT EXISTS short_urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                short_code TEXT UNIQUE,
                original_url TEXT,
                user_id TEXT,
                clicks INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
            
            // Word frequency table
            `CREATE TABLE IF NOT EXISTS word_frequency (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT,
                word TEXT,
                count INTEGER DEFAULT 1,
                last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(group_id, word),
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )`,
            
            // Bot settings table
            `CREATE TABLE IF NOT EXISTS bot_settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Polls table
            `CREATE TABLE IF NOT EXISTS polls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT,
                question TEXT,
                options TEXT,
                votes TEXT DEFAULT '{}',
                created_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (group_id) REFERENCES groups(id)
            )`,
            
            // Habits table
            `CREATE TABLE IF NOT EXISTS habits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                habit_name TEXT,
                streak INTEGER DEFAULT 0,
                last_completed DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
            
            // Expenses table
            `CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT,
                user_id TEXT,
                description TEXT,
                amount REAL,
                category TEXT,
                date DATE DEFAULT CURRENT_DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES groups(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
            
            // Admin users table
            `CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE,
                added_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (added_by) REFERENCES users(id)
            )`,
            
            // Custom questions table for admin-added content
            `CREATE TABLE IF NOT EXISTS custom_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT, -- quiz, tekateki, siapakahaku, caklontong, tebakkata
                question TEXT,
                answer TEXT,
                options TEXT, -- JSON for quiz options
                hint TEXT,
                clue TEXT,
                name TEXT, -- for siapakahaku
                word TEXT, -- for tebakkata
                added_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (added_by) REFERENCES users(id)
            )`,
            
            // AI conversations table
            `CREATE TABLE IF NOT EXISTS ai_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id TEXT,
                user_name TEXT,
                user_message TEXT,
                ai_response TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Error logs table
            `CREATE TABLE IF NOT EXISTS error_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT, -- command_error, database_error, system_error
                command TEXT,
                user_id TEXT,
                error_message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`,
            
            // AI configuration table
            `CREATE TABLE IF NOT EXISTS ai_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                api_key TEXT,
                is_active BOOLEAN DEFAULT 1,
                set_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (set_by) REFERENCES users(id)
            )`,
            
            // API Keys management table
            `CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider TEXT NOT NULL, -- 'gemini', 'groq', etc
                api_key TEXT NOT NULL,
                name TEXT, -- friendly name for the key
                is_active BOOLEAN DEFAULT 1,
                usage_count INTEGER DEFAULT 0,
                daily_limit INTEGER DEFAULT 1000,
                monthly_limit INTEGER DEFAULT 30000,
                last_used DATETIME,
                last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
                error_count INTEGER DEFAULT 0,
                set_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (set_by) REFERENCES users(id)
            )`,
            
            // Tasks table
            `CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                due_date DATETIME,
                priority TEXT DEFAULT 'medium', -- low, medium, high
                status TEXT DEFAULT 'pending', -- pending, in_progress, completed, overdue
                category TEXT DEFAULT 'general', -- general, assignment, exam, project, presentation, reading
                reminder_time DATETIME,
                reminder_sent BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                task_type TEXT DEFAULT 'personal', -- personal, group
                group_id TEXT,
                repeat_option TEXT DEFAULT 'once', -- once, daily, weekly, monthly
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`
        ];

        // Create tables using better-sqlite3 API
        for (const sql of tables) {
            try {
                this.db.exec(sql);
            } catch (err) {
                // Removed console.error for faster execution
            }
        }
            
        // Create indexes for better performance
            const indexes = [
                'CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id)',
                'CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)',
                'CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_word_frequency_group_id ON word_frequency(group_id)',
                'CREATE INDEX IF NOT EXISTS idx_users_level ON users(level)',
                'CREATE INDEX IF NOT EXISTS idx_users_points ON users(points)',
                'CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)',
                'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
                'CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type)'
            ];

            for (const sql of indexes) {
                try {
                    this.db.exec(sql);
                } catch (err) {
                    // Removed console.error for faster execution
                }
            }
            
            // Check and add missing columns for tasks table (moved outside the try-catch for initTables)
            this.initTasksTableColumns(); 
        } catch (err) {
            // Removed console.error for faster execution
        }
    }
    
    // Inisialis kolom-kolom tabel tasks jika belum ada
    initTasksTableColumns() {
        try {
            // Periksa apakah kolom task_type dan group_id sudah ada
            const rows = this.db.prepare("PRAGMA table_info(tasks)").all();
            
            // Pastikan rows adalah array
            const rowsArray = Array.isArray(rows) ? rows : [];
            
            // Jika kolom task_type belum ada, tambahkan
            const hasTaskType = rowsArray.some(row => row.name === 'task_type');
            if (!hasTaskType) {
                try {
                    this.db.exec('ALTER TABLE tasks ADD COLUMN task_type TEXT DEFAULT \'personal\'');
                } catch (err) {
                    // Removed console.error for faster execution
                }
            }
            
            // Jika kolom group_id belum ada, tambahkan
            const hasGroupId = rowsArray.some(row => row.name === 'group_id');
            if (!hasGroupId) {
                try {
                    this.db.exec('ALTER TABLE tasks ADD COLUMN group_id TEXT');
                } catch (err) {
                    // Removed console.error for faster execution
                }
            }
            
            // Jika kolom repeat_option belum ada, tambahkan
            const hasRepeatOption = rowsArray.some(row => row.name === 'repeat_option');
            if (!hasRepeatOption) {
                try {
                    this.db.exec('ALTER TABLE tasks ADD COLUMN repeat_option TEXT DEFAULT \'once\'');
                } catch (err) {
                    // Removed console.error for faster execution
                }
            }
        } catch (err) {
            // Removed console.error for faster execution
        }
    }

    // User methods
    getUser(userId) {
        try {
            const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
            return stmt.get(userId);
        } catch (err) {
            throw err;
        }
    }

    createUser(userId, name, phone) {
        try {
            const stmt = this.db.prepare('INSERT OR IGNORE INTO users (id, name, phone) VALUES (?, ?, ?)');
            const result = stmt.run(userId, name, phone);
            return result.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }

    updateUserExp(userId, exp) {
        try {
            const stmt = this.db.prepare('UPDATE users SET exp = exp + ?, level = CASE WHEN (exp + ?) >= (level * 100) THEN level + 1 ELSE level END WHERE id = ?');
            const result = stmt.run(exp, exp, userId);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    updateUserPoints(userId, points) {
        try {
            const stmt = this.db.prepare('UPDATE users SET points = points + ? WHERE id = ?');
            const result = stmt.run(points, userId);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    // Message methods
    saveMessage(messageId, userId, groupId, content, type, sentiment = 0) {
        try {
            // Generate a unique message ID if not provided or if it's null/undefined
            const uniqueMessageId = messageId || `${userId}_${groupId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const stmt = this.db.prepare('INSERT OR IGNORE INTO messages (message_id, user_id, group_id, content, type, sentiment_score) VALUES (?, ?, ?, ?, ?, ?)');
            const result = stmt.run(uniqueMessageId, userId, groupId, content, type, sentiment);
            return result.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }
    
    // Mendapatkan log pesan
    getMessageLogs(limit = 100, offset = 0) {
        try {
            const stmt = this.db.prepare(`
                SELECT m.*, 
                       datetime(m.timestamp, 'localtime') as formatted_time
                FROM messages m 
                ORDER BY m.timestamp DESC 
                LIMIT ? OFFSET ?
            `);
            return stmt.all(limit, offset);
        } catch (err) {
            throw err;
        }
    }
    
    // Mendapatkan jumlah total pesan
    getMessageCount() {
        try {
            const stmt = this.db.prepare('SELECT COUNT(*) as count FROM messages');
            const result = stmt.get();
            return result.count;
        } catch (err) {
            throw err;
        }
    }
    
    // Menghapus semua log pesan
    clearAllMessageLogs() {
        try {
            const stmt = this.db.prepare('DELETE FROM messages');
            const result = stmt.run();
            return result.changes;
        } catch (err) {
            throw err;
        }
    }
    
    // Menghapus log pesan berdasarkan tanggal
    clearMessageLogsByDate(olderThanDays) {
        try {
            const stmt = this.db.prepare(`
                DELETE FROM messages 
                WHERE timestamp < datetime('now', '-' || ? || ' days')
            `);
            const result = stmt.run(olderThanDays);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    // Group methods
    getGroup(groupId) {
        try {
            const stmt = this.db.prepare('SELECT * FROM groups WHERE id = ?');
            return stmt.get(groupId);
        } catch (err) {
            throw err;
        }
    }

    createGroup(groupId, name, description = '') {
        try {
            const stmt = this.db.prepare('INSERT OR IGNORE INTO groups (id, name, description) VALUES (?, ?, ?)');
            const result = stmt.run(groupId, name, description);
            return result.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }

    updateGroupSettings(groupId, settings) {
        try {
            // Konversi objek settings ke JSON string
            const settingsJson = typeof settings === 'object' ? JSON.stringify(settings) : settings;
            
            const stmt = this.db.prepare('UPDATE groups SET settings = ? WHERE id = ?');
            const result = stmt.run(settingsJson, groupId);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    // Game methods
    saveGameResult(userId, groupId, gameType, score, result) {
        try {
            const stmt = this.db.prepare('INSERT INTO games (user_id, group_id, game_type, score, result) VALUES (?, ?, ?, ?, ?)');
            const insertResult = stmt.run(userId, groupId, gameType, score, result);
            return insertResult.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }

    // Leaderboard methods
    getLeaderboard(groupId, type = 'points', limit = 10) {
        try {
            let query;
            if (type === 'points') {
                query = 'SELECT name, points, level FROM users ORDER BY points DESC LIMIT ?';
            } else if (type === 'level') {
                query = 'SELECT name, level, exp FROM users ORDER BY level DESC, exp DESC LIMIT ?';
            } else if (type === 'games') {
                query = `SELECT u.name, COUNT(g.id) as games_played, AVG(g.score) as avg_score 
                        FROM users u JOIN games g ON u.id = g.user_id 
                        WHERE g.group_id = ? 
                        GROUP BY u.id ORDER BY games_played DESC LIMIT ?`;
            }
            
            const params = type === 'games' ? [groupId, limit] : [limit];
            const stmt = this.db.prepare(query);
            return stmt.all(...params);
        } catch (err) {
            throw err;
        }
    }

    // Statistics methods
    getGroupStats(groupId) {
        try {
            const queries = {
                totalMessages: 'SELECT COUNT(*) as count FROM messages WHERE group_id = ?',
                activeUsers: 'SELECT COUNT(DISTINCT user_id) as count FROM messages WHERE group_id = ? AND date(timestamp) = date("now")',
                topWords: `SELECT word, count FROM word_frequency WHERE group_id = ? ORDER BY count DESC LIMIT 10`,
                avgSentiment: 'SELECT AVG(sentiment_score) as avg FROM messages WHERE group_id = ? AND sentiment_score != 0'
            };

            const results = {};
            
            for (const [key, query] of Object.entries(queries)) {
                try {
                    const stmt = this.db.prepare(query);
                    if (key === 'topWords') {
                        results[key] = stmt.all(groupId);
                    } else {
                        results[key] = stmt.get(groupId);
                    }
                } catch (err) {
                    results[key] = null;
                }
            }
            
            return results;
        } catch (err) {
            throw err;
        }
    }

    // Admin methods
    getAdmins() {
        try {
            const stmt = this.db.prepare('SELECT user_id FROM admin_users WHERE is_active = 1');
            const rows = stmt.all();
            // Pastikan rows adalah array
            const rowsArray = Array.isArray(rows) ? rows : [];
            return rowsArray.map(row => row.user_id);
        } catch (err) {
            throw err;
        }
    }

    addAdmin(userId, addedBy) {
        try {
            const stmt = this.db.prepare('INSERT OR IGNORE INTO admin_users (user_id, added_by) VALUES (?, ?)');
            const result = stmt.run(userId, addedBy);
            return result.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }

    removeAdmin(userId) {
        try {
            const stmt = this.db.prepare('UPDATE admin_users SET is_active = 0 WHERE user_id = ?');
            const result = stmt.run(userId);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    // API Key methods
    getApiKeys(provider = null) {
        try {
            let query = 'SELECT * FROM api_keys WHERE is_active = 1';
            
            if (provider) {
                query += ' AND provider = ?';
                const stmt = this.db.prepare(query);
                return stmt.all(provider);
            } else {
                const stmt = this.db.prepare(query);
                return stmt.all();
            }
        } catch (err) {
            throw err;
        }
    }

    addApiKey(provider, apiKey, name, setBy, dailyLimit = 1000, monthlyLimit = 30000) {
        try {
            const stmt = this.db.prepare('INSERT INTO api_keys (provider, api_key, name, set_by, daily_limit, monthly_limit) VALUES (?, ?, ?, ?, ?, ?)');
            const result = stmt.run(provider, apiKey, name, setBy, dailyLimit, monthlyLimit);
            return result.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }

    removeApiKey(id) {
        try {
            const stmt = this.db.prepare('UPDATE api_keys SET is_active = 0 WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    updateApiKeyUsage(id) {
        try {
            const stmt = this.db.prepare('UPDATE api_keys SET usage_count = usage_count + 1, last_used = CURRENT_TIMESTAMP WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    resetApiKeyUsage() {
        try {
            const stmt = this.db.prepare('UPDATE api_keys SET usage_count = 0, last_reset = CURRENT_TIMESTAMP');
            const result = stmt.run();
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    // AI Conversation methods
    saveAIConversation(chatId, userName, userMessage, aiResponse) {
        try {
            const stmt = this.db.prepare('INSERT INTO ai_conversations (chat_id, user_name, user_message, ai_response) VALUES (?, ?, ?, ?)');
            const result = stmt.run(chatId, userName, userMessage, aiResponse);
            return result.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }

    getAIConversationHistory(chatId, limit = 10) {
        try {
            const stmt = this.db.prepare('SELECT * FROM ai_conversations WHERE chat_id = ? ORDER BY created_at DESC LIMIT ?');
            return stmt.all(chatId, limit);
        } catch (err) {
            throw err;
        }
    }

    clearAIConversationHistory(chatId) {
        try {
            const stmt = this.db.prepare('DELETE FROM ai_conversations WHERE chat_id = ?');
            const result = stmt.run(chatId);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    // Custom questions methods
    addCustomQuestion(type, question, answer, options = null, hint = null, clue = null, name = null, word = null, addedBy) {
        try {
            const stmt = this.db.prepare('INSERT INTO custom_questions (type, question, answer, options, hint, clue, name, word, added_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            const result = stmt.run(type, question, answer, options, hint, clue, name, word, addedBy);
            return result.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }

    getCustomQuestions(type, limit = 100) {
        try {
            const stmt = this.db.prepare('SELECT * FROM custom_questions WHERE type = ? AND is_active = 1 ORDER BY RANDOM() LIMIT ?');
            return stmt.all(type, limit);
        } catch (err) {
            throw err;
        }
    }

    // Error logging
    logError(type, command, userId, errorMessage) {
        try {
            const stmt = this.db.prepare('INSERT INTO error_logs (type, command, user_id, error_message) VALUES (?, ?, ?, ?)');
            const result = stmt.run(type, command, userId, errorMessage);
            return result.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }

    getErrorLogs(limit = 20) {
        try {
            const stmt = this.db.prepare('SELECT * FROM error_logs ORDER BY timestamp DESC LIMIT ?');
            return stmt.all(limit);
        } catch (err) {
            throw err;
        }
    }

    // Database maintenance
    vacuum() {
        try {
            this.db.exec('VACUUM');
            return true;
        } catch (err) {
            throw err;
        }
    }

    incrementAPIKeyError(id) {
        try {
            const stmt = this.db.prepare('UPDATE api_keys SET error_count = error_count + 1 WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    checkAndRemoveExceededKeys() {
        try {
            // Check for keys that have exceeded their daily limit
            const stmt = this.db.prepare('UPDATE api_keys SET is_active = 0 WHERE usage_count >= daily_limit AND is_active = 1');
            const result = stmt.run();
            return result.changes;
        } catch (err) {
            throw err;
        }
    }

    getActiveAPIKey(provider) {
        try {
            const stmt = this.db.prepare('SELECT * FROM api_keys WHERE provider = ? AND is_active = 1 ORDER BY usage_count ASC LIMIT 1');
            return stmt.get(provider);
        } catch (err) {
            throw err;
        }
    }

    getActiveAIConfig() {
        try {
            const stmt = this.db.prepare('SELECT * FROM ai_config WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1');
            return stmt.get();
        } catch (err) {
            throw err;
        }
    }
    
    // Response template methods
    addResponseTemplate(keyword, response, isPrivateOnly, isGroupOnly, addedBy) {
        try {
            const stmt = this.db.prepare('INSERT INTO response_templates (keyword, response, is_private_only, is_group_only, added_by) VALUES (?, ?, ?, ?, ?)');
            const result = stmt.run(keyword, response, isPrivateOnly ? 1 : 0, isGroupOnly ? 1 : 0, addedBy);
            return result.lastInsertRowid;
        } catch (err) {
            throw err;
        }
    }
    
    updateResponseTemplate(id, keyword, response, isPrivateOnly, isGroupOnly) {
        try {
            const stmt = this.db.prepare('UPDATE response_templates SET keyword = ?, response = ?, is_private_only = ?, is_group_only = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
            const result = stmt.run(keyword, response, isPrivateOnly ? 1 : 0, isGroupOnly ? 1 : 0, id);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }
    
    removeResponseTemplate(id) {
        try {
            const stmt = this.db.prepare('UPDATE response_templates SET is_active = 0 WHERE id = ?');
            const result = stmt.run(id);
            return result.changes;
        } catch (err) {
            throw err;
        }
    }
    
    getResponseTemplates() {
        try {
            const stmt = this.db.prepare('SELECT * FROM response_templates WHERE is_active = 1 ORDER BY created_at DESC');
            return stmt.all();
        } catch (err) {
            throw err;
        }
    }
    
    getResponseTemplateById(id) {
        try {
            const stmt = this.db.prepare('SELECT * FROM response_templates WHERE id = ? AND is_active = 1');
            return stmt.get(id);
        } catch (err) {
            throw err;
        }
    }
    
    findMatchingTemplates(message, isPrivateChat) {
        try {
            let query = 'SELECT * FROM response_templates WHERE is_active = 1';
            
            // Filter by chat type
            if (isPrivateChat) {
                query += ' AND (is_private_only = 1 OR (is_private_only = 0 AND is_group_only = 0))';
            } else {
                query += ' AND (is_group_only = 1 OR (is_private_only = 0 AND is_group_only = 0))';
            }
            
            const stmt = this.db.prepare(query);
            const rows = stmt.all();
            
            // Pastikan rows adalah array
            const rowsArray = Array.isArray(rows) ? rows : [];
            
            // Perform fuzzy matching on the message
            const matches = rowsArray.filter(template => {
                // Simple fuzzy matching - check if keyword is contained in message
                // or if message contains words similar to the keyword
                const messageLower = message.toLowerCase();
                const keywordLower = template.keyword.toLowerCase();
                
                // Direct match
                if (messageLower.includes(keywordLower)) {
                    return true;
                }
                
                // Split into words for partial matching
                const keywordWords = keywordLower.split(/\s+/);
                const messageWords = messageLower.split(/\s+/);
                
                // Check if at least 70% of keyword words are in the message
                let matchCount = 0;
                for (const keywordWord of keywordWords) {
                    if (keywordWord.length <= 3) {
                        // For short words, require exact match
                        if (messageWords.includes(keywordWord)) {
                            matchCount++;
                        }
                    } else {
                        // For longer words, check if any message word contains this keyword word
                        for (const messageWord of messageWords) {
                            if (messageWord.includes(keywordWord) || 
                                keywordWord.includes(messageWord) ||
                                this._levenshteinDistance(messageWord, keywordWord) <= 2) {
                                matchCount++;
                                break;
                            }
                        }
                    }
                }
                
                // Return true if at least 70% of words match
                return matchCount >= Math.ceil(keywordWords.length * 0.7);
            });
            
            return matches;
        } catch (err) {
            throw err;
        }
    }
    
    // Helper method for fuzzy matching - Levenshtein distance calculation
    _levenshteinDistance(a, b) {
        const matrix = [];
        
        // Increment along the first column of each row
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        // Increment each column in the first row
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        // Fill in the rest of the matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    }

    // Tasks methods
    getGroupTasks(groupId, status = null) {
        try {
            let sql = 'SELECT * FROM tasks WHERE group_id = ? AND task_type = "group"';
            const params = [groupId];
            
            if (status) {
                sql += ' AND status = ?';
                params.push(status);
            }
            
            sql += ' ORDER BY due_date ASC';
            
            const stmt = this.db.prepare(sql);
            const rows = stmt.all(...params);
            
            // Update status tugas yang sudah lewat deadline untuk semua tugas grup
            this.updateGroupOverdueTasks(groupId);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    // Update status tugas yang sudah lewat deadline
    updateOverdueTasks(userId) {
        try {
            const now = new Date().toISOString();
            const sql = `UPDATE tasks 
                SET status = 'overdue', updated_at = CURRENT_TIMESTAMP 
                WHERE user_id = ? AND status = 'pending' AND due_date < ? AND due_date IS NOT NULL`;
            
            const stmt = this.db.prepare(sql);
            stmt.run(userId, now);
        } catch (err) {
            // Silently handle error
        }
    }

    // Update status tugas grup yang sudah lewat deadline
    updateGroupOverdueTasks(groupId) {
        try {
            const now = new Date().toISOString();
            const sql = `UPDATE tasks 
                SET status = 'overdue', updated_at = CURRENT_TIMESTAMP 
                WHERE group_id = ? AND task_type = 'group' AND status = 'pending' AND due_date < ? AND due_date IS NOT NULL`;
            
            const stmt = this.db.prepare(sql);
            stmt.run(groupId, now);
        } catch (err) {
            // Silently handle error
        }
    }

    // Dapatkan detail tugas
    getTask(taskId, userId) {
        try {
            const sql = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
            
            const stmt = this.db.prepare(sql);
            const row = stmt.get(taskId, userId);
            return row;
        } catch (err) {
            throw err;
        }
    }

    // Update status tugas
    updateTaskStatus(taskId, userId, status) {
        try {
            const sql = `UPDATE tasks 
                SET status = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND user_id = ?`;
            
            const stmt = this.db.prepare(sql);
            const result = stmt.run(status, taskId, userId);
            
            if (result.changes === 0) {
                throw new Error('Tugas tidak ditemukan atau bukan milik Anda');
            }
            
            return {
                message: `✅ Status tugas berhasil diubah menjadi ${status}!`
            };
        } catch (err) {
            throw err;
        }
    }

    // Update detail tugas
    updateTask(taskId, userId, updates) {
        try {
            // Buat query dinamis berdasarkan field yang diupdate
            const fields = [];
            const values = [];
            
            for (const [key, value] of Object.entries(updates)) {
                if (['title', 'description', 'due_date', 'priority', 'category', 'reminder_time'].includes(key)) {
                    fields.push(`${key} = ?`);
                    values.push(value);
                }
            }
            
            if (fields.length === 0) {
                throw new Error('Tidak ada field yang valid untuk diupdate');
            }
            
            fields.push('updated_at = CURRENT_TIMESTAMP');
            
            const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
            values.push(taskId, userId);
            
            const stmt = this.db.prepare(sql);
            const result = stmt.run(...values);
            
            if (result.changes === 0) {
                throw new Error('Tugas tidak ditemukan atau bukan milik Anda');
            }
            
            return {
                message: '✅ Tugas berhasil diupdate!'
            };
        } catch (err) {
            throw err;
        }
    }

    // Hapus tugas
    deleteTask(taskId, userId) {
        try {
            const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
            
            const stmt = this.db.prepare(sql);
            const result = stmt.run(taskId, userId);
            
            if (result.changes === 0) {
                throw new Error('Tugas tidak ditemukan atau bukan milik Anda');
             } else {
                 return {
                     message: '✅ Tugas berhasil dihapus!'
                 };
             }
         } catch (err) {
             throw err;
         }
    }

    // Dapatkan tugas yang akan datang
    getUpcomingTasks(userId, days = 7, taskType = null) {
        try {
            const now = new Date();
            const future = new Date();
            future.setDate(future.getDate() + days);
            
            let sql = `SELECT * FROM tasks 
                WHERE user_id = ? AND status = 'pending' 
                AND due_date BETWEEN ? AND ?`;
            
            const params = [userId, now.toISOString(), future.toISOString()];
            
            if (taskType) {
                sql += ' AND task_type = ?';
                params.push(taskType);
            }
            
            sql += ' ORDER BY due_date ASC';
            
            const stmt = this.db.prepare(sql);
            return stmt.all(...params);
        } catch (err) {
            throw err;
        }
    }

    // Dapatkan tugas yang sudah lewat deadline
    getOverdueTasks(userId, taskType = null) {
        try {
            let sql = `SELECT * FROM tasks 
                WHERE user_id = ? AND status = 'overdue'`;
            
            const params = [userId];
            
            if (taskType) {
                sql += ' AND task_type = ?';
                params.push(taskType);
            }
            
            sql += ' ORDER BY due_date ASC';
            
            const stmt = this.db.prepare(sql);
            return stmt.all(...params);
        } catch (err) {
            throw err;
        }
    }

    // Tambah tugas baru (personal)
    addTask(userId, title, description = '', dueDate = null, priority = 'medium', category = 'general', reminderTime = null, taskType = 'personal', groupId = null, repeatOption = 'once') {
        try {
            const sql = `INSERT INTO tasks 
                (user_id, title, description, due_date, priority, category, reminder_time, task_type, group_id, repeat_option) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const stmt = this.db.prepare(sql);
            const result = stmt.run(userId, title, description, dueDate, priority, category, reminderTime, taskType, groupId, repeatOption);
            
            return {
                id: result.lastInsertRowid,
                message: '✅ Tugas pribadi berhasil ditambahkan!'
            };
        } catch (err) {
            throw err;
        }
    }

    // Tambah tugas grup
    addGroupTask(userId, groupId, title, description = '', dueDate = null, priority = 'medium', category = 'general', reminderTime = null, repeatOption = 'once') {
        try {
            const sql = `INSERT INTO tasks 
                (user_id, group_id, title, description, due_date, priority, category, reminder_time, task_type, repeat_option) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const stmt = this.db.prepare(sql);
            const result = stmt.run(userId, groupId, title, description, dueDate, priority, category, reminderTime, 'group', repeatOption);
            
            return {
                id: result.lastInsertRowid,
                message: '✅ Tugas grup berhasil ditambahkan!'
            };
        } catch (err) {
            throw err;
        }
    }

    // Dapatkan daftar tugas pengguna (personal atau grup)
    getTasks(userId, status = null, category = null, taskType = null) {
        try {
            let sql = 'SELECT * FROM tasks WHERE user_id = ?';
            const params = [userId];
            
            if (status) {
                sql += ' AND status = ?';
                params.push(status);
            }
            
            if (category) {
                sql += ' AND category = ?';
                params.push(category);
            }
            
            if (taskType) {
                sql += ' AND task_type = ?';
                params.push(taskType);
            }
            
            sql += ' ORDER BY due_date ASC';
            
            const stmt = this.db.prepare(sql);
            const rows = stmt.all(...params);
            
            // Update status tugas yang sudah lewat deadline
            this.updateOverdueTasks(userId);
            return rows;
        } catch (err) {
            throw err;
        }
    }

    // Dapatkan tugas yang perlu diingatkan
    getTasksNeedingReminders() {
        try {
            const now = new Date();
            // Ambil tugas yang waktunya reminder sudah tiba tapi belum dikirim notifikasi
            const sql = `SELECT * FROM tasks 
                WHERE reminder_time <= ? 
                AND reminder_sent = 0 
                AND status != 'completed'`;
            
            const stmt = this.db.prepare(sql);
            const rows = stmt.all(now.toISOString());
            
            // Pastikan rows selalu berupa array
            return Array.isArray(rows) ? rows : [];
        } catch (err) {
            throw err;
        }
    }

    // Tandai tugas sudah diingatkan
    markReminderSent(taskId) {
        try {
            const sql = `UPDATE tasks 
                SET reminder_sent = 1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?`;
            
            const stmt = this.db.prepare(sql);
            stmt.run(taskId);
            return true;
        } catch (err) {
            throw err;
        }
    }

    // Dapatkan statistik tugas
    getTaskStats(userId, taskType = null) {
        try {
            let sql = `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
                SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
                SUM(CASE WHEN due_date < CURRENT_TIMESTAMP AND status != 'completed' THEN 1 ELSE 0 END) as late
                FROM tasks WHERE user_id = ?`;
            
            const params = [userId];
            
            if (taskType) {
                sql += ' AND task_type = ?';
                params.push(taskType);
            }
            
            const stmt = this.db.prepare(sql);
            return stmt.get(...params);
        } catch (err) {
            throw err;
        }
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

module.exports = Database;