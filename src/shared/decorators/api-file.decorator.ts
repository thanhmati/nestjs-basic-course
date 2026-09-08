import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  createMulterDiskStorage,
  imageFileFilter,
} from '../helpers/multer.helper';

interface SingleFileUploadOptions {
  folder: string;
  description?: string;
}

interface MultipleFilesUploadOptions {
  folder: string;
  maxCount?: number;
  description?: string;
}

export const ApiImageUpload = (
  fieldName: string = 'file',
  options: SingleFileUploadOptions,
) => {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: createMulterDiskStorage(options.folder),
        fileFilter: imageFileFilter,
      }),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: options.description ?? 'Chọn file ảnh để tải lên',
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
        required: [fieldName],
      },
    }),
  );
};

export const ApiImagesUpload = (
  fieldName: string = 'files',
  options: MultipleFilesUploadOptions,
) => {
  const maxCount = options.maxCount ?? 5;

  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
        storage: createMulterDiskStorage(options.folder),
        fileFilter: imageFileFilter,
      }),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description:
        options.description ?? `Chọn danh sách ảnh (tối đa ${maxCount} file)`,
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
        required: [fieldName],
      },
    }),
  );
};
