import Link from 'next/link';
import Image from 'next/image';
import { UserNavigation } from '@/components/user-navigation';

export default function TopNavigation() {
  return (
    <header className="fixed w-full z-50 dark:bg-zinc-900 bg-zinc-100">
      <div className="flex items-center justify-between shadow-md">
        <div className="min-w-xl">
          <nav className="flex items-center px-12 h-20">
            <Link href="/" className="text-2xl font-bold w-2xs flex items-center justify-center">
              Open Sails
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={30}
                  height={30}
                  className="h-auto w-auto"
                />
              </div>
            </Link>
          </nav>
        </div>
        <UserNavigation />
      </div>
    </header>
  );
}
