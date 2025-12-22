/**
 * Formatira datum iz YYYY-MM-DD formata u DD.MM.YYYY format
 * Takođe podržava ISO string sa vremenom (2025-12-10T23:00:00.000Z)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  // Ako je već u formatu DD.MM.YYYY, vrati ga
  if (dateString.includes('.')) {
    return dateString;
  }
  
  // Ako je ISO string sa vremenom, uzmi samo datum deo
  if (dateString.includes('T')) {
    dateString = dateString.split('T')[0];
  }
  
  // Parsiraj YYYY-MM-DD format
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}.${month}.${year}`;
  }
  
  // Ako format nije prepoznat, pokušaj da parsiraš kao Date
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  
  return dateString; // Vrati original ako ne može da se formatira
}

/**
 * Formatira datum i vreme zajedno
 */
export function formatDateTime(dateString: string, timeString: string): string {
  return `${formatDate(dateString)} ${timeString}`;
}

