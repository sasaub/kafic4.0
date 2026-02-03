'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTables } from '../../../context/TablesContext';
import { useOrders } from '../../../context/OrderContext';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '../../../components/ToastProvider';
import Link from 'next/link';
import { formatDateTime } from '../../../utils/dateFormat';

export default function MonthlyTableDetailPage() {
  const { user, logout, isLoading } = useAuth();
  const { tables, addMonthlyPayment } = useTables();
  const { orders } = useOrders();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const tableId = parseInt(params.id as string);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: '', note: '' });

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

  const table = tables.find(t => t.id === tableId);

  if (!table || !table.monthlyPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-semibold mb-2 text-gray-800">Sto nije pronađen</p>
          <Link href="/waiter-admin/monthly-tables" className="text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Nazad na mesečne stolove
          </Link>
        </div>
      </div>
    );
  }

  // Pronađi sve porudžbine za ovaj sto
  // order.table može biti "Sto 1" ili samo "1", pa proveravamo oba formata
  const tableOrders = orders.filter(order => {
    const orderTable = String(order.table).trim().toLowerCase();
    const tableNumber = String(table.number).trim().toLowerCase();
    // Proveri tačno poklapanje ili da li order.table sadrži table.number
    // Takođe proveri obrnuto - da li table.number sadrži order.table (bez "Sto")
    return orderTable === tableNumber || 
           orderTable === `sto ${tableNumber}` ||
           orderTable.includes(tableNumber) ||
           tableNumber.includes(orderTable.replace('sto ', '').trim());
  });
  
  // Debug log za proveru
  console.log('Table:', table.number);
  console.log('All orders:', orders.map(o => ({ id: o.id, table: o.table })));
  console.log('Filtered orders:', tableOrders.map(o => ({ id: o.id, table: o.table })));
  
  // Izračunaj ukupan iznos porudžbina
  const totalOrdersAmount = tableOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Izračunaj ukupan iznos uplata
  const totalPayments = (table.monthlyPayments || []).reduce((sum, payment) => sum + payment.amount, 0);
  
  // Ostatak (duguje)
  const remaining = totalOrdersAmount - totalPayments;

  const handleAddPayment = async () => {
    const amount = parseFloat(newPayment.amount);
    if (!amount || amount <= 0) {
      showToast('Unesite validan iznos', 'warning');
      return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    try {
      await addMonthlyPayment(tableId, {
        amount,
        date,
        time,
        note: newPayment.note.trim() || undefined
      });

      setNewPayment({ amount: '', note: '' });
      setShowPaymentForm(false);
      showToast('Uplata je uspešno dodata', 'success');
    } catch (error) {
      console.error('Error adding payment:', error);
      showToast('Greška pri dodavanju uplate', 'error');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-4 md:p-6 sticky top-0 z-20 shadow-lg" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3" style={{ color: '#FFFFFF' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Sto {table.number}
            </h1>
            <p className="text-sm md:text-base mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>
              Mesečno plaćanje - Detalji i uplate
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link 
              href="/waiter-admin/monthly-tables"
              className="px-4 py-2 rounded-lg transition-colors text-sm md:text-base flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Nazad
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

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-gray-800">{totalOrdersAmount.toFixed(2)} RSD</div>
            <div className="text-sm md:text-base text-gray-600">Ukupno porudžbina</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-gray-800">{totalPayments.toFixed(2)} RSD</div>
            <div className="text-sm md:text-base text-gray-600">Ukupno uplaćeno</div>
          </div>
          <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-lg shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-gray-800">{Math.abs(remaining).toFixed(2)} RSD</div>
            <div className="text-sm md:text-base text-gray-600">
              {remaining > 0 ? 'Ostatak (duguje)' : 'Preplaćeno'}
            </div>
          </div>
        </div>

        {/* Dugme za dodavanje uplate */}
        <div className="mb-6">
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="px-6 py-3 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#4CAF50' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Dodaj uplatu
          </button>
        </div>

        {/* Forma za dodavanje uplate */}
        {showPaymentForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Nova uplata</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Iznos (RSD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Napomena (opciono)</label>
                <input
                  type="text"
                  value={newPayment.note}
                  onChange={(e) => setNewPayment({...newPayment, note: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Npr. Uplata za januar"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddPayment}
                className="px-6 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                Sačuvaj uplatu
              </button>
              <button
                onClick={() => {
                  setShowPaymentForm(false);
                  setNewPayment({ amount: '', note: '' });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Otkaži
              </button>
            </div>
          </div>
        )}

        {/* Istorija uplata */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Istorija uplata
          </h2>
          {!table.monthlyPayments || table.monthlyPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p>Nema zabeleženih uplata</p>
            </div>
          ) : (
            <div className="space-y-3">
              {table.monthlyPayments
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time}`);
                  const dateB = new Date(`${b.date}T${b.time}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .map(payment => (
                  <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-800">{payment.amount.toFixed(2)} RSD</div>
                      <div className="text-sm text-gray-600">
                        {formatDateTime(payment.date, payment.time)}
                      </div>
                      {payment.note && (
                        <div className="text-xs text-gray-700 mt-1 italic">{payment.note}</div>
                      )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: '#4CAF50' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Istorija porudžbina */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Istorija porudžbina
          </h2>
          {tableOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>Nema porudžbina za ovaj sto</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tableOrders
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time}`);
                  const dateB = new Date(`${b.date}T${b.time}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .map(order => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-800">
                          Porudžbina #{order.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDateTime(order.date, order.time)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Status: {order.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800">{order.total} RSD</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="text-sm font-medium text-gray-700 mb-2">Stavke:</div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-600">
                            <span>
                              {item.name} × {item.quantity}
                              {item.comment && (
                                <span className="text-xs text-blue-600 italic ml-2">({item.comment})</span>
                              )}
                            </span>
                            <span>{item.price * item.quantity} RSD</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

