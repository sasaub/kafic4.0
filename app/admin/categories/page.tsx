'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ToastProvider';
import Link from 'next/link';

export default function CategoriesPage() {
  const { user, logout, isLoading } = useAuth();
  const { categories, addCategory, deleteCategory } = useMenu();
  const { showToast } = useToast();
  const router = useRouter();
  
  // HOOKS na vrhu!
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'Hrana' as 'Hrana' | 'Piće' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

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
    return null;
  }

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      showToast('Unesite naziv kategorije', 'warning');
      return;
    }

    // Proveri da li kategorija već postoji
    if (categories.find(c => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
      showToast('Kategorija sa tim imenom već postoji', 'warning');
      return;
    }

    try {
      await addCategory(newCategory);
      setNewCategory({ name: '', type: 'Hrana' });
      setShowAddForm(false);
      showToast('Kategorija je uspešno dodata', 'success');
    } catch (error) {
      console.error('Error adding category:', error);
      showToast('Greška pri dodavanju kategorije', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      setShowDeleteConfirm(null);
      showToast('Kategorija je uspešno obrisana', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Greška pri brisanju kategorije', 'error');
    }
  };

  const foodCategories = categories.filter(c => c.type === 'Hrana');
  const drinkCategories = categories.filter(c => c.type === 'Piće');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>Upravljanje Kategorijama</h1>
            <p className="mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>Dodajte ili obrišite kategorije menija</p>
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
        {/* Dodaj kategoriju dugme */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 text-white rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: '#4CAF50' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          >
            + Dodaj novu kategoriju
          </button>
        </div>

        {/* Forma za dodavanje */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Nova kategorija</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Naziv kategorije</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Npr. Pizza, Pasta, Vina..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tip</label>
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({...newCategory, type: e.target.value as 'Hrana' | 'Piće'})}
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
                  <option value="Hrana">Hrana</option>
                  <option value="Piće">Piće</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddCategory}
                className="px-6 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                Sačuvaj
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Otkaži
              </button>
            </div>
          </div>
        )}

        {/* Kategorije Hrana */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Hrana</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {foodCategories.map(category => (
              <div key={category.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-gray-500 hover:text-gray-700 font-bold px-2 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kategorije Piće */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Piće</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {drinkCategories.map(category => (
              <div key={category.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-gray-500 hover:text-gray-700 font-bold px-2 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-bold mb-4">Potvrda brisanja</h3>
            <p className="mb-6">Da li ste sigurni da želite da obrišete ovu kategoriju? Sva jela u ovoj kategoriji će biti obrisana!</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Otkaži
              </button>
              <button
                onClick={() => confirmDeleteCategory(showDeleteConfirm)}
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#EF4444' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 