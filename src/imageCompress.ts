// src/imageCompress.ts
export async function compressImageToDataUrl(
  file: File,
  opts?: {
    maxWidth?: number;      // 最大寬度
    maxHeight?: number;     // 最大高度
    quality?: number;       // 初始品質 0~1
    targetBytes?: number;   // 目標大小（bytes）
    maxIterations?: number; // 最多嘗試幾次
  }
): Promise<string> {
  const {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.75,
    targetBytes = 700_000, // ✅ 建議 700KB，避免接近 1MB 爆掉
    maxIterations = 6,
  } = opts ?? {};

  const bitmap = await createImageBitmap(file);

  // 計算等比例縮放
  let { width, height } = bitmap;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(bitmap, 0, 0, width, height);

  let q = quality;
  for (let i = 0; i < maxIterations; i++) {
    const dataUrl = canvas.toDataURL("image/jpeg", q);
    const bytes = dataUrlBytes(dataUrl);
    if (bytes <= targetBytes) return dataUrl;

    // 每次把品質再降一點
    q = Math.max(0.35, q - 0.1);
  }

  // 最後一次：用最低品質產一次（仍可能略大）
  const finalUrl = canvas.toDataURL("image/jpeg", 0.35);
  const finalBytes = dataUrlBytes(finalUrl);

  if (finalBytes > targetBytes) {
    throw new Error(`IMAGE_TOO_LARGE:${finalBytes}`);
  }
  return finalUrl;
}

// 計算 dataURL 實際 bytes（粗略但夠用）
export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}
