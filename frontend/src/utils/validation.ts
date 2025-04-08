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