'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Search,
  Settings,
  LogOut,
  Home,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Research',
    href: '/research',
    icon: Search,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch {
      toast.info('Supabase not configured', {
        description: 'Auth is not available without Supabase configuration.',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2.5 h-auto">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">
              LS
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium text-slate-900">Liz Sears</span>
            <span className="text-xs text-slate-500">liz@utahseliterealtors.com</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-slate-900">UER Content</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">UER Content</span>
                  <span className="text-xs text-slate-500">Content Planner</span>
                </div>
              </div>
              <NavContent onLinkClick={() => setMobileOpen(false)} />
              <div className="border-t border-slate-200 p-3">
                <UserMenu />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
          <div className="p-2 bg-slate-900 rounded-lg">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">Utah&apos;s Elite</span>
            <span className="text-xs text-slate-500">Content Planner</span>
          </div>
        </div>
        <NavContent />
        <div className="border-t border-slate-200 p-3">
          <UserMenu />
        </div>
      </aside>
    </>
  );
}
