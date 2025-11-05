'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/store/cart';

type Product = {
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

function getSafeImage(src?: string | null) {
  if (typeof src !== 'string') return null;
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\//i, 'https://');
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return null;
}

function formatMoney(
  v: number | string | null | undefined,
  currency = 'USD'
) {
  const n =
    typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(n);
}

export default function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const add = useCart((s) => s.add);

  const safeImage = getSafeImage(product.image);
  const isRemoteSquareImage =
    typeof safeImage === 'string' &&
    safeImage.startsWith('https://items-images-');

  const defaultVariation = product.variations?.[0];
  const rawPrice = defaultVariation?.price ?? product.price ?? 0;
  const price =
    typeof rawPrice === 'string'
      ? Number(rawPrice)
      : typeof rawPrice === 'number'
        ? rawPrice
        : 0;
  const currency = defaultVariation?.currency ?? product.currency ?? 'USD';
  const variationId = defaultVariation?.id ?? product.id;
  const cartImage = getSafeImage(defaultVariation?.image) ?? safeImage ?? null;
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    // Add to cart
    add({
      id: `${product.id}:${variationId}`,
      productId: product.id,
      variationId,
      name: product.name,
      price: price,
      currency,
      qty: 1,
      image: cartImage,
    });

    // Brief animation feedback
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <div 
      className="group relative rounded-2xl border border-accent/20 p-4 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-2xl product-card-enhanced hover-glow overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl`}></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer rounded-2xl"></div>
      </div>

      <div className="relative z-10">
        {/* Image and badges - clickable to product page */}
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-cream/30 to-accent/20 mb-4 shadow-inner">
            {safeImage ? (
              <>
                <Image
                  src={safeImage}
                  alt={product.name || 'Product image'}
                  fill
                  className={`object-cover transition-all duration-700 ease-out ${imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'} group-hover:scale-110`}
                  sizes="(min-width:1024px) 25vw, 50vw"
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                  style={{ objectFit: 'cover' }}
                  unoptimized={isRemoteSquareImage}
                />
                
                {/* Overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                
                {/* Animated corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></div>
              </>
            ) : (
              <div className="grid place-items-center h-full text-sm opacity-60 bg-gradient-to-br from-cream to-accent/30">
                <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300 ${isHovered ? 'bg-brand/40 animate-glow' : 'bg-accent/40'}`}>
                    <svg className={`w-6 h-6 transition-all duration-300 ${isHovered ? 'text-white' : 'text-brand/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className={`transition-colors duration-300 ${isHovered ? 'text-brand' : ''}`}>No image</span>
                </div>
              </div>
            )}
            
            {/* Enhanced overlay badge with animation */}
            <div className={`absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-brand shadow-lg transition-all duration-300 ${isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'}`}>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </span>
            </div>

            {/* Floating quality badge */}
            <div className={`absolute bottom-3 left-3 bg-gradient-to-r from-brand to-brand/80 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg transition-all duration-300 ${isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}>
              Fresh Made to Order
            </div>
          </div>
        </Link>

        <div className="space-y-3">
          {/* Product name - clickable to product page */}
          <Link href={`/products/${product.id}`}>
            <h3 className={`font-semibold text-gray-900 line-clamp-1 transition-all duration-300 hover:text-brand cursor-pointer ${isHovered ? 'transform -translate-y-0.5' : ''}`}>
              {product.name || 'Untitled'}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold transition-all duration-300 ${isHovered ? 'text-brand scale-105' : 'text-brand/80'}`}>
              {formatMoney(price, currency)}
            </span>
            
            {/* Add to Cart Button - NOT clickable to product page */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label={`Add ${product.name} to cart`}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isAdding 
                  ? 'bg-green-500 text-white' 
                  : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
              }`}
            >
              {isAdding ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              
              {/* Success ripple effect */}
              {isAdding && (
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
