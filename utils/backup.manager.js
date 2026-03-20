const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const execAsync = promisify(exec);

class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.maxBackups = 30; // Keep last 30 backups
  }

  // Initialize backup directory
  async init() {
    try {
      await fs.access(this.backupDir);
    } catch (error) {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info('Backup directory created');
    }
  }

  // Create database backup
  async createDatabaseBackup() {
    try {
      await this.init();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `saraswati_classes_backup_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Execute pg_dump command
      const dbUrl = process.env.DATABASE_URL;
      const dbName = dbUrl.split('/').pop().split('?')[0]; // Extract DB name from URL
      const dbUser = dbUrl.match(/user=(.*?)&|user=(.*)$/)?.[1] || dbUrl.match(/:\/\/.*?:(.*?)@/)?.[1];
      const dbHost = dbUrl.match(/:\/\/(.*?):|:\/\/(.*)@/)?.[1]?.split('@').pop();
      const dbPort = dbUrl.match(/port=(\d+)/)?.[1] || '5432';

      const command = `pg_dump --dbname=${dbUrl} --file="${backupPath}" --format=custom --no-password`;

      await execAsync(command);

      logger.info(`Database backup created: ${backupFileName}`);

      // Clean old backups
      await this.cleanupOldBackups();

      return {
        success: true,
        fileName: backupFileName,
        filePath: backupPath,
        size: (await fs.stat(backupPath)).size
      };
    } catch (error) {
      logger.error('Database backup creation failed:', error);
      throw error;
    }
  }

  // Create file backup (images, documents, etc.)
  async createFileBackup() {
    try {
      await this.init();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `files_backup_${timestamp}.tar.gz`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Create tar archive of uploads directory
      const uploadsDir = path.join(__dirname, '../uploads'); // Assuming uploads directory
      
      try {
        await fs.access(uploadsDir);
        
        const command = `tar -czf "${backupPath}" -C "${path.dirname(uploadsDir)}" "${path.basename(uploadsDir)}"`;
        await execAsync(command);

        logger.info(`File backup created: ${backupFileName}`);

        return {
          success: true,
          fileName: backupFileName,
          filePath: backupPath,
          size: (await fs.stat(backupPath)).size
        };
      } catch (error) {
        // If uploads directory doesn't exist, create an empty backup
        logger.warn('Uploads directory not found, creating empty file backup');
        
        await fs.writeFile(backupPath, '');
        
        return {
          success: true,
          fileName: backupFileName,
          filePath: backupPath,
          size: 0,
          message: 'No uploads directory found, created empty backup'
        };
      }
    } catch (error) {
      logger.error('File backup creation failed:', error);
      throw error;
    }
  }

  // Create full backup (database + files)
  async createFullBackup() {
    try {
      logger.info('Starting full backup process');

      const results = {
        database: await this.createDatabaseBackup(),
        files: await this.createFileBackup(),
        timestamp: new Date().toISOString()
      };

      logger.info('Full backup completed successfully');

      return {
        success: true,
        message: 'Full backup completed successfully',
        results
      };
    } catch (error) {
      logger.error('Full backup failed:', error);
      throw error;
    }
  }

  // Restore database from backup
  async restoreDatabase(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);

      // Verify backup file exists
      await fs.access(backupPath);

      // Execute pg_restore command
      const dbUrl = process.env.DATABASE_URL;
      const command = `pg_restore --dbname=${dbUrl} --clean --if-exists --no-password "${backupPath}"`;

      await execAsync(command);

      logger.info(`Database restored from: ${backupFileName}`);

      return {
        success: true,
        message: `Database restored from ${backupFileName}`
      };
    } catch (error) {
      logger.error('Database restore failed:', error);
      throw error;
    }
  }

  // Get list of available backups
  async getAvailableBackups() {
    try {
      await this.init();

      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.sql') || file.endsWith('.tar.gz')) {
          const filePath = path.join(this.backupDir, file);
          const stat = await fs.stat(filePath);
          
          backups.push({
            fileName: file,
            size: stat.size,
            createdAt: stat.birthtime,
            isDatabase: file.endsWith('.sql'),
            isFiles: file.endsWith('.tar.gz')
          });
        }
      }

      // Sort by creation date (newest first)
      backups.sort((a, b) => b.createdAt - a.createdAt);

      return {
        success: true,
        backups
      };
    } catch (error) {
      logger.error('Failed to get available backups:', error);
      throw error;
    }
  }

  // Clean old backups
  async cleanupOldBackups() {
    try {
      const { backups } = await this.getAvailableBackups();
      
      if (backups.length <= this.maxBackups) {
        return; // Nothing to clean
      }

      // Keep only the newest backups
      const backupsToDelete = backups.slice(this.maxBackups);
      
      for (const backup of backupsToDelete) {
        const backupPath = path.join(this.backupDir, backup.fileName);
        await fs.unlink(backupPath);
        logger.info(`Deleted old backup: ${backup.fileName}`);
      }

      logger.info(`Cleaned up ${backupsToDelete.length} old backups`);
    } catch (error) {
      logger.error('Backup cleanup failed:', error);
    }
  }

  // Schedule automatic backups
  scheduleAutomaticBackups() {
    const cron = require('node-cron');
    
    // Schedule daily backup at 2:00 AM
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Starting scheduled backup');
        await this.createFullBackup();
        logger.info('Scheduled backup completed');
      } catch (error) {
        logger.error('Scheduled backup failed:', error);
      }
    });

    logger.info('Automatic backup scheduler started');
    return job;
  }

  // Disaster recovery - restore from latest backup
  async disasterRecovery() {
    try {
      logger.warn('Starting disaster recovery process');

      const { backups } = await this.getAvailableBackups();
      const latestDbBackup = backups.find(b => b.isDatabase);

      if (!latestDbBackup) {
        throw new Error('No database backup found for recovery');
      }

      // Restore database
      await this.restoreDatabase(latestDbBackup.fileName);

      logger.info('Disaster recovery completed successfully');

      return {
        success: true,
        message: 'Disaster recovery completed successfully',
        restoredFrom: latestDbBackup.fileName
      };
    } catch (error) {
      logger.error('Disaster recovery failed:', error);
      throw error;
    }
  }

  // Health check - verify backup system is working
  async healthCheck() {
    try {
      await this.init();
      
      const { backups } = await this.getAvailableBackups();
      
      const health = {
        backupDirExists: true,
        totalBackups: backups.length,
        lastBackup: backups[0] ? backups[0].createdAt : null,
        oldestBackup: backups[backups.length - 1] ? backups[backups.length - 1].createdAt : null
      };

      logger.info('Backup system health check passed', health);

      return {
        success: true,
        health
      };
    } catch (error) {
      logger.error('Backup system health check failed:', error);
      throw error;
    }
  }
}

module.exports = BackupManager;