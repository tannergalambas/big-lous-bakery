'use client';

import { useMemo, useState } from 'react';
import { useCart } from '@/store/cart';

type Variation = {
  id: string;
  name?: string;
  price?: number | string | null;
  currency?: string;
  image?: string | null;
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

// normalize price to a number every time
function coercePrice(p?: number | string | null): number {
  if (typeof p === 'number') return p;
  if (typeof p === 'string') {
    const n = parseFloat(p);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function AddToCartClient({
  product,
  variations,
}: {
  product: Product;
  variations?: Variation[]; // ← optional
}) {
  const add = useCart((s) => s.add);

  // If no variations provided, synthesize one from the product price
  const options = useMemo<Variation[]>(
    () =>
      (variations && variations.length > 0
        ? variations
        : [
            {
              id: product.id,
              name: 'Default',
              price: product.price,
              currency: product.currency ?? 'USD',
            },
          ]) as Variation[],
    [variations, product.id, product.price, product.currency]
  );

  const [selectedVariationId, setSelectedVariationId] = useState<string>(options[0]?.id ?? product.id);
  const [qty, setQty] = useState(1);

  const selected =
    options.find((v) => v.id === selectedVariationId) ?? options[0];

  const unitPrice = coercePrice(selected?.price ?? product.price);
  const currency = selected?.currency ?? product.currency ?? 'USD';
  const image = (selected?.image ?? product.image) ?? null;
  const resolvedVariationId = selected?.id ?? product.id;

  function handleAdd() {
    add({
      id: `${product.id}:${resolvedVariationId}`,
      productId: product.id,
      variationId: resolvedVariationId,
      name:
        product.name +
        (selected?.name && selected.name !== 'Default' ? ` — ${selected.name}` : ''),
      price: unitPrice, // ← always a number
      qty,
      image,
      currency,
    });
  }

  return (
    <div className="space-y-4">
      {options.length > 1 && (
        <>
          <label className="block text-sm">Select option</label>
          <select
            value={selectedVariationId}
            onChange={(e) => setSelectedVariationId(e.target.value)}
            className="input w-full max-w-sm"
          >
            {options.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name ?? 'Default'} — {currency} {coercePrice(v.price).toFixed(2)}
              </option>
            ))}
          </select>
        </>
      )}

      <label className="block text-sm">Quantity</label>
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        className="input w-24"
      />

      <button type="button" onClick={handleAdd} className="btn btn-brand">
        Add to Cart
      </button>
    </div>
  );
}
