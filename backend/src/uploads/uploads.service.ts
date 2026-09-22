import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type sharpFactory from 'sharp';

const sharp: typeof sharpFactory = require('sharp');

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly uploadDirectory = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');

  async onModuleInit() {
    await mkdir(this.uploadDirectory, { recursive: true });
  }

  async saveImage(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Please select an image file');

    const filename = `${randomUUID()}.webp`;
    const destination = join(this.uploadDirectory, filename);

    try {
      const metadata = await sharp(file.buffer).metadata();
      if (!metadata.format || !['jpeg', 'png', 'webp', 'avif'].includes(metadata.format)) {
        throw new BadRequestException('Unsupported image format');
      }

      const output = await sharp(file.buffer)
        .rotate()
        .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84, effort: 4 })
        .toFile(destination);

      const baseUrl = (process.env.PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
      return {
        url: `${baseUrl}/uploads/${filename}`,
        filename,
        width: output.width,
        height: output.height,
        size: output.size,
        mimeType: 'image/webp',
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('The uploaded file is not a valid image');
    }
  }
}
