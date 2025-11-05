// app/page.tsx
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import BrandTicker from '@/components/BrandTicker';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getHomepage } from '@/lib/cms';
import { headers, draftMode } from 'next/headers';

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: string | number | null;
  currency?: string;
  image?: string | null;
  variations?: Array<{
    id: string;
    name?: string;
    price?: number | string | null;
    currency?: string;
    image?: string | null;
  }>;
};

async function fetchProducts(): Promise<{ items: Product[] }> {
  // Build an absolute base URL from the request headers
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto =
    h.get('x-forwarded-proto') ??
    (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');

  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/products`, { cache: 'no-store' });
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    // Silently handle parsing errors in production
    return { items: [] };
  }
}

// (optional) ensure this page is always dynamic so it refetches on each request
export const dynamic = 'force-dynamic';

export default async function Page() {
  const preview = draftMode().isEnabled;
  const [{ items = [] }, homepage] = await Promise.all([
    fetchProducts(),
    getHomepage(preview),
  ]);

  const featuredHeading =
    homepage?.featuredHeading ?? 'Featured Products';
  const featuredDescription =
    homepage?.featuredDescription ??
    'Discover our most popular handcrafted treats, baked fresh daily with love and the finest ingredients.';

  const trustTitle = homepage?.trustTitle ?? 'Why choose Big Lou\'s Bakery?';
  const trustDescription =
    homepage?.trustDescription ??
    'We bake every item from scratch using family recipes, premium ingredients, and a whole lot of love.';

  const trustItems =
    homepage?.trustItems && homepage.trustItems.length > 0
      ? homepage.trustItems
      : [
          {
            title: 'Fresh Made to Order',
            description: 'Premium ingredients, scratch-made batches, and baked the day you order.',
          },
          {
            title: 'Local Pickup',
            description: 'Convenient Austin pickup windows that fit your schedule.',
          },
          {
            title: 'Custom Orders',
            description: 'From birthdays to weddings, we craft desserts that make every celebration sweeter.',
          },
        ];

  return (
    <div>
      <Hero
        title={homepage?.heroTitle}
        subtitle={homepage?.heroSubtitle}
        ctas={homepage?.ctas}
        image={homepage?.heroImage ?? '/C3D858C4-1D83-4665-A3B2-3711A3CA9BC5_4_5005_c.jpeg'}
        secondaryImage='/DC71389D-2882-4FFA-9953-764146A1FCB9_4_5005_c.jpeg'
      />

      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4" style={{ lineHeight: '1.2', paddingBottom: '0.25rem' }}>
            {featuredHeading}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">{featuredDescription}</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-accent/20 to-brand/10 rounded-full flex items-center justify-center group hover:scale-110 transition-all duration-300 animate-glow">
              <svg className="w-12 h-12 text-brand/60 group-hover:text-brand transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold gradient-text mb-4">No products yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Add items in your Square Sandbox and refresh to see your delicious products here.
            </p>
            <a
              href="/shop"
              className="btn btn-brand btn-enhanced hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Products
              </span>
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {items.slice(0, 8).map((p, index) => (
                <div 
                  key={p.id} 
                  className="animate-fade-in opacity-0" 
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            
            {items.length > 8 && (
              <div className="text-center mt-12 animate-fade-in" style={{animationDelay: '1s'}}>
                <a href="/shop" className="btn btn-brand btn-enhanced hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 relative group">
                  <span className="flex items-center gap-2 relative z-10">
                    View All Products
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand/80 to-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                </a>
              </div>
            )}
          </>
        )}
      </section>

      <BrandTicker />

      <section className="py-16 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">Hang out with us online</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Follow Big Lou&apos;s for pop-up announcements, fresh menu drops, and behind-the-scenes bakes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://www.instagram.com/biglousbakery"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @biglousbakery
            </a>
            <a
              href="https://www.tiktok.com/@biglousbakery"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
              @biglousbakery
            </a>
          </div>
        </div>
      </section>

      <NewsletterSignup
        title={homepage?.newsletterTitle}
        description={homepage?.newsletterDescription}
        highlights={homepage?.newsletterHighlights}
        buttonLabel={homepage?.newsletterButtonLabel}
        successTitle={homepage?.newsletterSuccessTitle}
        successDescription={homepage?.newsletterSuccessDescription}
      />

      {/* Trust indicators section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4" style={{ lineHeight: '1.2', paddingBottom: '0.25rem' }}>
            {trustTitle}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">{trustDescription}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {trustItems.map((item, index) => (
            <div key={item.title ?? index} className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brand/10 to-brand/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
