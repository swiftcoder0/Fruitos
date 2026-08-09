import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
      <div className="text-center max-w-md w-full">
        {/* Logo / Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-amber-700 mb-2">🌱 FreshOS</h1>
          <p className="text-gray-600 text-lg">AI Decision Intelligence for Fresh Produce</p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-4">
          <Link
            href="/farmer"
            className="block w-full bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-2 border-transparent hover:border-amber-300"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🧑‍🌾</span>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-800">Farmer</h2>
                <p className="text-sm text-gray-500">Register crops, harvest, and manage your produce</p>
              </div>
              <span className="ml-auto text-amber-500">→</span>
            </div>
          </Link>

          <Link
            href="/operator"
            className="block w-full bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-2 border-transparent hover:border-blue-300"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📷</span>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-800">Operator</h2>
                <p className="text-sm text-gray-500">Scan QR codes, inspect quality, and log events</p>
              </div>
              <span className="ml-auto text-blue-500">→</span>
            </div>
          </Link>

          <Link
            href="/manager"
            className="block w-full bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-2 border-transparent hover:border-purple-300"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📊</span>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-800">Manager</h2>
                <p className="text-sm text-gray-500">Monitor batches, get decisions, and take action</p>
              </div>
              <span className="ml-auto text-purple-500">→</span>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-400">
          Hackathon MVP · Built with ❤️ for Fresh Produce
        </div>
      </div>
    </div>
  );
}