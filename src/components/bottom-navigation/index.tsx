import { UserMenu } from '../user-menu';

export default function BottomNavigation() {
  return (
    <section className="pointer-events-auto fixed right-0 bottom-0 left-0 z-50 flex h-16 w-full touch-manipulation overflow-y-visible overscroll-contain bg-background shadow-md md:hidden">
      <UserMenu />
    </section>
  );
}
