export const isValidEmail = (email: string): boolean => {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'El email es requerido';
  }
  if (!isValidEmail(email)) {
    return 'Por favor ingrese un email válido (ejemplo@dominio.com)';
  }
  return null;
};

export const isValidPhone = (phone: string): boolean => {
  // Remove any non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Check if it has at least 10 digits
  return digitsOnly.length >= 10;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return 'El teléfono es requerido';
  }
  if (!isValidPhone(phone)) {
    return 'El teléfono debe tener al menos 10 dígitos';
  }
  return null;
}; 