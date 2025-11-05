'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  id: string;          // ui id, e.g. `${productId}:${variationId}`
  productId?: string;
  variationId?: string;
  name: string;
  price: number;        // dollars
  qty: number;
  note?: string;
  image?: string | null;
  currency?: string;
};

type CartState = {
  items: CartItem[];
  count: number;
  add: (item: CartItem) => void;  // pass { qty: 1 } to increment, { qty: -1 } to decrement
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          let next: CartItem[];

          if (existing) {
            const newQty = existing.qty + (item.qty ?? 1);
            next =
              newQty <= 0
                ? state.items.filter((i) => i.id !== item.id)
                : state.items.map((i) =>
                    i.id === item.id ? { ...i, qty: newQty } : i
                  );
          } else {
            next = [...state.items, { ...item, qty: item.qty ?? 1 }];
          }

          return { items: next, count: next.reduce((s, i) => s + i.qty, 0) };
        }),
      remove: (id) =>
        set((state) => {
          const next = state.items.filter((i) => i.id !== id);
          return { items: next, count: next.reduce((s, i) => s + i.qty, 0) };
        }),
      clear: () => set({ items: [], count: 0 }),
    }),
    {
      name: 'big-lous-cart',
      version: 1,
      migrate: (state: any, version: number) => {
        if (!state) return state;
        if (version < 1 && Array.isArray(state.items)) {
          const upgraded = state.items.map((item: any) => {
            if (!item || typeof item !== 'object') return item;
            const idString = typeof item.id === 'string' ? item.id : '';
            const parts = idString.split(':');
            const inferredProductId =
              typeof item.productId === 'string' && item.productId.trim()
                ? item.productId
                : parts[0] || undefined;
            const inferredVariationId =
              typeof item.variationId === 'string' && item.variationId.trim()
                ? item.variationId
                : parts.length > 1
                  ? parts[parts.length - 1]
                  : undefined;

            const fallbackId =
              typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

            const normalizedId =
              inferredProductId && inferredVariationId
                ? `${inferredProductId}:${inferredVariationId}`
                : idString || inferredProductId || inferredVariationId || fallbackId;

            return {
              ...item,
              id: normalizedId,
              productId: inferredProductId,
              variationId: inferredVariationId,
            };
          });

          return {
            ...state,
            items: upgraded,
            count: upgraded.reduce(
              (sum: number, item: any) => sum + (Number(item?.qty) || 0),
              0
            ),
          };
        }
        return state;
      },
    }
  )
);
