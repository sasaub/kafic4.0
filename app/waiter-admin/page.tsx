'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders, Order } from '../context/OrderContext';
import { useTables } from '../context/TablesContext';
import { useMenu, MenuItem } from '../context/MenuContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../components/ToastProvider';
import { printToNetworkPrinter, printViaBrowser, getPrinterSettings } from '../utils/printer';
import Link from 'next/link';

export default function WaiterAdminPage() {
  const { user, logout, isLoading } = useAuth();
  const { addOrder, orders, confirmOrder } = useOrders();
  const { tables } = useTables();
  const { menuItems, categories } = useMenu();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{ item: MenuItem; quantity: number; comment?: string }[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'waiter-admin')) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Učitavanje...</div>
      </div>
    );
  }

  if (!user || user.role !== 'waiter-admin') {
    return null;
  }

  const handleAddItem = (item: MenuItem) => {
    const existingIndex = selectedItems.findIndex(si => si.item.id === item.id);
    
    if (existingIndex >= 0) {
      const updatedItems = [...selectedItems];
      updatedItems[existingIndex].quantity += 1;
      setSelectedItems(updatedItems);
    } else {
      setSelectedItems([...selectedItems, { item, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(selectedItems.filter(si => si.item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    const updatedItems = selectedItems.map(si => 
      si.item.id === itemId ? { ...si, quantity } : si
    );
    setSelectedItems(updatedItems);
  };

  const handleUpdateComment = (itemId: number, comment: string) => {
    const updatedItems = selectedItems.map(si => 
      si.item.id === itemId ? { ...si, comment: comment || undefined } : si
    );
    setSelectedItems(updatedItems);
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, si) => total + (si.item.price * si.quantity), 0);
  };

  const handleCreateOrder = () => {
    if (!selectedTable) {
      showToast('Molimo izaberite sto', 'warning');
      return;
    }

    if (selectedItems.length === 0) {
      showToast('Molimo dodajte bar jednu stavku u porudžbinu', 'warning');
      return;
    }

    // Prikaz konfirmacije
    setShowConfirmDialog(true);
  };

  const handlePrintOrder = async (order: Order) => {
    // Formatiraj sadržaj za štampanje
    const content = `
========================================
        QR RESTAURANT
========================================

Narudžba #${order.id}
${order.table}
Vreme: ${order.time}

----------------------------------------
                STAVKE
----------------------------------------
${order.items.map(item => `
${item.name}
${item.quantity} x ${item.price} RSD = ${item.quantity * item.price} RSD${item.comment ? `\nNapomena: ${item.comment}` : ''}
`).join('')}
----------------------------------------

UKUPNO:                    ${order.total} RSD

========================================
      Hvala na poverenju!
========================================
`;

    const printerSettings = await getPrinterSettings();
    
    if (printerSettings && printerSettings.enabled && printerSettings.ipAddress) {
      try {
        // Štampaj samo preko mrežnog štampača
        const success = await printToNetworkPrinter({
          type: 'order',
          content
        });
        
        if (success) {
          console.log('Štampanje uspešno poslato na mrežni štampač');
        } else {
          console.error('Mrežno štampanje nije uspelo');
        }
      } catch (error) {
        console.error('Greška pri štampanju:', error);
      }
    } else {
      console.warn('Mrežni štampač nije podešen ili nije omogućen');
    }
  };

  const finalizeOrderCreation = async () => {
    const orderItems = selectedItems.map(si => ({
      name: si.item.name,
      quantity: si.quantity,
      price: si.item.price,
      category: si.item.category,
      comment: si.comment // Dodaj komentar ako postoji
    }));

    const newOrder = {
      table: selectedTable,
      items: orderItems,
      total: getTotalPrice()
    };

    try {
      await addOrder(newOrder);
      
      // Reset forme
      setSelectedTable('');
      setSelectedItems([]);
      setShowConfirmDialog(false);
      
      showToast('Porudžbina uspešno kreirana', 'success');
      
      // NE štampaj automatski - korisnik će kliknuti "Štampaj" dugme kada želi
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Greška pri kreiranju porudžbine', 'error');
    }
  };

  const foodCategories = categories.filter(c => c.type === 'Hrana');
  const drinkCategories = categories.filter(c => c.type === 'Piće');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-4 md:p-6" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold" style={{ color: '#FFFFFF' }}>Konobar Admin</h1>
            <p className="text-sm md:text-base mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>Dobrodošli, {user.username}</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/waiter-admin/printer-settings"
              className="px-4 py-2 rounded-lg transition-colors text-sm md:text-base flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Podešavanja Štampača
            </a>
            <Link
              href="/waiter-admin/monthly-tables"
              className="px-4 py-2 rounded-lg transition-colors text-sm md:text-base flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Mesečni Stolovi
            </Link>
            <button 
              onClick={logout}
              className="px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              Odjavi se
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 md:p-6">
        {/* Sekcija za potvrdu porudžbina */}
        {orders.filter(o => o.status === 'Novo' && o.destination === 'waiter').length > 0 && (
          <div className="p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-6" style={{ backgroundColor: '#2B2E34', border: '2px solid #2B2E34' }}>
            <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Pristigle porudžbine za potvrdu</h2>
            <div className="space-y-3">
              {orders.filter(o => o.status === 'Novo' && o.destination === 'waiter').map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-lg border" style={{ borderColor: '#2B2E34' }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{order.table}</h3>
                      <p className="text-sm text-gray-600">#{order.id} • {order.time}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">{order.total} RSD</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="px-4 py-2 text-white rounded-lg font-semibold transition-colors text-sm md:text-base flex items-center gap-2"
                        style={{ backgroundColor: '#1F7A5A', color: '#FFFFFF' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6b4f'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F7A5A'}
                        title="Štampaj porudžbinu"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Štampaj
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            // Otvori print dialog odmah, pre potvrđivanja
                            handlePrintOrder(order);
                            // Potvrdi porudžbinu u pozadini
                            confirmOrder(order.id).catch((error) => {
                              const errorMessage = error instanceof Error ? error.message : 'Nepoznata greška';
                              console.error('Error confirming order:', error);
                              showToast(`Greška pri potvrđivanju porudžbine: ${errorMessage}`, 'error');
                            });
                          } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Nepoznata greška';
                            console.error('Error:', error);
                            showToast(`Greška: ${errorMessage}`, 'error');
                          }
                        }}
                        className="px-4 py-2 text-white rounded-lg font-semibold transition-colors text-sm md:text-base"
                        style={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                      >
                        Potvrdi
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                        {item.name} x{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Izbor stola */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Izaberite sto</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(`Sto ${table.number}`)}
                className={`p-3 md:p-4 rounded-lg border transition-all text-left ${
                  selectedTable === `Sto ${table.number}`
                    ? 'text-white shadow-lg'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
                style={selectedTable === `Sto ${table.number}` ? { backgroundColor: '#4CAF50', borderColor: '#4CAF50' } : {}}
              >
                <div className="font-bold text-base md:text-lg mb-1">Sto {table.number}</div>
                <div className={`text-xs md:text-sm ${
                  selectedTable === `Sto ${table.number}` ? 'opacity-90' : 'text-gray-600'
                }`}>
                  {table.status}
                </div>
                <div className={`text-xs mt-1 ${
                  selectedTable === `Sto ${table.number}` ? 'opacity-80' : 'text-gray-500'
                }`}>
                  Kap.: {table.capacity}
                </div>
              </button>
            ))}
          </div>
            {selectedTable && (
            <div className="mt-3 md:mt-4 p-3 md:p-4 bg-white border border-gray-200 rounded-lg">
              <span className="font-semibold text-gray-800 text-sm md:text-base">Izabran sto: {selectedTable}</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Menu */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Meni</h2>
            
            {/* Hrana */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700 border-b-2 pb-2">Hrana</h3>
              <div className="space-y-4">
                {foodCategories.map(category => {
                  const itemsInCategory = menuItems.filter(item => item.category === category.name);
                  if (itemsInCategory.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="mb-4 md:mb-6">
                      <h4 className="font-bold text-gray-700 mb-2 md:mb-3 text-base md:text-lg">{category.name}</h4>
                      <div className="space-y-2 md:space-y-3">
                        {itemsInCategory.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleAddItem(item)}
                            className="w-full text-left p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex-1">
                                <div className="font-semibold text-sm md:text-base text-gray-800 mb-1">{item.name}</div>
                                <div className="text-xs md:text-sm text-gray-600">{item.description}</div>
                              </div>
                              <div className="font-bold text-gray-700 sm:ml-4 text-base md:text-lg">{item.price} RSD</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Piće */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-700 border-b-2 pb-2">Piće</h3>
              <div className="space-y-4">
                {drinkCategories.map(category => {
                  const itemsInCategory = menuItems.filter(item => item.category === category.name);
                  if (itemsInCategory.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="mb-4 md:mb-6">
                      <h4 className="font-bold text-gray-700 mb-2 md:mb-3 text-base md:text-lg">{category.name}</h4>
                      <div className="space-y-2 md:space-y-3">
                        {itemsInCategory.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleAddItem(item)}
                            className="w-full text-left p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex-1">
                                <div className="font-semibold text-sm md:text-base text-gray-800 mb-1">{item.name}</div>
                                <div className="text-xs md:text-sm text-gray-600">{item.description}</div>
                              </div>
                              <div className="font-bold text-gray-700 sm:ml-4 text-base md:text-lg">{item.price} RSD</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Porudžbina */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md lg:sticky lg:top-24">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Vaša porudžbina</h2>
            
            {selectedItems.length === 0 ? (
              <div className="text-center py-8 md:py-12 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-base md:text-lg font-semibold mb-2">Nemate stavki u porudžbini</p>
                <p className="text-xs md:text-sm">Kliknite na stavke iz menija da ih dodate</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
                  {selectedItems.map(({ item, quantity, comment }) => (
                    <div key={item.id} className="flex flex-col gap-2 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-sm md:text-base text-gray-800 mb-1">{item.name}</div>
                          <div className="text-xs md:text-sm text-gray-600">{item.price} RSD po komadu</div>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, quantity - 1)}
                            className="w-8 h-8 text-white rounded font-bold transition-colors"
                            style={{ backgroundColor: '#EF4444' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-bold">{quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, quantity + 1)}
                            className="w-8 h-8 text-white rounded font-bold transition-colors"
                            style={{ backgroundColor: '#4CAF50' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                          >
                            +
                          </button>
                        </div>
                        <div className="font-bold text-gray-700 min-w-[80px] sm:min-w-[100px] text-left sm:text-right text-base md:text-lg">
                          {item.price * quantity} RSD
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-500 hover:text-gray-700 font-bold text-lg md:text-xl px-2 self-start sm:self-center transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {/* Komentar input - samo za hranu */}
                      {categories.find(c => c.name === item.category)?.type === 'Hrana' && (
                        <div>
                          <input
                            type="text"
                            value={comment || ''}
                            onChange={(e) => handleUpdateComment(item.id, e.target.value)}
                            placeholder="Komentar za kuhinju (opciono)..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none transition-colors"
                            onFocus={(e) => {
                              e.target.style.borderColor = '#4CAF50';
                              e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#D1D5DB';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="border-t-2 border-gray-300 pt-6">
                  <div className="flex justify-between items-center mb-4 md:mb-6 bg-white border border-gray-200 p-3 md:p-4 rounded-lg">
                    <span className="text-lg md:text-xl font-bold text-gray-800">UKUPNO:</span>
                    <span className="text-2xl md:text-3xl font-bold text-gray-800">{getTotalPrice()} RSD</span>
                  </div>
                  <button
                    onClick={handleCreateOrder}
                    disabled={!selectedTable}
                    className={`w-full py-3 md:py-4 rounded-lg font-bold text-base md:text-lg transition-colors shadow-lg ${
                      selectedTable
                        ? 'text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    style={selectedTable ? { backgroundColor: '#4CAF50' } : {}}
                    onMouseEnter={(e) => {
                      if (selectedTable) {
                        e.currentTarget.style.backgroundColor = '#45a049';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTable) {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                      }
                    }}
                  >
                    Kreiraj porudžbinu
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Potvrdite porudžbinu</h3>
            <div className="mb-4">
              <p className="font-semibold mb-2">{selectedTable}</p>
              <div className="space-y-2">
                {selectedItems.map(({ item, quantity }) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {quantity}</span>
                    <span>{item.price * quantity} RSD</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                <span>Ukupno:</span>
                <span>{getTotalPrice()} RSD</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
              >
                Otkaži
              </button>
              <button
                onClick={finalizeOrderCreation}
                className="flex-1 py-2 text-white rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                Potvrdi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

