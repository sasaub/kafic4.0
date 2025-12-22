'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrders } from '../context/OrderContext';
import { useMenu, MenuItem } from '../context/MenuContext';

function GuestPageContent() {
  const searchParams = useSearchParams();
  const tableFromQR = searchParams.get('table') || '5'; // Uzmi broj stola iz URL-a
  
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Svi');
  const [tableNumber, setTableNumber] = useState<string>(tableFromQR);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addOrder } = useOrders();
  const { menuItems, categories: allCategories, isLoaded } = useMenu(); // Koristi globalni meni

  // Ažuriraj broj stola ako se URL promeni
  useEffect(() => {
    if (tableFromQR) {
      setTableNumber(tableFromQR);
    }
  }, [tableFromQR]);

  // Prikaži loading dok se podaci učitavaju
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🍽️</div>
          <div className="text-2xl font-bold text-gray-700">Učitavanje menija...</div>
          <div className="text-sm text-gray-500 mt-2">Molimo sačekajte...</div>
        </div>
      </div>
    );
  }

  // Fallback ako nema kategorija ili meni stavki
  const categoryNames = allCategories && allCategories.length > 0 
    ? ['Svi', ...allCategories.map(c => c.name)]
    : ['Svi'];

  const filteredItems = (menuItems || []).filter(item => {
    if (!item) return false;
    const matchesCategory = selectedCategory === 'Svi' || item.category === selectedCategory;
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
      alert('Greška pri slanju narudžbe. Pokušajte ponovo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-600 text-white p-6 sticky top-0 z-10">
        <h1 className="text-3xl font-bold">Meni Restorana</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-orange-100">Sto broj:</span>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-16 px-2 py-1 rounded bg-orange-700 text-white border-orange-500"
          />
        </div>
      </div>
      
      {/* Success message */}
      {orderSuccess && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          ✓ Narudžba uspešno poslata!
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Pretraga */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Pretraži meni..."
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Kategorije */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categoryNames.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Lista jela */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Jela</h2>
            {filteredItems.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
                <div className="text-4xl mb-2">😕</div>
                <p>Nema rezultata pretrage</p>
              </div>
            ) : (
              <>
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                      <span className="text-orange-600 font-bold">{item.price} RSD</span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Dodaj u korpu
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Korpa */}
          <div className="md:sticky md:top-24 h-fit">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Vaša narudžba</h2>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Korpa je prazna</p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{item.price} RSD</span>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold mb-4">
                      <span>Ukupno:</span>
                      <span>{total} RSD</span>
                    </div>
                    <button 
                      onClick={handleOrder}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Naruči
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🍽️</div>
          <div className="text-2xl font-bold text-gray-700">Učitavanje...</div>
        </div>
      </div>
    }>
      <GuestPageContent />
    </Suspense>
  );
}
