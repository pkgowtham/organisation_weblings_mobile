/**
 * Validation utilities and regular expressions used across authentication,
 * profile, support, and organisation setup flows.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\d{10}$/;
export const NAME_REGEX = /^[A-Za-z\s]{1,150}$/;
export const DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;

export const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'csv', 'json', 'zip', 'rar', 'tar', 'gz',
  'mp3', 'wav', 'm4a', 'ogg', 'webm', 'caf', 'amr',
];

export const isValidEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
};

export const isValidOptionalEmail = (email?: string | null): boolean => {
  if (!email || email.trim() === '') return true;
  return EMAIL_REGEX.test(email.trim());
};

export const isValidMobile = (mobile?: string | null): boolean => {
  if (!mobile) return false;
  return PHONE_REGEX.test(mobile.trim());
};

export const isValidOptionalMobile = (mobile?: string | null): boolean => {
  if (!mobile || mobile.trim() === '') return true;
  return PHONE_REGEX.test(mobile.trim());
};

export const isValidName = (name?: string | null): boolean => {
  if (!name) return false;
  return NAME_REGEX.test(name.trim());
};

export const isValidDomain = (domain?: string | null): boolean => {
  if (!domain) return false;
  const trimmed = domain.trim();
  if (trimmed.toLowerCase().includes('example.com')) return false;
  return DOMAIN_REGEX.test(trimmed);
};
