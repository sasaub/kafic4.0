// Automatski prevod menija - kategorije, stavke i opisi
// Ovo je privremeno rešenje dok se ne dodaju engleske kolone u bazu

export type Language = 'sr' | 'en';

// Prevod kategorija
export const categoryTranslations: Record<string, string> = {
  // Hrana
  'Glavna jela': 'Main Courses',
  'Salate': 'Salads',
  'Deserti': 'Desserts',
  'Pizza': 'Pizza',
  'Pasta': 'Pasta',
  'Riba': 'Fish',
  'Meso': 'Meat',
  'Vegetarijanska jela': 'Vegetarian Dishes',
  'Predjela': 'Appetizers',
  'Supe': 'Soups',
  'Sendviči': 'Sandwiches',
  'Burgeri': 'Burgers',
  
  // Piće
  'Sokovi': 'Juices',
  'Kafe': 'Coffee',
  'Alkohol': 'Alcohol',
  'Vina': 'Wines',
  'Piva': 'Beers',
  'Kokteli': 'Cocktails',
  'Bezalkoholna pića': 'Non-Alcoholic Drinks',
  'Topli napitci': 'Hot Beverages',
  'Hladni napitci': 'Cold Beverages',
};

// Prevod čestih naziva jela
export const menuItemTranslations: Record<string, string> = {
  // Glavna jela
  'Ćevapi': 'Ćevapi',
  'Pljeskavica': 'Pljeskavica',
  'Pileća prsa': 'Chicken Breast',
  'Pileći file': 'Chicken Fillet',
  'Pileća krilca': 'Chicken Wings',
  'Pileći batak': 'Chicken Thigh',
  'Svinjski kotlet': 'Pork Chop',
  'Svinjski ražnjići': 'Pork Skewers',
  'Jagnjetina': 'Lamb',
  'Teletina': 'Veal',
  'Ribarska čorba': 'Fish Soup',
  'Riba na žaru': 'Grilled Fish',
  'Losos': 'Salmon',
  'Tuna': 'Tuna',
  'Šaran': 'Carp',
  'Pastrmka': 'Trout',
  
  // Pizza
  'Margarita': 'Margherita',
  'Kapricoza': 'Capricciosa',
  'Quattro Stagioni': 'Four Seasons',
  'Quattro Formaggi': 'Four Cheeses',
  'Havajska': 'Hawaiian',
  'Pepperoni': 'Pepperoni',
  
  // Pasta
  'Spagete': 'Spaghetti',
  'Penne': 'Penne',
  'Fusilli': 'Fusilli',
  'Lasagne': 'Lasagna',
  'Carbonara': 'Carbonara',
  'Bolognese': 'Bolognese',
  'Alfredo': 'Alfredo',
  
  // Salate
  'Šopska salata': 'Shopska Salad',
  'Srpska salata': 'Serbian Salad',
  'Zelena salata': 'Green Salad',
  'Cezar salata': 'Caesar Salad',
  'Grčka salata': 'Greek Salad',
  'Kupus salata': 'Cabbage Salad',
  
  // Deserti
  'Palačinke': 'Pancakes',
  'Krofne': 'Donuts',
  'Torta': 'Cake',
  'Čokoladna torta': 'Chocolate Cake',
  'Tiramisu': 'Tiramisu',
  'Krempita': 'Cream Cake',
  'Baklava': 'Baklava',
  'Tulumba': 'Tulumba',
  'Sladoled': 'Ice Cream',
  
  // Piće
  'Espresso': 'Espresso',
  'Cappuccino': 'Cappuccino',
  'Latte': 'Latte',
  'Macchiato': 'Macchiato',
  'Americano': 'Americano',
  'Nes kafa': 'Nescafé',
  'Čaj': 'Tea',
  'Zeleni čaj': 'Green Tea',
  'Crni čaj': 'Black Tea',
  'Sok od pomorandže': 'Orange Juice',
  'Sok od jabuke': 'Apple Juice',
  'Sok od narandže': 'Orange Juice',
  'Coca Cola': 'Coca Cola',
  'Pepsi': 'Pepsi',
  'Fanta': 'Fanta',
  'Sprite': 'Sprite',
  'Voda': 'Water',
  'Mineralna voda': 'Mineral Water',
  'Gazirana voda': 'Sparkling Water',
  'Pivo': 'Beer',
  'Vino': 'Wine',
  'Crno vino': 'Red Wine',
  'Belo vino': 'White Wine',
  'Rakija': 'Rakija',
  'Vodka': 'Vodka',
  'Viski': 'Whiskey',
  'Rum': 'Rum',
};

// Prevod čestih opisa
export const descriptionTranslations: Record<string, string> = {
  'Sveže pripremljeno': 'Freshly prepared',
  'Domaća kuhinja': 'Home cooking',
  'Tradicionalno jelo': 'Traditional dish',
  'Sa prilozima': 'With sides',
  'Porcija': 'Portion',
  'Velika porcija': 'Large portion',
  'Mala porcija': 'Small portion',
  'Za dve osobe': 'For two people',
  'Za četiri osobe': 'For four people',
  'Vruće': 'Hot',
  'Hladno': 'Cold',
  'Sa sirom': 'With cheese',
  'Bez sira': 'Without cheese',
  'Sa mesom': 'With meat',
  'Bez mesa': 'Without meat',
  'Vegetarijanski': 'Vegetarian',
  'Veganski': 'Vegan',
  'Bez glutena': 'Gluten-free',
  'Za decu': 'For children',
  'Za odrasle': 'For adults',
};

// Funkcija za prevod kategorije
export function translateCategory(categoryName: string, lang: Language): string {
  if (lang === 'sr') return categoryName;
  return categoryTranslations[categoryName] || categoryName;
}

// Funkcija za prevod naziva jela
export function translateMenuItemName(itemName: string, lang: Language): string {
  if (lang === 'sr') return itemName;
  
  // Prvo proveri tačan match
  if (menuItemTranslations[itemName]) {
    return menuItemTranslations[itemName];
  }
  
  // Ako nema tačan match, probaj da prevedeš reč po reč
  const words = itemName.split(' ');
  const translatedWords = words.map(word => {
    // Proveri da li je cela reč u prevodima
    if (menuItemTranslations[word]) {
      return menuItemTranslations[word];
    }
    // Ako nije, vrati originalnu reč (možda je već na engleskom ili je ime)
    return word;
  });
  
  return translatedWords.join(' ');
}

// Funkcija za prevod opisa
export function translateDescription(description: string | null | undefined, lang: Language): string {
  if (!description) return '';
  if (lang === 'sr') return description;
  
  // Proveri da li je ceo opis u prevodima
  if (descriptionTranslations[description]) {
    return descriptionTranslations[description];
  }
  
  // Probaj da prevedeš reč po reč
  const words = description.split(' ');
  const translatedWords = words.map(word => {
    const cleanWord = word.replace(/[.,!?;:]/, '');
    if (descriptionTranslations[cleanWord]) {
      return descriptionTranslations[cleanWord];
    }
    return word;
  });
  
  return translatedWords.join(' ');
}

// Funkcija za automatski prevod cele stavke menija
export function translateMenuItem(
  item: { 
    name: string; 
    name_en?: string | null;
    description?: string | null; 
    description_en?: string | null;
    category: string;
    category_en?: string | null;
  }, 
  lang: Language
) {
  // Ako ima engleski naziv u bazi, koristi ga
  const translatedName = lang === 'en' && item.name_en 
    ? item.name_en 
    : lang === 'en' 
      ? translateMenuItemName(item.name, lang)
      : item.name;
  
  // Ako ima engleski opis u bazi, koristi ga
  const translatedDescription = lang === 'en' && item.description_en
    ? item.description_en
    : lang === 'en'
      ? translateDescription(item.description, lang)
      : (item.description || '');
  
  // Ako ima engleski naziv kategorije u bazi, koristi ga
  const translatedCategory = lang === 'en' && item.category_en
    ? item.category_en
    : translateCategory(item.category, lang);
  
  return {
    ...item,
    name: translatedName,
    description: translatedDescription,
    category: translatedCategory,
  };
}
