import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

interface ImageValidationOptions {
  maxSizeInMb?: number; // Dung lượng tối đa (mặc định 2MB)
  required?: boolean; // Bắt buộc phải có file hay không (mặc định true)
}

/**
 * Factory tạo Pipe kiểm duyệt file ảnh tái sử dụng toàn dự án
 */
export const createImageValidationPipe = (options?: ImageValidationOptions) => {
  const maxSizeInMb = options?.maxSizeInMb ?? 2;
  const isRequired = options?.required ?? true;

  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: /(jpg|jpeg|png|webp)$/i,
      fallbackToMimetype: true, // Hỗ trợ diskStorage khi file.buffer không lưu trong RAM
    })
    .addMaxSizeValidator({
      maxSize: maxSizeInMb * 1024 * 1024,
      message: `Dung lượng ảnh không được vượt quá ${maxSizeInMb}MB!`,
    })
    .build({
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      fileIsRequired: isRequired,
    });
};
