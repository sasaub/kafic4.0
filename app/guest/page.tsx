'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrders } from '../context/OrderContext';
import { useMenu, MenuItem } from '../context/MenuContext';
import { translations, translateCategory, type Language } from '../utils/translations';
import { translateMenuItem, translateMenuItemName, translateDescription } from '../utils/menuTranslations';

function GuestPageContent() {
  const searchParams = useSearchParams();
  const tableFromQR = searchParams.get('table') || '5'; // Uzmi broj stola iz URL-a
  
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Svi');
  const [tableNumber, setTableNumber] = useState<string>(tableFromQR);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState<Language>('sr');
  const { addOrder } = useOrders();
  const { menuItems, categories: allCategories, isLoaded } = useMenu(); // Koristi globalni meni
  
  const t = translations[language];

  // Ažuriraj broj stola ako se URL promeni
  useEffect(() => {
    if (tableFromQR) {
      setTableNumber(tableFromQR);
    }
  }, [tableFromQR]);

  // Prikaži loading dok se podaci učitavaju
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🍽️</div>
          <div className="text-2xl font-bold text-gray-700">{t.loadingMenu}</div>
          <div className="text-sm text-gray-500 mt-2">{t.pleaseWait}</div>
        </div>
      </div>
    );
  }

  // Fallback ako nema kategorija ili meni stavki
  const allCategoryName = language === 'sr' ? 'Svi' : 'All';
  const categoryNames = allCategories && allCategories.length > 0 
    ? [allCategoryName, ...allCategories.map(c => c.name)]
    : [allCategoryName];

  const filteredItems = (menuItems || []).filter(item => {
    if (!item) return false;
    const matchesCategory = selectedCategory === allCategoryName || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleOrder = async () => {
    if (cart.length === 0) return;
    
    // Grupisanje stavki po imenu i količini
    const groupedItems = cart.reduce((acc, item) => {
      const existing = acc.find(i => i.name === item.name);
      if (existing) {
        existing.quantity += 1;
      } else {
        acc.push({ name: item.name, quantity: 1, price: item.price, category: item.category });
      }
      return acc;
    }, [] as { name: string; quantity: number; price: number; category: string }[]);

    try {
      await addOrder({
        table: `Sto ${tableNumber}`,
        items: groupedItems,
        total,
      });

      setCart([]);
      setOrderSuccess(true);
      
      setTimeout(() => {
        setOrderSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert(t.errorOrder);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'sr' ? 'en' : 'sr';
    setLanguage(newLang);
    // Resetuj selektovanu kategoriju kada se promeni jezik
    const newAllCategoryName = newLang === 'sr' ? 'Svi' : 'All';
    setSelectedCategory(newAllCategoryName);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="text-white p-6 sticky top-0 z-10" style={{ backgroundColor: '#1F2937' }}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{t.menu}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span style={{ color: '#9CA3AF' }}>{t.tableNumber}</span>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-16 px-2 py-1 rounded text-white"
                style={{ backgroundColor: '#374151', borderColor: '#4B5563' }}
              />
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
            style={{ backgroundColor: '#1F7A5A' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#166B4F'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F7A5A'}
            title={language === 'sr' ? 'Switch to English' : 'Prebaci na srpski'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {language === 'sr' ? 'EN' : 'SR'}
          </button>
        </div>
      </div>
      
      {/* Success message */}
      {orderSuccess && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {t.orderSuccess}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Pretraga */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.search}
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
            style={{ borderColor: '#E5E7EB' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#1F7A5A'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Kategorije */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categoryNames.map(category => {
            // Pronađi kategoriju u allCategories da vidimo da li ima name_en
            const categoryObj = allCategories?.find(c => c.name === category);
            let displayCategory: string;
            
            if (language === 'sr') {
              displayCategory = category;
            } else if (categoryObj?.name_en) {
              // Koristi prevod iz baze ako postoji
              displayCategory = categoryObj.name_en;
            } else {
              // Fallback na prevod sistem
              displayCategory = translateCategory(category, language);
            }
            
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                style={isSelected ? { backgroundColor: '#1F7A5A' } : {}}
              >
                {displayCategory}
              </button>
            );
          })}
        </div>

        {/* Lista jela */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t.food}</h2>
            {filteredItems.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
                <div className="text-4xl mb-2">😕</div>
                <p>{t.noResults}</p>
              </div>
            ) : (
              <>
                {filteredItems.map(item => {
                  const translatedItem = translateMenuItem(item, language);
                  return (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{translatedItem.name}</h3>
                          {translatedItem.description && (
                            <p className="text-sm" style={{ color: '#9CA3AF' }}>{translatedItem.description}</p>
                          )}
                        </div>
                        <span className="font-bold" style={{ color: '#1F7A5A' }}>{item.price} RSD</span>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full text-white py-2 rounded-lg transition-colors"
                        style={{ backgroundColor: '#1F7A5A' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#166B4F'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F7A5A'}
                      >
                        {t.addToCart}
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Korpa */}
          <div className="md:sticky md:top-24 h-fit">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">{t.yourOrder}</h2>
              {cart.length === 0 ? (
                <p className="text-center py-8" style={{ color: '#9CA3AF' }}>{t.cartEmpty}</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {cart.map((item, index) => {
                      const translatedItem = translateMenuItem(item, language);
                      return (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <span>{translatedItem.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{item.price} RSD</span>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-red-600 hover:text-red-800"
                              title={t.remove}
                            >
                              {t.remove}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold mb-4">
                      <span>{t.total}</span>
                      <span>{total} RSD</span>
                    </div>
                    <button 
                      onClick={handleOrder}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      {t.order}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🍽️</div>
          <div className="text-2xl font-bold text-gray-700">Loading...</div>
        </div>
      </div>
    }>
      <GuestPageContent />
    </Suspense>
  );
}
