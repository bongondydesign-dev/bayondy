"use client";

import {
  MAX_AVATAR_UPLOAD_BYTES,
  validateAvatarFileMeta,
} from "@/lib/auth/avatar";

const TARGET_SIZE = 512;

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
 * Recadre au centre (1:1) et compresse la photo de profil côté navigateur
 * (max 512x512, <= 350 Ko).
 */
export async function prepareAvatarDataUrl(
  file: File
): Promise<
  | { ok: true; dataUrl: string }
  | { ok: false; code: "invalid_type" | "too_large" | "upload_error" }
> {
  const metaCheck = validateAvatarFileMeta({
    type: file.type,
    size: file.size,
  });
  if (!metaCheck.ok) {
    return metaCheck;
  }

  try {
    const rawDataUrl = await readFileAsDataUrl(file);
    const img = await loadImage(rawDataUrl);

    const cropSide = Math.max(1, Math.min(img.width, img.height));
    const sx = Math.max(0, Math.floor((img.width - cropSide) / 2));
    const sy = Math.max(0, Math.floor((img.height - cropSide) / 2));
    const outSide = Math.min(TARGET_SIZE, cropSide);

    const canvas = document.createElement("canvas");
    canvas.width = outSide;
    canvas.height = outSide;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { ok: false, code: "upload_error" };
    }

    ctx.drawImage(img, sx, sy, cropSide, cropSide, 0, 0, outSide, outSide);

    const qualities = [0.88, 0.78, 0.66, 0.52];
    const formats = ["image/webp", "image/jpeg"] as const;

    for (const mime of formats) {
      for (const quality of qualities) {
        const candidate = canvas.toDataURL(mime, quality);
        if (
          candidate.startsWith(`data:${mime};base64,`) &&
          estimateBase64Bytes(candidate) <= MAX_AVATAR_UPLOAD_BYTES
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
