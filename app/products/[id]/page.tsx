// app/products/[id]/page.tsx
import Image from 'next/image';
import AddToCartClient from '@/components/AddToCartClient';
import { formatMoney } from '@/lib/money';
import { headers } from 'next/headers';
import Breadcrumbs from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic'; // avoid static paths generation in dev

type Variation = {
  id: string;
  name: string;
  price?: number | string | null;
  currency?: string;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number | string | null;
  currency?: string;
  image?: string | null;
  variations?: Variation[];
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

async function fetchProduct(id: string): Promise<Product | null> {
  // Build an absolute base URL from the request headers
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:5000';
  const proto =
    h.get('x-forwarded-proto') ??
    (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');

  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/products?id=${encodeURIComponent(id)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.item ?? null) as Product | null;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  if (!product) {
    return (
      <section className="container py-16">
        <p>Product not found.</p>
      </section>
    );
  }

  const variations: Variation[] =
    product.variations?.length
      ? product.variations
      : [
          {
            id: product.id,
            name: 'Default',
            price: product.price ?? 0,
            currency: product.currency ?? 'USD',
          },
        ];

  const price = Number(variations[0]?.price ?? product.price ?? 0);
  const currency = variations[0]?.currency ?? product.currency ?? 'USD';
  const safeImage = getSafeImage(product.image);
  const isRemoteSquareImage =
    typeof safeImage === 'string' && safeImage.startsWith('https://items-images-');

  return (
    <section className="container py-10">
      <Breadcrumbs items={[
        { label: 'Shop', url: '/shop' },
        { label: product.name, url: `/products/${product.id}` }
      ]} />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-accent/10">
          {safeImage ? (
            <Image
              src={safeImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width:1024px) 40vw, 90vw"
              priority
              style={{ objectFit: 'cover' }}
              unoptimized={isRemoteSquareImage}
            />
          ) : (
            <div className="grid place-items-center h-full opacity-60">No image</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          {product.description && (
            <p className="opacity-80 mb-4">{product.description}</p>
          )}

          {/* Price display */}
          <p className="text-xl font-semibold mb-4">
            {formatMoney ? formatMoney(price, currency) : `${currency} ${price.toFixed(2)}`}
          </p>

          {/* Client cart controls */}
          <AddToCartClient product={product} variations={variations} />
        </div>
      </div>
    </section>
  );
}
