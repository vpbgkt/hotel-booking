import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

/**
 * Footer Component
 * 
 * Responsive footer with:
 * - Company information
 * - Quick links
 * - Social media links
 * - Contact information
 * - Copyright notice
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container-app py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-white">BlueStay</span>
            </Link>

            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Discover and book the best hotels across India. We connect you
              directly with hotels for the best prices and experience.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <SocialLink href="https://facebook.com" label="Facebook">
                <Facebook size={18} />
              </SocialLink>
              <SocialLink href="https://twitter.com" label="Twitter">
                <Twitter size={18} />
              </SocialLink>
              <SocialLink href="https://instagram.com" label="Instagram">
                <Instagram size={18} />
              </SocialLink>
              <SocialLink href="https://linkedin.com" label="LinkedIn">
                <Linkedin size={18} />
              </SocialLink>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <FooterLink href="/hotels">Find Hotels</FooterLink>
              <FooterLink href="/offers">Special Offers</FooterLink>
              <FooterLink href="/destinations">Destinations</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </ul>
          </div>

          {/* For Hotels */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Hotels</h4>
            <ul className="space-y-3">
              <FooterLink href="/for-hotels">List Your Property</FooterLink>
              <FooterLink href="/partner-login">Partner Login</FooterLink>
              <FooterLink href="/partner-support">Partner Support</FooterLink>
              <FooterLink href="/success-stories">Success Stories</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:support@bluestay.in"
                  className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                >
                  <Mail size={16} className="shrink-0" />
                  <span>support@bluestay.in</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919999999999"
                  className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                >
                  <Phone size={16} className="shrink-0" />
                  <span>+91 99999 99999</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span>
                    123 Business Park,
                    <br />
                    Mumbai, Maharashtra 400001
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h4 className="text-white font-semibold mb-4">Popular Destinations</h4>
          <div className="flex flex-wrap gap-2">
            {[
              "Goa",
              "Mumbai",
              "Delhi",
              "Jaipur",
              "Udaipur",
              "Kerala",
              "Manali",
              "Shimla",
              "Ooty",
              "Rishikesh",
              "Varanasi",
              "Agra",
            ].map((city) => (
              <Link
                key={city}
                href={`/hotels/${city.toLowerCase()}`}
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
              >
                Hotels in {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-gray-400">
              © {currentYear} BlueStay. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/refund"
                className="hover:text-white transition-colors"
              >
                Refund Policy
              </Link>
            </div>
            <p className="flex items-center gap-1 text-gray-400">
              Made with <Heart size={14} className="text-red-500 fill-red-500" />{" "}
              in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Social Link Component
 */
function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full bg-gray-800 hover:bg-brand-600 flex items-center justify-center transition-colors"
    >
      {children}
    </a>
  );
}

/**
 * Footer Link Component
 */
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm hover:text-white transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
