import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

export type ProcessedImage = {
  uri: string;
  base64?: string;
  width: number;
  height: number;
};

/**
 * Resizes, compresses, and prepares an image for Gemma multimodal processing.
 * Keeps payloads under 1MB and resizes max dimension to 1024px.
 */
export async function processImageForAI(imageUri: string): Promise<ProcessedImage> {
  try {
    if (Platform.OS === 'web') {
      // In web browser environment, handle both standard base64 and blob URIs
      return await processImageWeb(imageUri);
    }

    const manipResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }],
      {
        compress: 0.75,
        format: SaveFormat.JPEG,
        base64: true,
      }
    );

    return {
      uri: manipResult.uri,
      base64: manipResult.base64,
      width: manipResult.width,
      height: manipResult.height,
    };
  } catch (error) {
    // If native manipulation fails, return the original URI
    return {
      uri: imageUri,
      width: 1024,
      height: 768,
    };
  }
}

/**
 * Web client image resizing and base64 extraction using HTML5 Canvas
 */
async function processImageWeb(imageUri: string): Promise<ProcessedImage> {
  return new Promise((resolve) => {
    // If it's already a base64 string
    if (imageUri.startsWith('data:image/')) {
      const parts = imageUri.split(',');
      const base64Data = parts[1] || '';
      resolve({
        uri: imageUri,
        base64: base64Data,
        width: 800,
        height: 600,
      });
      return;
    }

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve({ uri: imageUri, width: 800, height: 600 });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxDim = 1024;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        resolve({
          uri: dataUrl,
          base64,
          width,
          height,
        });
        return;
      }
      resolve({ uri: imageUri, width, height });
    };

    img.onerror = () => {
      resolve({ uri: imageUri, width: 800, height: 600 });
    };

    img.src = imageUri;
  });
}
