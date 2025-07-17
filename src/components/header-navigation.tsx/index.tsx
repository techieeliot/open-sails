import { MainHeaderNav, ResponsiveHeaderNavigation } from './components';

export default function HeaderNavigation() {
  return (
    <header className="fixed w-full z-50 dark:bg-zinc-900 bg-zinc-100">
      <MainHeaderNav />
      <ResponsiveHeaderNavigation />
    </header>
  );
}
