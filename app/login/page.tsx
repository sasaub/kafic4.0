'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const router = useRouter();

  // Rutiranje na osnovu role-a nakon logina
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'waiter-admin') {
        router.push('/waiter-admin');
      } else if (user.role === 'kitchen') {
        router.push('/kitchen');
      } else if (user.role === 'waiter') {
        router.push('/waiter');
      } else {
        // Fallback na waiter ako role nije prepoznat
        router.push('/waiter');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(username, password);
      
      if (!success) {
        setError('Pogrešno korisničko ime ili lozinka');
      }
      // Rutiranje će se desiti automatski kroz useEffect kada se user postavi
    } catch (error) {
      console.error('Login error:', error);
      setError('Greška pri prijavljivanju. Pokušajte ponovo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="p-6 rounded-t-xl" style={{ backgroundColor: '#2B2E34' }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#FFFFFF' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>QR Restoran</h1>
            </div>
            <p className="text-sm" style={{ color: '#FFFFFF', opacity: 0.8 }}>Prijavite se na sistem</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Korisničko ime
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-4CAF50 focus:ring-2 focus:ring-4CAF50 focus:outline-none transition-all"
                style={{ 
                  focusRingColor: '#4CAF50',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4CAF50';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Unesite korisničko ime"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lozinka
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-4CAF50 focus:ring-2 focus:ring-4CAF50 focus:outline-none transition-all"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4CAF50';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Unesite lozinku"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
              style={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
            >
              Prijavi se
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Nazad na početnu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 