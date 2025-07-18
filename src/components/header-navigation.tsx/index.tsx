import { ResponsiveHeaderNavigation } from './components';
import { HeaderNavMenu } from './header-nav-menu';

export default function HeaderNavigation() {
  return (
    <header className="fixed z-50 w-full bg-zinc-100 dark:bg-zinc-900">
      <HeaderNavMenu />
      <ResponsiveHeaderNavigation />
    </header>
  );
}
