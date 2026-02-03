'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ToastProvider';
import Link from 'next/link';

export default function AdminMenuPage() {
  const { user, logout, isLoading } = useAuth();
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu(); // Koristi globalni meni
  const { showToast } = useToast();
  const router = useRouter();
  
  // HOOKS na vrhu!
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    category: categories[0]?.name || 'Glavna jela'
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Pristup odbijen</div>
      </div>
    );
  }

  const deleteItem = async (id: number) => {
    try {
      await deleteMenuItem(id);
      showToast('Stavka je uspešno obrisana', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('Greška pri brisanju stavke', 'error');
    }
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.price) {
      showToast('Unesite naziv i cenu jela', 'warning');
      return;
    }
    
    try {
      await addMenuItem(newItem);
      setNewItem({ name: '', description: '', price: 0, category: categories[0]?.name || 'Glavna jela' });
      setShowAddForm(false);
      showToast('Stavka je uspešno dodata', 'success');
    } catch (error) {
      console.error('Error adding item:', error);
      showToast('Greška pri dodavanju stavke', 'error');
    }
  };

  const startEdit = (item: typeof menuItems[0]) => {
    setEditingItem(item.id);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category
    });
    setShowAddForm(true);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    if (!newItem.name || !newItem.price) {
      showToast('Unesite naziv i cenu jela', 'warning');
      return;
    }
    
    try {
      await updateMenuItem(editingItem, newItem);
      setEditingItem(null);
      setNewItem({ name: '', description: '', price: 0, category: categories[0]?.name || 'Glavna jela' });
      setShowAddForm(false);
      showToast('Stavka je uspešno ažurirana', 'success');
    } catch (error) {
      console.error('Error updating item:', error);
      showToast('Greška pri ažuriranju stavke', 'error');
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setNewItem({ name: '', description: '', price: 0, category: categories[0]?.name || 'Glavna jela' });
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>Upravljanje Menijem</h1>
            <p className="mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>Dodajte, izmenite ili obrišite jela</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Nazad
            </Link>
            <button 
              onClick={logout}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              Odjavi se
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Dugme za dodavanje i pretraga */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => {
              if (editingItem) {
                cancelEdit();
              } else {
                setShowAddForm(!showAddForm);
              }
            }}
            className="px-6 py-3 text-white rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: '#4CAF50' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          >
            {editingItem ? 'Otkaži izmenu' : '+ Dodaj novo jelo'}
          </button>
          <a
            href="/admin/categories"
            className="px-6 py-3 text-white rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: '#1F7A5A' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6b4f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F7A5A'}
          >
            Kategorije
          </a>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pretraži jela..."
            className="flex-1 min-w-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-colors"
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

        {/* Forma za dodavanje/izmenu */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Izmeni jelo' : 'Novo jelo'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Naziv</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Npr. Ćevapi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kategorija</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Opis</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  rows={3}
                  placeholder="Kratki opis jela"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cena (RSD)</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={editingItem ? saveEdit : addItem}
                className="px-6 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                {editingItem ? 'Sačuvaj izmene' : 'Sačuvaj'}
              </button>
              <button
                onClick={editingItem ? cancelEdit : () => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Otkaži
              </button>
            </div>
          </div>
        )}

        {/* Lista jela po kategorijama */}
        {categories.map(category => {
          // Filter po kategoriji i search termu
          const items = menuItems.filter(item => 
            item.category === category.name &&
            (searchTerm === '' || 
             item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          if (items.length === 0) return null;
          
          return (
            <div key={category.id} className="mb-6">
              <h2 className="text-2xl font-bold mb-4">
                {category.name}
              </h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">Naziv</th>
                      <th className="px-6 py-3 text-left">Opis</th>
                      <th className="px-6 py-3 text-left">Cena</th>
                      <th className="px-6 py-3 text-left">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-t">
                        <td className="px-6 py-4 font-semibold">{item.name}</td>
                        <td className="px-6 py-4 text-gray-600">{item.description}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">{item.price} RSD</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="px-4 py-2 text-white rounded-lg transition-colors"
                              style={{ backgroundColor: '#1F7A5A' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6b4f'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F7A5A'}
                            >
                              Izmeni
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="px-4 py-2 text-white rounded-lg transition-colors"
                              style={{ backgroundColor: '#EF4444' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                            >
                              Obriši
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 