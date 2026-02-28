'use client';

/**
 * Dashboard Layout - BlueStay
 * Protected layout for authenticated user pages
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { 
  LayoutDashboard, 
  CalendarDays, 
  User, 
  Heart,
  Settings,
  CreditCard,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My Bookings',
    href: '/dashboard/bookings',
    icon: CalendarDays,
  },
  {
    label: 'Saved Hotels',
    href: '/dashboard/favorites',
    icon: Heart,
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
  {
    label: 'Payment Methods',
    href: '/dashboard/payments',
    icon: CreditCard,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="container-app py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900">My Account</h2>
                </div>
                <div className="border-t border-gray-100">
                  {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <Icon size={18} className={isActive ? 'text-brand-600' : 'text-gray-400'} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
