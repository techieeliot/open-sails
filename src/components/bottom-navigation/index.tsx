import { UserMenu } from '../user-menu';

export default function BottomNavigation() {
  return (
    <section className="fixed bottom-0 left-0 right-0 z-50 shadow-md flex md:hidden w-full bg-background pointer-events-auto touch-manipulation overscroll-contain overflow-y-visible h-16">
      <UserMenu />
    </section>
  );
}
