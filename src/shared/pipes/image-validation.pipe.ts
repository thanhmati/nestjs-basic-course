import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

interface ImageValidationOptions {
  maxSizeInMb?: number;
  required?: boolean;
}

export const createImageValidationPipe = (options?: ImageValidationOptions) => {
  const maxSizeInMb = options?.maxSizeInMb ?? 2;
  const isRequired = options?.required ?? true;

  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: /(jpg|jpeg|png|webp)$/i,
      fallbackToMimetype: true,
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
