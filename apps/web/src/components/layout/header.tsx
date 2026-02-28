"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  User,
  Phone,
  ChevronDown,
  MapPin,
  Building2,
  LogOut,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * Header Component for BlueStay Aggregator
 * 
 * Features:
 * - Sticky navigation with blur effect on scroll
 * - Mobile hamburger menu with animated drawer
 * - Search bar integration
 * - Quick access to popular destinations
 */
export function Header() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Handle scroll effect for header background
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-transparent"
        )}
      >
        {/* Top bar - Contact info (desktop only) */}
        <div
          className={cn(
            "hidden lg:block border-b transition-all duration-300",
            isScrolled
              ? "border-gray-100 bg-gray-50/80"
              : "border-white/10 bg-white/5"
          )}
        >
          <div className="container-app">
            <div className="flex items-center justify-between h-10 text-sm">
              <div className="flex items-center gap-6">
                <a
                  href="tel:+919999999999"
                  className={cn(
                    "flex items-center gap-1.5 hover:text-brand-600 transition-colors",
                    isScrolled ? "text-gray-600" : "text-gray-700"
                  )}
                >
                  <Phone size={14} />
                  <span>+91 99999 99999</span>
                </a>
                <span
                  className={cn(
                    isScrolled ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  •
                </span>
                <span
                  className={cn(
                    isScrolled ? "text-gray-600" : "text-gray-700"
                  )}
                >
                  Best Price Guaranteed
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/for-hotels"
                  className={cn(
                    "flex items-center gap-1.5 hover:text-brand-600 transition-colors",
                    isScrolled ? "text-gray-600" : "text-gray-700"
                  )}
                >
                  <Building2 size={14} />
                  <span>List Your Property</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div className="container-app">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span
                className={cn(
                  "text-xl font-bold transition-colors",
                  isScrolled ? "text-gray-900" : "text-gray-900"
                )}
              >
                BlueStay
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <NavLink href="/hotels" isScrolled={isScrolled}>
                <MapPin size={16} />
                Explore Hotels
              </NavLink>
              <NavLink href="/offers" isScrolled={isScrolled}>
                Special Offers
              </NavLink>
              <NavLink href="/about" isScrolled={isScrolled}>
                About Us
              </NavLink>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-brand-700 font-medium text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {user.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown size={16} className={cn(
                      "text-gray-400 transition-transform",
                      showUserMenu && "rotate-180"
                    )} />
                  </button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowUserMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <LayoutDashboard size={16} />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/bookings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Building2 size={16} />
                            My Bookings
                          </Link>
                          <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User size={16} />
                            Profile
                          </Link>
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                logout();
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={16} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => router.push('/auth/login')}
                  >
                    <User size={18} />
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    className="shadow-lg shadow-brand-500/25"
                    onClick={() => router.push('/auth/register')}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X size={24} className="text-gray-900" />
              ) : (
                <Menu
                  size={24}
                  className={isScrolled ? "text-gray-900" : "text-gray-900"}
                />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 lg:hidden shadow-2xl"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                    <span className="text-white font-bold">B</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    BlueStay
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Mobile Menu Links */}
              <div className="p-4 space-y-1">
                <MobileNavLink
                  href="/hotels"
                  icon={<MapPin size={20} />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Explore Hotels
                </MobileNavLink>
                <MobileNavLink
                  href="/offers"
                  icon={<Search size={20} />}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Special Offers
                </MobileNavLink>
                <MobileNavLink
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </MobileNavLink>
                <MobileNavLink
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </MobileNavLink>

                <div className="pt-4 border-t border-gray-100 mt-4">
                  <MobileNavLink
                    href="/for-hotels"
                    icon={<Building2 size={20} />}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    List Your Property
                  </MobileNavLink>
                </div>
              </div>

              {/* Mobile Menu Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
                {isLoading ? (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                        <span className="text-brand-700 font-medium">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          router.push('/dashboard');
                        }}
                      >
                        <LayoutDashboard size={16} className="mr-2" />
                        Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/auth/login');
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/auth/register');
                      }}
                    >
                      Register
                    </Button>
                  </div>
                )}
                <a
                  href="tel:+919999999999"
                  className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600"
                >
                  <Phone size={14} />
                  <span>+91 99999 99999</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16 md:h-20 lg:h-[104px]" />
    </>
  );
}

/**
 * Desktop Navigation Link
 */
function NavLink({
  href,
  children,
  isScrolled,
}: {
  href: string;
  children: React.ReactNode;
  isScrolled: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand-600",
        isScrolled ? "text-gray-700" : "text-gray-700"
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Mobile Navigation Link
 */
function MobileNavLink({
  href,
  children,
  icon,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
    >
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
