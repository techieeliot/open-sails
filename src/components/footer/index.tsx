import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="flex items-center justify-end p-4 shadow-md h-16 bg-zinc-900 text-white">
      <p className="text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Open Sails. All rights reserved.
      </p>
    </footer>
  );
}
