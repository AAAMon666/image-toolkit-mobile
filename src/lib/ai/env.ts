import fs from "node:fs/promises";

export async function readAiEnv() {
  const direct = {
    baseUrl: process.env.FOROPENCODE_BASE_URL,
    apiKey: process.env.FOROPENCODE_API_KEY,
    model: process.env.FOROPENCODE_IMAGE_MODEL,
  };

  if (direct.baseUrl && direct.apiKey && direct.model) {
    return direct;
  }

  const settingsPath = "C:/Users/48630/.claude/settings.json";
  const raw = await fs.readFile(settingsPath, "utf8");
  const settings = JSON.parse(raw);
  const env = settings.env ?? {};

  return {
    baseUrl: direct.baseUrl ?? env.FOROPENCODE_BASE_URL,
    apiKey: direct.apiKey ?? env.FOROPENCODE_API_KEY,
    model: direct.model ?? env.FOROPENCODE_IMAGE_MODEL,
  };
}
