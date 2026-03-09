// Email validation regex
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 characters, at least one uppercase, one lowercase, one number)
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// UUID validation
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Phone number validation (Barbados format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+1246|1246)?[2-9]\d{2}-\d{4}$/;
  return phoneRegex.test(phone);
};

// Date validation
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Coordinates validation
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Sanitize input (remove HTML tags)
export const sanitizeInput = (input: string): string => {
  return input.replace(/<[^>]*>/g, '').trim();
};

// Validate pagination parameters
export const validatePagination = (page: any, limit: any) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  return {
    page: Math.max(1, pageNum),
    limit: Math.min(100, Math.max(1, limitNum)), // Max 100 items per page
  };
};
