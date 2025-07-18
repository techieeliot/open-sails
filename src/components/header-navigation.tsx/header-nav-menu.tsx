'use client';

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { useAtomValue } from 'jotai';
import { User, Settings, LogOut, LogIn, Rocket } from 'lucide-react';
import Image from 'next/image';
import { userSessionAtom } from '@/lib/atoms';

export function HeaderNavMenu() {
  const userSession = useAtomValue(userSessionAtom);
  const isLoggedIn = !!userSession.user;

  return (
    <NavigationMenu className="hidden md:flex w-full items-center justify-between px-8 py-2">
      <NavigationMenuList className="flex items-center gap-4">
        <NavigationMenuItem>
          <NavigationMenuLink href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="hidden md:inline">Open Sails</span>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/dashboard" className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            <span>Dashboard</span>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {isLoggedIn && (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink href="/profile" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/settings" className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/logout" className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
        {!isLoggedIn && (
          <NavigationMenuItem>
            <NavigationMenuLink href="/login" className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              <span>Login</span>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
