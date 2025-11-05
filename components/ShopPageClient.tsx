'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductFilter from '@/components/ProductFilter';

export type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number | string | null;
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

type Props = {
  title: string;
  description: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctas?: Array<{ label: string; href: string }>;
};

function categorizeProduct(product: Product): string {
  const name = product.name.toLowerCase();
  const description = product.description?.toLowerCase() || '';
  const text = `${name} ${description}`;

  if (text.includes('cookie') || text.includes('biscuit')) return 'Cookies';
  if (text.includes('cake') || text.includes('cupcake')) return 'Cakes';
  if (text.includes('muffin')) return 'Muffins';
  if (text.includes('bread') || text.includes('loaf')) return 'Breads';
  if (text.includes('pie') || text.includes('tart')) return 'Pies & Tarts';
  if (text.includes('brownie') || text.includes('bar')) return 'Brownies & Bars';
  if (text.includes('pastry') || text.includes('croissant') || text.includes('danish')) return 'Pastries';
  if (text.includes('donut') || text.includes('doughnut')) return 'Donuts';

  return 'Other';
}

async function fetchProducts(): Promise<{ items: Product[] }> {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' });
    if (!res.ok) return { items: [] };
    return res.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { items: [] };
  }
}

export default function ShopPageClient({ title, description, ctaTitle, ctaDescription, ctas }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadProducts = async () => {
      const { items } = await fetchProducts();
      setProducts(items);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    if (products.length === 0) return ['All'];
    const unique = Array.from(new Set(products.map(categorizeProduct))).sort();
    return ['All', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter((product) => categorizeProduct(product) === selectedCategory);
  }, [products, selectedCategory]);

  if (loading) {
    return (
      <section className="container py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-6" style={{ lineHeight: '1.2', paddingBottom: '0.25rem' }}>
            {title}
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">Loading our delicious collection...</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-6" style={{ lineHeight: '1.2', paddingBottom: '0.25rem' }}>
          {title}
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">{description}</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-accent/20 to-brand/10 rounded-2xl flex items-center justify-center">
            <svg className="w-16 h-16 text-brand/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Products Available</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            We&apos;re currently updating our product catalog. Please check back soon or contact us directly for special orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {(ctas && ctas.length ? ctas : [
              { label: 'Refresh Catalog', href: '#' },
              { label: 'Contact Us', href: '/contact' },
            ]).map((cta, index) =>
              cta.href === '#' ? (
                <button key={`${cta.label}-${index}`} onClick={() => window.location.reload()} className="btn btn-brand">
                  {cta.label}
                </button>
              ) : (
                <a
                  key={cta.href}
                  href={cta.href}
                  className={
                    index === 0
                      ? 'btn btn-brand'
                      : 'btn bg-white border border-brand/20 text-brand hover:bg-brand/5'
                  }
                >
                  {cta.label}
                </a>
              )
            )}
          </div>
        </div>
      ) : (
        <>
          <ProductFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            productCount={filteredProducts.length}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.map((product, index) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 75}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && selectedCategory !== 'All' && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-accent/20 to-brand/10 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-brand/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No {selectedCategory} Found</h3>
              <p className="text-gray-500 mb-6">
                We don&apos;t have any {selectedCategory.toLowerCase()} available right now. Check back soon or try another category!
              </p>
              <button onClick={() => setSelectedCategory('All')} className="btn btn-brand">
                View All Products
              </button>
            </div>
          )}

          <div className="mt-16 text-center">
            <div className="card p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-3">{ctaTitle || 'Looking for something special?'}</h3>
              <p className="text-gray-600 mb-6">
                {ctaDescription ||
                  'We create custom cakes and treats for birthdays, weddings, and special occasions. Contact us to discuss your perfect dessert!'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(ctas && ctas.length ? ctas : [
                  { label: 'Request Custom Order', href: '/contact' },
                ]).map((cta, index) => (
                  <a
                    key={cta.href}
                    href={cta.href}
                    className={
                      index === 0
                        ? 'btn btn-brand'
                        : 'btn bg-white border border-brand/20 text-brand hover:bg-brand/5'
                    }
                  >
                    {cta.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
