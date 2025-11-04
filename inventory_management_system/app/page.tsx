import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Logo/Icon */}
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
            Manage your brands and inventory efficiently with our simple, powerful system.
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-center text-base font-medium mt-8">
          <Link
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 text-white transition-colors hover:bg-blue-700 shadow-md"
            href="/brands"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            View Brands
          </Link>
        </div>
      </main>
    </div>
  );
}