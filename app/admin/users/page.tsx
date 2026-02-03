'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ToastProvider';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'waiter-admin' as 'waiter-admin' | 'waiter' | 'kitchen',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Greška pri učitavanju korisnika');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Greška pri učitavanju korisnika', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      showToast('Unesite korisničko ime i lozinku', 'warning');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Greška pri kreiranju korisnika');
      }

      showToast('Korisnik je uspešno kreiran', 'success');
      setNewUser({ username: '', password: '', role: 'waiter-admin' });
      setShowAddForm(false);
      fetchUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Greška pri kreiranju korisnika';
      console.error('Error creating user:', error);
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDeleteUser = async (id: number) => {
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Greška pri brisanju korisnika');

      showToast('Korisnik je uspešno obrisan', 'success');
      setShowDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Greška pri brisanju korisnika', 'error');
    }
  };

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'waiter-admin': return 'Konobar Admin';
      case 'waiter': return 'Konobar';
      case 'kitchen': return 'Kuhinja';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: '#2B2E34' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>Upravljanje Korisnicima</h1>
            <p className="mt-2" style={{ color: '#FFFFFF', opacity: 0.8 }}>Kreirajte i upravljajte nalozima</p>
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
        {/* Dodaj korisnika dugme */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 text-white rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: '#4CAF50' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          >
            + Dodaj novog korisnika
          </button>
        </div>

        {/* Forma za dodavanje */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Novi korisnik</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Korisničko ime</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Npr. konobar1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lozinka</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Lozinka"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Uloga</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'waiter-admin' | 'waiter' | 'kitchen'})}
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
                  <option value="waiter-admin">Konobar Admin</option>
                  <option value="waiter">Konobar</option>
                  <option value="kitchen">Kuhinja</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddUser}
                className="px-6 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                Sačuvaj
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewUser({ username: '', password: '', role: 'waiter-admin' });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Otkaži
              </button>
            </div>
          </div>
        )}

        {/* Lista korisnika */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Korisničko ime</th>
                <th className="px-6 py-3 text-left">Uloga</th>
                <th className="px-6 py-3 text-left">Kreiran</th>
                <th className="px-6 py-3 text-left">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-6 py-4">#{u.id}</td>
                  <td className="px-6 py-4 font-semibold">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(u.created_at).toLocaleDateString('sr-RS')}
                  </td>
                  <td className="px-6 py-4">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="px-4 py-2 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: '#EF4444' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                      >
                        Obriši
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-bold mb-4">Potvrda brisanja</h3>
            <p className="mb-6">Da li ste sigurni da želite da obrišete ovog korisnika? Ova akcija je nepovratna.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Otkaži
              </button>
              <button
                onClick={() => confirmDeleteUser(showDeleteConfirm)}
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
