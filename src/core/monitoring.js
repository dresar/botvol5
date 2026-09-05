/**
 * monitoring.js - Module for monitoring system resources on low-spec VPS
 * Designed for 1 Core, 1GB RAM VPS
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

class MonitoringService {
    constructor(client, db) {
        this.client = client;
        this.db = db;
        this.startTime = Date.now();
        this.memoryWarningThreshold = parseInt(process.env.MEMORY_WARNING_THRESHOLD) || 350; // MB
        this.memoryCriticalThreshold = parseInt(process.env.MEMORY_CRITICAL_THRESHOLD) || 400; // MB
        this.monitoringInterval = parseInt(process.env.MEMORY_MONITORING_INTERVAL) || 300000; // 5 minutes
        this.logFile = path.join(__dirname, '..', '..', 'logs', 'monitoring.log');
        
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(level, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - ${message}\n`;
        
        try {
            fs.appendFileSync(this.logFile, logMessage);
        } catch (error) {
            console.error('Error writing to monitoring log:', error);
        }
    }

    getMemoryUsage() {
        const used = process.memoryUsage();
        const total = os.totalmem();
        const free = os.freemem();
        
        return {
            rss: Math.round(used.rss / 1024 / 1024), // MB
            heapTotal: Math.round(used.heapTotal / 1024 / 1024), // MB
            heapUsed: Math.round(used.heapUsed / 1024 / 1024), // MB
            external: Math.round(used.external / 1024 / 1024), // MB
            systemTotal: Math.round(total / 1024 / 1024), // MB
            systemFree: Math.round(free / 1024 / 1024), // MB
            systemUsed: Math.round((total - free) / 1024 / 1024) // MB
        };
    }

    getCPUUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        
        cpus.forEach(cpu => {
            for (let type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        
        return {
            usage: Math.round(100 - (totalIdle / totalTick) * 100),
            cores: cpus.length
        };
    }

    getDiskUsage() {
        try {
            const stats = fs.statSync(__dirname);
            return {
                available: 'N/A', // Requires additional package for accurate disk info
                used: 'N/A'
            };
        } catch (error) {
            return {
                available: 'Error',
                used: 'Error'
            };
        }
    }

    getUptime() {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
        
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    getSystemInfo() {
        const memory = this.getMemoryUsage();
        const cpu = this.getCPUUsage();
        const disk = this.getDiskUsage();
        
        return {
            uptime: this.getUptime(),
            memory,
            cpu,
            disk,
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            pid: process.pid
        };
    }

    checkMemoryHealth() {
        const memory = this.getMemoryUsage();
        
        if (memory.rss >= this.memoryCriticalThreshold) {
            this.log('error', `CRITICAL: Memory usage is ${memory.rss}MB (threshold: ${this.memoryCriticalThreshold}MB)`);
            this.triggerMemoryCleanup();
            return 'critical';
        } else if (memory.rss >= this.memoryWarningThreshold) {
            this.log('warn', `WARNING: Memory usage is ${memory.rss}MB (threshold: ${this.memoryWarningThreshold}MB)`);
            return 'warning';
        }
        
        return 'healthy';
    }

    triggerMemoryCleanup() {
        this.log('info', 'Triggering garbage collection...');
        
        try {
            if (global.gc) {
                global.gc();
                this.log('info', 'Garbage collection completed');
            } else {
                this.log('warn', 'Garbage collection not available. Start Node.js with --expose-gc flag');
            }
        } catch (error) {
            this.log('error', `Garbage collection failed: ${error.message}`);
        }
        
        // Check if auto-restart is needed
        if (process.env.AUTO_RESTART_ENABLED === 'true') {
            const memory = this.getMemoryUsage();
            const restartThreshold = parseInt(process.env.AUTO_RESTART_MEMORY_THRESHOLD) || 400;
            
            if (memory.rss >= restartThreshold) {
                this.log('error', `Memory usage still high (${memory.rss}MB). Triggering restart...`);
                this.scheduleRestart();
            }
        }
    }

    scheduleRestart() {
        this.log('info', 'Scheduling bot restart in 30 seconds...');
        
        setTimeout(() => {
            this.log('info', 'Restarting bot due to high memory usage...');
            process.exit(1); // PM2 will restart the process
        }, 30000);
    }

    startMonitoring() {
        this.log('info', 'VPS Monitoring started');
        
        setInterval(() => {
            const info = this.getSystemInfo();
            const healthStatus = this.checkMemoryHealth();
            
            this.log('info', `System Status - Memory: ${info.memory.rss}MB/${info.memory.systemTotal}MB, CPU: ${info.cpu.usage}%, Uptime: ${info.uptime}, Health: ${healthStatus}`);
            
            // Log detailed info every hour
            if (Date.now() % (60 * 60 * 1000) < this.monitoringInterval) {
                this.logDetailedInfo(info);
            }
        }, this.monitoringInterval);
    }

    logDetailedInfo(info) {
        this.log('info', '=== Detailed System Information ===');
        this.log('info', `Platform: ${info.platform} ${info.arch}`);
        this.log('info', `Node.js: ${info.nodeVersion}`);
        this.log('info', `PID: ${info.pid}`);
        this.log('info', `Uptime: ${info.uptime}`);
        this.log('info', `Memory - RSS: ${info.memory.rss}MB, Heap: ${info.memory.heapUsed}/${info.memory.heapTotal}MB`);
        this.log('info', `System Memory - Used: ${info.memory.systemUsed}MB, Free: ${info.memory.systemFree}MB, Total: ${info.memory.systemTotal}MB`);
        this.log('info', `CPU Usage: ${info.cpu.usage}% (${info.cpu.cores} cores)`);
        this.log('info', '=====================================');
    }

    getHealthReport() {
        const info = this.getSystemInfo();
        const healthStatus = this.checkMemoryHealth();
        
        return {
            status: healthStatus,
            memory: info.memory,
            cpu: info.cpu,
            uptime: info.uptime
        };
    }

    async sendHealthAlert(message) {
        if (!this.client) return;
        
        try {
            // Get admin number from environment variable
            const adminNumber = process.env.ADMIN_NUMBER;
            
            if (adminNumber) {
                await this.client.sendMessage(adminNumber, message);
                this.log('info', `Health alert sent to admin: ${adminNumber}`);
            }
        } catch (error) {
            this.log('error', `Failed to send health alert: ${error.message}`);
        }
    }
}

module.exports = MonitoringService;