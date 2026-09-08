import { BadRequestException, Logger } from '@nestjs/common';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

const logger = new Logger('MulterHelper');

export const createMulterDiskStorage = (subFolder: string) => {
  const destinationPath = join(process.cwd(), 'uploads', subFolder);

  return diskStorage({
    destination: (req, file, cb) => {
      if (!existsSync(destinationPath)) {
        mkdirSync(destinationPath, { recursive: true });
      }
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      const fileExtension = extname(file.originalname).toLowerCase();
      const uniqueName = `${subFolder}-${Date.now()}-${randomUUID()}${fileExtension}`;
      cb(null, uniqueName);
    },
  });
};

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();
  const mimeType = ALLOWED_IMAGE_TYPES[ext];

  if (!mimeType) {
    return cb(
      new BadRequestException(
        `Chỉ chấp nhận file ảnh: ${Object.keys(ALLOWED_IMAGE_TYPES).join(', ')}`,
      ),
      false,
    );
  }

  file.mimetype = mimeType;
  cb(null, true);
};

export const deleteUploadedFile = (relativePath?: string | null) => {
  if (!relativePath) return;

  try {
    const sanitizedPath = relativePath.startsWith('/')
      ? relativePath.slice(1)
      : relativePath;
    const fullPath = join(process.cwd(), sanitizedPath);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
      logger.log(`🗑️ Đã xóa file cũ: ${sanitizedPath}`);
    }
  } catch (error) {
    logger.warn(`⚠️ Không thể xóa file: ${relativePath}`, error);
  }
};
