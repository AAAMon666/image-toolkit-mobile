import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

type AdminEnv = {
  url?: string;
  serviceRoleKey?: string;
};

async function readAdminEnv(): Promise<AdminEnv> {
  const direct = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  } satisfies AdminEnv;

  if (direct.url && direct.serviceRoleKey) {
    return direct;
  }

  const localEnvPath = "D:/Desktop/图片工具/app/.env.local";
  const localEnv = await fs.readFile(localEnvPath, "utf8").catch(() => "");
  const localMap = Object.fromEntries(
    localEnv
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );

  return {
    url: direct.url ?? localMap.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: direct.serviceRoleKey ?? localMap.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export async function createAdminClient() {
  const env = await readAdminEnv();

  if (!env.url || !env.serviceRoleKey) {
    throw new Error("缺少 Supabase 管理端环境变量");
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
