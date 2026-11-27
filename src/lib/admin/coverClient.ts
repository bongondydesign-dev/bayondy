"use client";

import {
  MAX_COVER_UPLOAD_BYTES,
  validateCoverFileMeta,
} from "@/lib/admin/cover";

const MAX_WIDTH = 1280;
const MAX_HEIGHT = 720;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("read_failed"));
      }
    };
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode_failed"));
    img.src = src;
  });
}

function estimateBase64Bytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx === -1) return Number.MAX_SAFE_INTEGER;
  const base64 = dataUrl.slice(commaIdx + 1);
  return Math.floor((base64.length * 3) / 4);
}

/**
 * Valide et optimise une photo de couverture côté navigateur (max 1280x720, <= 750 Ko).
 */
export async function prepareCoverDataUrl(
  file: File
): Promise<
  | { ok: true; dataUrl: string }
  | { ok: false; code: "invalid_type" | "too_large" | "upload_error" }
> {
  const metaCheck = validateCoverFileMeta({
    type: file.type,
    size: file.size,
  });
  if (!metaCheck.ok) {
    return metaCheck;
  }

  try {
    const rawDataUrl = await readFileAsDataUrl(file);
    const img = await loadImage(rawDataUrl);

    const needsResize = img.width > MAX_WIDTH || img.height > MAX_HEIGHT;
    if (!needsResize && estimateBase64Bytes(rawDataUrl) <= 350 * 1024) {
      return { ok: true, dataUrl: rawDataUrl };
    }

    const scale = Math.min(1, MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
    const targetWidth = Math.max(1, Math.round(img.width * scale));
    const targetHeight = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { ok: false, code: "upload_error" };
    }
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const qualities = [0.86, 0.76, 0.64, 0.5];
    const formats = ["image/webp", "image/jpeg"] as const;

    for (const mime of formats) {
      for (const quality of qualities) {
        const candidate = canvas.toDataURL(mime, quality);
        if (
          candidate.startsWith(`data:${mime};base64,`) &&
          estimateBase64Bytes(candidate) <= MAX_COVER_UPLOAD_BYTES
        ) {
          return { ok: true, dataUrl: candidate };
        }
      }
    }

    return { ok: false, code: "too_large" };
  } catch {
    return { ok: false, code: "upload_error" };
  }
}
