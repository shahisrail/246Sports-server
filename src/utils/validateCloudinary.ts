// import { cloudinary } from './cloudinary';

/**
 * Validates if a URL is a valid Cloudinary URL
 * @param url The URL to validate
 * @returns boolean true if the URL is a valid Cloudinary URL
 */
export const isValidCloudinaryUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Allow blob URLs for development (file uploads that haven't been uploaded to Cloudinary yet)
  if (url.startsWith('blob:')) {
    return true;
  }

  // Allow empty strings
  if (url.trim() === '') {
    return true;
  }

  try {
    // Verify it's actually from our Cloudinary account
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dm6crryf2';

    // Check if URL contains our cloudinary cloud name
    if (!url.includes(cloudName)) {
      console.log('Cloudinary validation failed: URL does not contain cloud name', {
        url,
        cloudName,
      });
      return false;
    }

    // Check if it's a valid HTTPS URL from cloudinary
    const urlObj = new URL(url);

    if (urlObj.protocol !== 'https:') {
      console.log('Cloudinary validation failed: Not HTTPS', { url });
      return false;
    }

    // Check if domain is cloudinary.com or res.cloudinary.com
    const domain = urlObj.hostname;
    const isValidDomain =
      domain === 'res.cloudinary.com' ||
      domain === `${cloudName}.cloudinary.com` ||
      domain.endsWith('.cloudinary.com');

    if (!isValidDomain) {
      console.log('Cloudinary validation failed: Invalid domain', { url, domain });
      return false;
    }

    // Check if path contains /image/upload or /image/fetch/
    const pathname = urlObj.pathname;
    const isValidPath = pathname.includes('/image/upload') || pathname.includes('/image/fetch/');

    if (!isValidPath) {
      console.log('Cloudinary validation failed: Invalid path', { url, pathname });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating Cloudinary URL:', error);
    return false;
  }
};

/**
 * Sanitizes and normalizes a Cloudinary URL
 * @param url The URL to sanitize
 * @returns string the normalized URL or empty string if invalid
 */
export const sanitizeCloudinaryUrl = (url: string): string => {
  if (!isValidCloudinaryUrl(url)) {
    return '';
  }

  // Remove any unwanted parameters
  try {
    const urlObj = new URL(url);

    // Keep only Cloudinary and essential parameters
    const allowedParams = ['url', 'quality', 'fetch_format', 'format'];
    const searchParams = new URLSearchParams(urlObj.search);

    for (const [key] of searchParams) {
      if (!allowedParams.includes(key)) {
        searchParams.delete(key);
      }
    }

    urlObj.search = searchParams.toString();
    return urlObj.toString();
  } catch (error) {
    console.error('Error sanitizing Cloudinary URL:', error);
    return '';
  }
};