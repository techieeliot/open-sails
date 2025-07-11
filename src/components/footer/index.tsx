import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="flex items-center justify-center p-4 shadow-md h-16 bg-zinc-900 text-white">
      <Image src="/logo.png" alt="Footer Logo" width={30} height={30} className="h-auto w-auto" />
    </footer>
  );
}
