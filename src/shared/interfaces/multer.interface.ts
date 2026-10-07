export interface SingleFileUploadOptions {
  folder: string;
  description?: string;
}

export interface MultipleFilesUploadOptions {
  folder: string;
  maxCount?: number;
  description?: string;
}

export interface ImageValidationOptions {
  maxSizeInMb?: number;
  required?: boolean;
}
