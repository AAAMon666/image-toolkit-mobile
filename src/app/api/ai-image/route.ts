import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import { mapRenderSize } from "@/lib/ai/config";
import { readAiEnv } from "@/lib/ai/env";

async function filesToDataUrls(files: File[]) {
  return Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`;
    }),
  );
}

export async function POST(request: Request) {
  const currentUser = await getCurrentAppUser();
  if (!currentUser) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const formData = await request.formData();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const ratioKey = String(formData.get("ratioKey") ?? "square") as never;
  const qualityKey = String(formData.get("qualityKey") ?? "1k") as never;
  const imageCount = Number(formData.get("imageCount") ?? 1);
  const references = formData.getAll("references").filter((item): item is File => item instanceof File);

  if (!prompt) {
    return NextResponse.json({ error: "请输入提示词" }, { status: 400 });
  }

  if (!Number.isFinite(imageCount) || imageCount <= 0) {
    return NextResponse.json({ error: "生成数量不合法" }, { status: 400 });
  }

  if (currentUser.role !== "super_admin" && currentUser.remainingCredits < imageCount) {
    return NextResponse.json({ error: "额度不足，请先申请更多额度" }, { status: 400 });
  }

  const env = await readAiEnv();
  if (!env.baseUrl || !env.apiKey || !env.model) {
    return NextResponse.json({ error: "AI 生图环境变量未配置完整" }, { status: 500 });
  }

  const admin = await createAdminClient();
  const logPayload = {
    user_id: currentUser.id,
    prompt,
    ratio_key: ratioKey,
    quality_key: qualityKey,
    image_count: imageCount,
    reference_count: references.length,
    credits_charged: imageCount,
    status: "failed",
    provider: "foropencode",
    provider_model: env.model,
    error_message: null,
  };

  const { data: insertedLog, error: insertError } = await admin
    .from("image_generation_logs")
    .insert(logPayload)
    .select("id")
    .single();

  if (insertError || !insertedLog) {
    return NextResponse.json({ error: "生成日志初始化失败" }, { status: 500 });
  }

  const logId = insertedLog.id;

  if (currentUser.role !== "super_admin") {
    const { error: consumeError } = await admin.rpc("consume_credits", {
      p_user_id: currentUser.id,
      p_amount: imageCount,
      p_reason: "generate",
      p_related_request_id: logId,
      p_operator_user_id: currentUser.id,
    });

    if (consumeError) {
      await admin
        .from("image_generation_logs")
        .update({ error_message: "insufficient_credits" })
        .eq("id", logId);
      return NextResponse.json({ error: "额度不足，请先申请更多额度" }, { status: 400 });
    }
  }

  const renderSize = mapRenderSize(ratioKey, qualityKey);
  const imagePayload = references.length ? await filesToDataUrls(references) : undefined;
  const promptWithGuide = imagePayload?.length
    ? `${prompt}\n请严格参考上传图片的主体、外观、构图与风格进行生成，在保持参考特征的前提下完成创作。`
    : prompt;
  const body: Record<string, unknown> = {
    model: env.model,
    prompt: promptWithGuide,
    size: renderSize.size,
    n: imageCount,
  };

  if (imagePayload?.length === 1) {
    body.image = imagePayload[0];
    body.reference_images = imagePayload;
  }

  if (imagePayload && imagePayload.length > 1) {
    body.images = imagePayload;
    body.reference_images = imagePayload;
  }

  const response = await fetch(`${env.baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    await admin
      .from("image_generation_logs")
      .update({
        status: "failed",
        error_message: JSON.stringify(payload ?? { status: response.status }),
      })
      .eq("id", logId);

    return NextResponse.json(
      { error: payload?.error?.message ?? "AI 生图请求失败" },
      { status: 502 },
    );
  }

  const images = (payload?.data ?? [])
    .map((item: { url?: string; b64_json?: string }) => {
      if (item.url) {
        return { url: item.url };
      }
      if (item.b64_json) {
        return { url: `data:image/png;base64,${item.b64_json}` };
      }
      return null;
    })
    .filter(Boolean);

  await admin
    .from("image_generation_logs")
    .update({
      status: "success",
      error_message: null,
    })
    .eq("id", logId);

  return NextResponse.json({
    images,
    chargedCredits: currentUser.role === "super_admin" ? 0 : imageCount,
  });
}
