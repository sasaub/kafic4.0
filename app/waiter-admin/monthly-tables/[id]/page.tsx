'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTables, MonthlyPayment } from '../../../context/TablesContext';
import { useOrders, Order } from '../../../context/OrderContext';
import { useRouter, useParams } from 'next/navigation';
import { formatDateTime } from '../../../utils/dateFormat';

export default function MonthlyTableDetailPage() {
  const { user, logout, isLoading } = useAuth();
  const { tables, addMonthlyPayment } = useTables();
  const { orders } = useOrders();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl font-semibold mb-2">Sto nije pronađen</p>
          <a href="/waiter-admin/monthly-tables" className="text-blue-600 hover:underline">
            ← Nazad na mesečne stolove
          </a>
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

  const handleAddPayment = () => {
    const amount = parseFloat(newPayment.amount);
    if (!amount || amount <= 0) {
      alert('Unesite validan iznos');
      return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    addMonthlyPayment(tableId, {
      amount,
      date,
      time,
      note: newPayment.note.trim() || undefined
    });

    setNewPayment({ amount: '', note: '' });
    setShowPaymentForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 md:p-6 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">📅 Sto {table.number}</h1>
            <p className="text-gray-300 text-sm md:text-base">
              Mesečno plaćanje - Detalji i uplate
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <a 
              href="/waiter-admin/monthly-tables"
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base"
            >
              ← Nazad
            </a>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base"
            >
              Odjavi se
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500 text-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="text-2xl md:text-3xl font-bold">{totalOrdersAmount.toFixed(2)} RSD</div>
            <div className="text-sm md:text-base opacity-90">Ukupno porudžbina</div>
          </div>
          <div className="bg-green-500 text-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="text-2xl md:text-3xl font-bold">{totalPayments.toFixed(2)} RSD</div>
            <div className="text-sm md:text-base opacity-90">Ukupno uplaćeno</div>
          </div>
          <div className={`${remaining > 0 ? 'bg-red-500' : 'bg-green-500'} text-white p-4 md:p-6 rounded-lg shadow-md`}>
            <div className="text-2xl md:text-3xl font-bold">{Math.abs(remaining).toFixed(2)} RSD</div>
            <div className="text-sm md:text-base opacity-90">
              {remaining > 0 ? 'Ostatak (duguje)' : 'Preplaćeno'}
            </div>
          </div>
        </div>

        {/* Dugme za dodavanje uplate */}
        <div className="mb-6">
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            + Dodaj uplatu
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Napomena (opciono)</label>
                <input
                  type="text"
                  value={newPayment.note}
                  onChange={(e) => setNewPayment({...newPayment, note: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Npr. Uplata za januar"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddPayment}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">💳 Istorija uplata</h2>
          {!table.monthlyPayments || table.monthlyPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💳</div>
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
                  <div key={payment.id} className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <div className="font-semibold text-green-800">{payment.amount.toFixed(2)} RSD</div>
                      <div className="text-sm text-green-600">
                        {formatDateTime(payment.date, payment.time)}
                      </div>
                      {payment.note && (
                        <div className="text-xs text-green-700 mt-1 italic">{payment.note}</div>
                      )}
                    </div>
                    <div className="text-2xl">✅</div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Istorija porudžbina */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">🍽️ Istorija porudžbina</h2>
          {tableOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🍽️</div>
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

