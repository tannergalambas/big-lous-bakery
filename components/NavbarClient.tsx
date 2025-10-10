'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/store/cart';
import { useState, useEffect } from 'react';
import type { NavItem } from '@/lib/navigation';

interface NavbarClientProps {
  navigationItems: NavItem[];
  siteName?: string;
}

export default function NavbarClient({ navigationItems, siteName = "Big Lou's Bakery" }: NavbarClientProps) {
  const count = useCart((s) => s.count);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg border-b border-accent/30 shadow-lg' : 'bg-white/90 backdrop-blur-md border-b border-accent/20 shadow-sm'}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md bg-white">
            <Image
              src="/logo.jpeg"
              alt={siteName}
              fill
              className="object-contain"
              sizes="64px"
              priority
              quality={100}
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-brand to-brand/80 bg-clip-text text-transparent">
            {siteName}
          </span>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navigationItems.map((item) => (
            <Link 
              key={item.url}
              href={item.url} 
              className="relative py-2 px-3 text-gray-700 hover:text-brand transition-all duration-300 group"
            >
              <span className="relative z-10">
                {item.label}
              </span>
              
              {/* Simple hover underline */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand group-hover:w-full transition-all duration-200"></div>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-brand/10 transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Cart Button */}
        <Link href="/cart" className="btn btn-brand relative group" aria-label={`View cart with ${count} items`}>
          <span className="flex items-center gap-2">
            <div className="relative">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
              {count > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {count}
                </div>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
            <span className="sm:hidden">({count})</span>
          </span>
        </Link>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-accent/20 shadow-xl">
          <nav className="container mx-auto px-4 py-6 space-y-2">
            {navigationItems.map((item, index) => (
              <Link 
                key={item.url}
                href={item.url} 
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:text-brand hover:bg-brand/5 transition-all duration-200 group"
                style={{animationDelay: `${index * 100}ms`}}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon && (
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                )}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
