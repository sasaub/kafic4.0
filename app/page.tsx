export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          QR Restoran
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Dobrodošli u moderan sistem za naručivanje putem QR koda
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="/guest"
            className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg"
          >
            🍽️ Gost
          </a>
          <a
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            👨‍🍳 Konobar
          </a>
          <a
            href="/login"
            className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors shadow-lg"
          >
            ⚙️ Admin
          </a>
        </div>
        <p className="text-gray-600 mt-6 text-sm">
          Konobar i Admin zahtevaju prijavu
        </p>
      </div>
    </div>
  );
} 