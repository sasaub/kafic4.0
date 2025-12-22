'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(username, password);
      
      if (success) {
        // Sačekaj malo da se state ažurira
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirektuj na osnovu korisničkog imena
        if (username === 'admin') {
          router.push('/admin');
        } else if (username === 'konobaradmin') {
          router.push('/waiter-admin');
        } else if (username === 'kuhinja') {
          router.push('/kitchen');
        } else {
          router.push('/waiter');
        }
      } else {
        setError('Pogrešno korisničko ime ili lozinka');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Greška pri prijavljivanju. Pokušajte ponovo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍽️ QR Restoran</h1>
          <p className="text-gray-600">Prijavite se na sistem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Korisničko ime
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Unesite lozinku"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Prijavi se
          </button>
        </form>


        <div className="mt-6 text-center">
          <a href="/" className="text-orange-600 hover:text-orange-700 font-semibold">
            ← Nazad na početnu
          </a>
        </div>
      </div>
    </div>
  );
} 