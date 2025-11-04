import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        
        <div className="flex flex-col items-center gap-6 text-center">
          
          
        </div>
        <div className="flex justify-center text-base font-medium">
           <Link
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-white transition-colors hover:bg-blue-700"
            href="/brands"
          >
            View Brands
          </Link>
          
          
        </div>
      </main>
    </div>
  );
}