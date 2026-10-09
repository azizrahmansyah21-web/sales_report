import fs from "fs";
import path from "path";

export interface DaemonConfig {
  databaseUrl: string;
  whatsappTargetGroupId: string;
  authDir: string;
  cacheAlertsFile: string;
  cacheMorningFile: string;
}

export function loadDaemonConfig(): DaemonConfig {
  const rootDir = process.cwd();
  const envPath = path.resolve(rootDir, ".env");

  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIdx = trimmed.indexOf("=");
      if (separatorIdx !== -1) {
        const key = trimmed.slice(0, separatorIdx).trim();
        let val = trimmed.slice(separatorIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }

  return {
    databaseUrl: process.env.DATABASE_URL || "",
    whatsappTargetGroupId: process.env.WHATSAPP_TARGET_GROUP_ID || "",
    authDir: path.resolve(rootDir, "auth_info_baileys"),
    cacheAlertsFile: path.resolve(rootDir, ".cache_sent_alerts.json"),
    cacheMorningFile: path.resolve(rootDir, ".cache_morning_broadcast.json"),
  };
}
