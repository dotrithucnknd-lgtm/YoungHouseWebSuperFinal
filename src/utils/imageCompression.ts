import imageCompression, { type Options as ImageCompressionOptions } from 'browser-image-compression';

export interface CompressOptions {
  maxWidthOrHeight?: number; // longest edge
  maxSizeMB?: number; // approximate target size
  convertToWebP?: boolean; // prefer WebP output
  quality?: number; // 0..1 when converting
}

// Compress and optionally resize an image file for upload
export async function compressImage(
  inputFile: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidthOrHeight = 1600,
    maxSizeMB = 0.4,
    convertToWebP = true,
    quality = 0.8,
  } = options;

  const compressionOptions: ImageCompressionOptions = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    initialQuality: quality,
    fileType: convertToWebP ? 'image/webp' : undefined,
    alwaysKeepResolution: false,
  };

  const compressedBlob = await imageCompression(inputFile, compressionOptions);

  const ext = convertToWebP ? 'webp' : (inputFile.name.split('.').pop() || 'jpg');
  const newFileName = `${inputFile.name.replace(/\.[^.]+$/, '')}.${ext}`;
  return new File([compressedBlob], newFileName, { type: compressedBlob.type || inputFile.type });
}


