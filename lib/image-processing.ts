import imageCompression from 'browser-image-compression';

/**
 * Configuration for image compression
 */
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // Maximum file size in MB
  maxWidthOrHeight: 1920, // Maximum width or height
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
};

/**
 * Compress and convert image to grayscale
 * @param file - Image file to process
 * @returns Processed base64 image string (without data URL prefix)
 */
export async function compressAndGrayscaleImage(file: File): Promise<string> {
  try {
    // Step 1: Compress the image
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    
    // Step 2: Convert to grayscale using canvas
    const grayscaleBase64 = await convertToGrayscale(compressedFile);
    
    return grayscaleBase64;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Convert image to grayscale using Canvas API
 * @param file - Image file to convert
 * @returns Base64 string without data URL prefix
 */
async function convertToGrayscale(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;     // Red
          data[i + 1] = avg; // Green
          data[i + 2] = avg; // Blue
          // Alpha channel (data[i + 3]) remains unchanged
        }
        
        // Put the grayscale image data back on canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Convert canvas to base64 (JPEG for better compression)
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        
        // Remove the data URL prefix (data:image/jpeg;base64,)
        const base64WithoutPrefix = base64.split(',')[1];
        
        resolve(base64WithoutPrefix);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Convert PDF to images (first page only for receipt processing)
 * @param file - PDF file to convert
 * @returns Base64 image string of the first page
 */
export async function convertPdfToImage(file: File): Promise<string> {
  try {
    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Get first page
    const page = await pdf.getPage(1);
    
    // Set scale for better quality
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;
    
    // Convert to grayscale
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    
    context.putImageData(imageData, 0, 0);
    
    // Convert to base64
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    
    // Remove data URL prefix
    const base64WithoutPrefix = base64.split(',')[1];
    
    return base64WithoutPrefix;
  } catch (error) {
    console.error('Error converting PDF to image:', error);
    throw new Error('Failed to convert PDF to image');
  }
}

/**
 * Process receipt file (image or PDF)
 * @param file - Receipt file to process
 * @returns Compressed, grayscale base64 image
 */
export async function processReceiptFile(file: File): Promise<string> {
  const fileType = file.type;
  
  if (fileType === 'application/pdf') {
    // Convert PDF to image
    return await convertPdfToImage(file);
  } else if (fileType.startsWith('image/')) {
    // Process image (compress + grayscale)
    return await compressAndGrayscaleImage(file);
  } else {
    throw new Error('Unsupported file type. Please upload an image or PDF file.');
  }
}

/**
 * Get file size in MB
 * @param file - File to check
 * @returns Size in MB
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum allowed size in MB
 * @returns true if valid, false otherwise
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  return getFileSizeMB(file) <= maxSizeMB;
}
