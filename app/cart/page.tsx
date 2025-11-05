'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/store/cart';
import Breadcrumbs from '@/components/Breadcrumbs';

function fmt(amount: number, currency = 'USD') {
  // Store uses dollars. If you switch to cents later, use amount/100 here.
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default function CartPage() {
  const { items, add, remove, clear } = useCart();

  const subtotal = (items ?? []).reduce(
    (sum, i) => sum + (i.price || 0) * (i.qty || 0),
    0
  );
  const currency = items[0]?.currency ?? 'USD';

  const resolveCatalogObjectId = (item: (typeof items)[number]) => {
    if (!item) return '';
    if (item.variationId) return item.variationId;
    if (typeof item.id === 'string' && item.id.includes(':')) {
      const parts = item.id.split(':');
      const last = parts[parts.length - 1];
      if (last) return last;
    }
    if (item.productId) return item.productId;
    return typeof item.id === 'string' ? item.id : '';
  };

  return (
    <section className="container py-10">
      <Breadcrumbs items={[{ label: 'Cart', url: '/cart' }]} />
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link href="/shop" className="btn btn-brand mt-4">Go to Shop</Link>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 border-b pb-3">
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-md bg-neutral-200 grid place-items-center text-xs opacity-70">
                      No image
                    </div>
                  )}

                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm opacity-70">
                      {fmt(item.price, item.currency)} × {item.qty}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:border-brand/30 transition-all duration-200">
                    <button
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-white hover:bg-brand rounded-l-lg transition-all duration-200 font-bold text-lg"
                      onClick={() => {
                        if (item.qty > 1) add({ ...item, qty: -1 });
                        else remove(item.id);
                      }}
                    >
                      –
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center font-semibold text-lg bg-gray-50 border-x border-gray-200">
                      {item.qty}
                    </span>
                    <button 
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-white hover:bg-brand rounded-r-lg transition-all duration-200 font-bold text-lg"
                      onClick={() => add({ ...item, qty: 1 })}
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => remove(item.id)} 
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between mt-8">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md" 
              onClick={clear}
            >
              Clear Cart
            </button>

            <div className="text-right">
              <div className="text-lg font-semibold">
                Subtotal: {fmt(subtotal, currency)}
              </div>

              {/* Placeholder checkout */}
              <form
  action="/api/checkout"
  method="post"
  onSubmit={(e) => {
    // build the minimal payload for the API
    const preparedItems = items
      .map((i) => ({
        variationId: resolveCatalogObjectId(i),
        qty: i.qty,
        note: i.note,
        price: typeof i.price === 'number' ? i.price : Number(i.price) || null,
        currency: i.currency ?? 'USD',
      }))
      .filter((line) => line.variationId);

    if (preparedItems.length === 0) {
      e.preventDefault();
      alert('We could not determine the items to checkout. Please refresh the page and add your items again.');
      return;
    }

    const payload = JSON.stringify({
      items: preparedItems,
    });
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = payload;
    e.currentTarget.appendChild(input);
  }}
>
  <button className="btn btn-brand" type="submit">Checkout</button>
</form>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
