// Translation utility za meni

export type Language = 'sr' | 'en';

export interface Translations {
  // Header
  menu: string;
  tableNumber: string;
  
  // Categories
  all: string;
  food: string;
  drink: string;
  
  // Actions
  search: string;
  addToCart: string;
  yourOrder: string;
  cartEmpty: string;
  total: string;
  order: string;
  remove: string;
  
  // Messages
  orderSuccess: string;
  loadingMenu: string;
  pleaseWait: string;
  noResults: string;
  errorOrder: string;
  
  // Category types
  hrana: string;
  pice: string;
}

export const translations: Record<Language, Translations> = {
  sr: {
    menu: 'Meni',
    tableNumber: 'Sto broj:',
    all: 'Svi',
    food: 'Jela',
    drink: 'Pića',
    search: '🔍 Pretraži meni...',
    addToCart: 'Dodaj u korpu',
    yourOrder: 'Vaša narudžba',
    cartEmpty: 'Korpa je prazna',
    total: 'Ukupno:',
    order: 'Naruči',
    remove: '✕',
    orderSuccess: '✓ Narudžba uspešno poslata!',
    loadingMenu: 'Učitavanje menija...',
    pleaseWait: 'Molimo sačekajte...',
    noResults: 'Nema rezultata pretrage',
    errorOrder: 'Greška pri slanju narudžbe. Pokušajte ponovo.',
    hrana: 'Hrana',
    pice: 'Piće',
  },
  en: {
    menu: 'Menu',
    tableNumber: 'Table number:',
    all: 'All',
    food: 'Food',
    drink: 'Drinks',
    search: '🔍 Search menu...',
    addToCart: 'Add to cart',
    yourOrder: 'Your order',
    cartEmpty: 'Cart is empty',
    total: 'Total:',
    order: 'Order',
    remove: '✕',
    orderSuccess: '✓ Order successfully sent!',
    loadingMenu: 'Loading menu...',
    pleaseWait: 'Please wait...',
    noResults: 'No search results',
    errorOrder: 'Error sending order. Please try again.',
    hrana: 'Food',
    pice: 'Drinks',
  },
};

// Funkcija za prevod kategorija
export function translateCategory(categoryName: string, lang: Language): string {
  if (lang === 'sr') return categoryName;
  
  // Importujemo iz menuTranslations
  const { categoryTranslations } = require('./menuTranslations');
  
  return categoryTranslations[categoryName] || categoryName;
}

// Funkcija za prevod tipa kategorije
export function translateCategoryType(type: string, lang: Language): string {
  if (lang === 'sr') return type;
  return type === 'Hrana' ? 'Food' : 'Drinks';
}
