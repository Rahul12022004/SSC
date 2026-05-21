import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { env } from '../config/env';

const execAsync = promisify(exec);

export async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve(process.cwd(), "backups");
  const backupFile = path.join(backupDir, `backup-${timestamp}.gz`);

  try {
    await execAsync(`mkdir -p ${backupDir}`);
    
    const mongoUri = env.MONGO_URI;
    const dbName = mongoUri.split("/").pop()?.split("?")[0];
    
    const command = `mongodump --uri="${mongoUri}" --archive="${backupFile}" --gzip`;
    
    await execAsync(command);
    
    console.log(`[BACKUP] Database backed up to: ${backupFile}`);
    
    await cleanOldBackups(backupDir);
    
    return backupFile;
  } catch (error) {
    console.error("[BACKUP ERROR]", error);
    throw error;
  }
}

async function cleanOldBackups(backupDir: string) {
  try {
    const { stdout } = await execAsync(`find ${backupDir} -name "backup-*.gz" -mtime +7 -delete`);
    if (stdout) console.log("[BACKUP] Cleaned old backups:", stdout);
  } catch (error) {
    console.error("[BACKUP CLEANUP ERROR]", error);
  }
}

if (require.main === module) {
  backupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
