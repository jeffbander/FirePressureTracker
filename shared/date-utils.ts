/**
 * Utility functions for date calculations
 */

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}