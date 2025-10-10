import { getNavigation, getSiteSettings } from '@/lib/cms';
import { draftMode } from 'next/headers';
import Image from 'next/image';

export default async function Footer() {
  const preview = draftMode().isEnabled;
  const [settings, navigation] = await Promise.all([
    getSiteSettings(preview),
    getNavigation(preview),
  ]);

  const siteName = settings?.siteName ?? "Big Lou's Bakery";
  const tagline = settings?.tagline ??
    'Fresh-baked cookies, custom cakes, and delicious pies made with love and the finest ingredients.';
  const footerText = settings?.footerText ?? '© 2024 Big Lou\'s Bakery. All rights reserved.';
  const address = settings?.address ?? 'Austin, Texas';
  const email = settings?.email ?? 'hello@biglous.example';
  const phone = settings?.phone ?? '(512) 555-0134';
  const instagram = settings?.social?.instagram ?? 'https://www.instagram.com/biglousbakery';
  const tiktok = settings?.social?.tiktok ?? 'https://www.tiktok.com/@biglousbakery';

  const footerLinks = navigation?.footerLinks?.length
    ? navigation.footerLinks
    : [
        { label: 'Shop', url: '/shop' },
        { label: 'About', url: '/about' },
        { label: 'Contact', url: '/contact' },
        { label: 'FAQ', url: '/faq' },
      ];

  const quickLinks = footerLinks.slice(0, 4);

  return (
    <footer className="w-full bg-gradient-to-br from-green-800 to-green-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full" />
        <div className="absolute bottom-10 right-20 w-16 h-16 bg-white/15 rounded-full" />
        <div className="absolute top-1/2 right-10 w-12 h-12 bg-white/10 rounded-full" />
      </div>

      <div className="container py-12 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center shadow-lg">
                <Image src="/logo.jpeg" alt={siteName} fill className="object-contain" sizes="56px" quality={100} />
              </div>
              <h3 className="text-xl font-bold">{siteName}</h3>
            </div>
            <p className="text-white/80 leading-relaxed">{tagline}</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  className="block text-white/80 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact</h4>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${email}`} className="hover:text-white transition-colors duration-200">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2l.4 2M7 13h10l3-8H6.4m0 0L5 5m1.4 2l1.2 6m6.4 7a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <a href={`tel:${phone}`} className="hover:text-white transition-colors duration-200">
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-4">Follow Us</h4>
              <div className="flex items-center gap-4">
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="text-sm font-medium">Instagram</span>
                </a>

                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  <span className="text-sm font-medium">TikTok</span>
                </a>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-white/70 mb-2">Stay connected for updates</p>
              <p className="text-white/60 text-sm">Fresh content • Behind the scenes • Special offers</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/70">{footerText}</p>
          <div className="flex items-center gap-6 text-sm text-white/70">
            <span>Cookies • Cakes • Pies</span>
            <span>•</span>
            <span>Made with ❤️ locally</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
